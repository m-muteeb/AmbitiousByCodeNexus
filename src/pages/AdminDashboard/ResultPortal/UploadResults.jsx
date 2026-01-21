import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Table, Typography, Space, Divider, message, Upload, AutoComplete, Row, Col, Alert, Input } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { supabaseApi } from '../../../config/supabase';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;

const UploadResults = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    // Inputs
    const [sessionInput, setSessionInput] = useState('');
    const [sessionOptions, setSessionOptions] = useState([]);

    // Bulk Upload State
    const [tableData, setTableData] = useState([]);
    // Metadata for processing logic (indices, etc.)

    // Metadata for processing logic (indices, etc.)
    const [parsedMetaData, setParsedMetaData] = useState(null);

    useEffect(() => {
        loadSessionSuggestions();
    }, []);

    const loadSessionSuggestions = async () => {
        try {
            const sessions = await supabaseApi.fetch('result_sessions', 'order=created_at.desc');
            if (sessions) setSessionOptions(sessions.map(s => ({ value: s.name, label: s.name, id: s.id })));
        } catch (error) {
            console.error(error);
        }
    };

    // ================= HELPER FUNCTIONS =================

    const normalizeClassName = (rawName) => {
        if (!rawName) return '';
        let name = String(rawName).trim().toLowerCase();

        // Check if purely numeric
        if (/^\d+$/.test(name)) {
            const num = parseInt(name, 10);
            const remainder10 = num % 10;
            const remainder100 = num % 100;

            if (remainder10 === 1 && remainder100 !== 11) {
                return `${num}st`;
            } else if (remainder10 === 2 && remainder100 !== 12) {
                return `${num}nd`;
            } else if (remainder10 === 3 && remainder100 !== 13) {
                return `${num}rd`;
            } else {
                return `${num}th`;
            }
        }
        return name;
    };

    // ================= BULK UPLOAD LOGIC =================

    const downloadTemplate = () => {
        const coreHeaders = ['Roll #', 'Class', 'Name', "Father's Name", 'Physics', 'Chemistry', 'Math', 'Computer', 'Islamiyat', 'Pak Studies', 'Urdu', 'English', 'TOTAL', '%AGE'];

        // Default Max Marks - Explicitly label first column so parser detects it
        const defaultMarks = ['Max Marks', '', '', '', '100', '100', '100', '100', '50', '50', '100', '100', '', ''];

        // Calculate Total Max Marks for the template
        let totalMax = 0;
        defaultMarks.forEach(m => {
            if (m && !isNaN(m)) totalMax += parseFloat(m);
        });

        // Place Total Sum in the TOTAL column (Index 12)
        const totalColIndex = coreHeaders.indexOf('TOTAL');
        if (totalColIndex > -1) {
            defaultMarks[totalColIndex] = totalMax.toString();
        }

        const maxMarksRow = defaultMarks;
        const sampleRow = ['1', '9th', 'Ali Ahmed', 'Ahmed Khan', '', '', '', '', '', '', '', '', '', ''];

        const wsData = [coreHeaders, maxMarksRow, sampleRow];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Result_Template");
        XLSX.writeFile(wb, "Result_Upload_Template.xlsx");
    };

    // Handle Cell Change - Direct Spreadsheet Edit
    const handleCellChange = useCallback((value, key, colIndex) => {
        setTableData(prevData => {
            const newData = [...prevData];
            const rowIndex = newData.findIndex(item => item.key === key);

            if (rowIndex > -1) {
                const row = newData[rowIndex];
                newData[rowIndex] = { ...row, [colIndex]: value };
            }
            return newData;
        });
    }, []);

    const handleFileUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                processParsedData(jsonData);
            } catch (error) {
                console.error("Parse error", error);
                message.error("Failed to parse file. Ensure it is a valid Excel/CSV file.");
            }
        };
        reader.readAsArrayBuffer(file);
        return false; // Prevent upload
    };

    const processParsedData = (data) => {
        if (!data || data.length < 2) {
            message.error("File is empty or missing data.");
            return;
        }

        const headerRow = data[0];

        // Identify Indices FIRST to help with row detection
        const rollIndex = headerRow.findIndex(h => h && h.toString().toLowerCase().includes('roll'));
        const classIndex = headerRow.findIndex(h => h && h.toString().toLowerCase().includes('class'));
        const nameIndex = headerRow.findIndex(h => h && h.toString().toLowerCase().includes('name') && !h.toString().toLowerCase().includes('father'));
        const fatherIndex = headerRow.findIndex(h => h && h.toString().toLowerCase().includes('father'));

        if (rollIndex === -1 || nameIndex === -1 || classIndex === -1) {
            message.error("Missing required columns: 'Roll #', 'Name', or 'Class'. Please check the template.");
            return;
        }

        // SMART ROW DETECTION
        let maxMarksRow = null;
        let studentRawRows = [];

        const potentialRow1 = data[1];
        // Check contents of potential identifiers
        const valRoll = String(potentialRow1 && potentialRow1[rollIndex] || '').trim();
        const valName = String(potentialRow1 && potentialRow1[nameIndex] || '').trim();
        const valFather = fatherIndex !== -1 ? String(potentialRow1 && potentialRow1[fatherIndex] || '').trim() : '';

        // 1. Check for Explicit "Max" keyword in ANY identifier column
        const isExplicitMax =
            valRoll.toLowerCase().includes('max') ||
            valName.toLowerCase().includes('max') ||
            valFather.toLowerCase().includes('max');

        // 2. Check if Roll/Name are "Real" (contain alphanumerics, not just '-' or empty)
        // User example: Roll='-', Name='-' -> These are NOT valid student identifiers
        const hasRealRoll = /[a-zA-Z0-9]/.test(valRoll);
        const hasRealName = /[a-zA-Z0-9]/.test(valName);

        // It is a student row IF:
        // - It has a "Real" Roll OR Name
        // - AND it does NOT explicitly say "Max"
        const isStudentRow = (hasRealRoll || hasRealName) && !isExplicitMax;

        if (isStudentRow) {
            // It's a student! Default max marks to 100 for all cols
            maxMarksRow = new Array(headerRow.length).fill(100);
            studentRawRows = data.slice(1);
        } else {
            // It's a max marks row
            // STRICT MODE: If value is missing/invalid, default to 0 (so we can filter it out), NOT 100.
            const rawMaxParams = potentialRow1 || [];
            maxMarksRow = headerRow.map((_, idx) => {
                const val = rawMaxParams[idx];
                // If the value is numeric, return it. If '-', empty, or 0, return 0.
                if (val && !isNaN(parseFloat(val))) return parseFloat(val);
                return 0;
            });
            studentRawRows = data.slice(2);
        }

        // Identify Subject Indices
        const excludedKeywords = ['id', 'roll', 'class', 'total', '%', 'age', 'name', 'father', 's.no', 'sr', 'section'];
        const subjectIndices = [];

        // Also identify Total and Percentage columns to display them if present
        let totalIndex = -1;
        let percentageIndex = -1;

        headerRow.forEach((col, index) => {
            if (!col) return;
            const colStr = col.toString().toLowerCase();

            if (colStr.includes('total')) totalIndex = index;
            if (colStr.includes('%') || colStr.includes('age') || colStr.includes('percent')) percentageIndex = index;

            if (index !== rollIndex && index !== nameIndex && index !== fatherIndex && index !== classIndex) {
                if (!['total', 'class', 'student id', 'id', '%age', '%'].some(k => colStr.includes(k))) {

                    // STRICT FILTERING: Column MUST have at least ONE valid mark > 0
                    // This removes columns where everyone has "-", "0", or empty values
                    const hasValidData = studentRawRows.some(row => {
                        const rawVal = row[index];
                        // Skip if undefined, null, or "-"
                        if (rawVal === undefined || rawVal === null) return false;
                        const strVal = String(rawVal).trim();
                        if (strVal === '' || strVal === '-' || strVal.toLowerCase() === 'a') return false;
                        // Try to parse as number
                        const numVal = parseFloat(strVal);
                        return !isNaN(numVal) && numVal > 0;
                    });

                    // ONLY add if at least one student has a valid mark > 0
                    if (hasValidData) {
                        subjectIndices.push(index);
                    }
                    // If NO valid data exists, this column is SKIPPED completely
                }
            }
        });

        // Setup Data for Table
        const formattedRows = studentRawRows.map((row, i) => {
            const obj = { key: i };
            headerRow.forEach((_, colIdx) => {
                let val = row[colIdx];
                // Apply normalization to Class Column immediately for Grid View
                if (colIdx === classIndex) {
                    val = normalizeClassName(val);
                }
                obj[colIdx] = val;
            });
            return obj;
        });

        setTableData(formattedRows);

        setParsedMetaData({
            headerRow,
            maxMarksRow,
            rollIndex,
            classIndex,
            nameIndex,
            fatherIndex,
            subjectIndices,
            totalIndex,
            percentageIndex
        });

        message.success(`Loaded ${studentRawRows.length} students. Edit cells directly!`);
    };

    const tableColumns = useMemo(() => {
        if (!parsedMetaData || !parsedMetaData.headerRow) return [];

        return parsedMetaData.headerRow.map((h, colIndex) => ({
            title: h,
            dataIndex: colIndex,
            key: colIndex,
            width: 150,
            render: (text, record) => (
                <Input
                    value={record[colIndex]}
                    onChange={(e) => handleCellChange(e.target.value, record.key, colIndex)}
                    style={{ border: 'none', background: 'transparent', padding: '4px 0' }}
                    className="editable-input"
                />
            )
        }));
    }, [parsedMetaData, handleCellChange]);

    const handleBulkSave = async () => {
        if (!tableData || tableData.length === 0 || !sessionInput) {
            message.error("Please enter Session and ensure data is loaded.");
            return;
        }

        setSaving(true);
        try {
            const { headerRow, maxMarksRow, rollIndex, classIndex, nameIndex, fatherIndex, subjectIndices } = parsedMetaData;

            // 1. RESOLVE SESSION
            let sessionId = null;
            const currentSessions = await supabaseApi.fetch('result_sessions', `name=eq.${sessionInput}`);
            if (currentSessions && currentSessions.length > 0) {
                sessionId = currentSessions[0].id;
            } else {
                const [newSession] = await supabaseApi.upsert('result_sessions', [{ name: sessionInput, is_active: true }]);
                if (newSession) sessionId = newSession.id;
                else {
                    const fetched = await supabaseApi.fetch('result_sessions', `name=eq.${sessionInput}`);
                    sessionId = fetched[0].id;
                }
            }

            // 2. RECONSTRUCT ROWS FROM TABLE DATA
            const rowsByClass = {};

            tableData.forEach(rowObj => {
                // Normalize class name again just in case user edited it in the grid
                const className = normalizeClassName(rowObj[classIndex]);
                if (className) {
                    const key = className.toString();
                    if (!rowsByClass[key]) rowsByClass[key] = [];

                    const maxIdx = Math.max(...Object.keys(rowObj).filter(k => !isNaN(k)).map(Number));
                    const rowArr = [];
                    for (let i = 0; i <= maxIdx; i++) rowArr[i] = rowObj[i];

                    rowsByClass[key].push(rowArr);
                }
            });

            // 3. PROCESS EACH CLASS GROUP
            for (const className of Object.keys(rowsByClass)) {

                // A. Find or Create Class
                let classId = null;
                const potentialClasses = await supabaseApi.fetch('result_classes', `name=eq.${className}`);
                let targetClass = potentialClasses?.find(c => !c.section || c.section === '') || potentialClasses?.[0];

                if (!targetClass) {
                    const [newClass] = await supabaseApi.upsert('result_classes', [{ name: className, section: '' }]);
                    if (newClass) classId = newClass.id;
                    else {
                        const fetched = await supabaseApi.fetch('result_classes', `name=eq.${className}`);
                        classId = fetched[0].id;
                    }
                } else {
                    classId = targetClass.id;
                }

                // B. Sync Subjects
                const existingSubjects = await supabaseApi.fetch('result_subjects', `class_id=eq.${classId}`);
                const subjectMap = {};

                for (const idx of subjectIndices) {
                    const subjectName = headerRow[idx];
                    const maxMarks = parseFloat(maxMarksRow[idx]) || 100;

                    let subject = existingSubjects?.find(s => s.name.toLowerCase() === subjectName.toLowerCase());

                    if (!subject) {
                        // Insert
                        const [newSub] = await supabaseApi.upsert('result_subjects', [{
                            name: subjectName,
                            class_id: classId,
                            max_marks: maxMarks
                        }]);
                    } else if (subject.max_marks !== maxMarks) {
                        await supabaseApi.update('result_subjects', { max_marks: maxMarks }, `id=eq.${subject.id}`);
                    }
                }

                // Re-fetch subjects
                const finalSubjects = await supabaseApi.fetch('result_subjects', `class_id=eq.${classId}`);
                subjectIndices.forEach(idx => {
                    const sName = headerRow[idx];
                    const subj = finalSubjects.find(s => s.name.toLowerCase() === sName.toLowerCase());
                    if (subj) subjectMap[idx] = subj.id;
                });

                // C. Upsert Students
                const classRows = rowsByClass[className];
                const existingStudents = await supabaseApi.fetch('result_students', `class_id=eq.${classId}`);
                const studentsToUpsert = [];

                classRows.forEach(row => {
                    const roll = row[rollIndex];
                    const name = row[nameIndex];
                    const fatherName = fatherIndex !== -1 ? row[fatherIndex] : '';

                    if (roll && name) {
                        const existing = existingStudents?.find(es => es.roll_number == roll);
                        if (existing) {
                            studentsToUpsert.push({ ...existing, full_name: name, father_name: fatherName });
                        } else {
                            studentsToUpsert.push({
                                roll_number: roll,
                                full_name: name,
                                father_name: fatherName,
                                class_id: classId
                            });
                        }
                    }
                });

                if (studentsToUpsert.length > 0) {
                    await supabaseApi.upsert('result_students', studentsToUpsert);
                }

                // D. Upsert Marks
                const finalStudents = await supabaseApi.fetch('result_students', `class_id=eq.${classId}`);
                const studentMap = {};
                finalStudents.forEach(s => studentMap[s.roll_number] = s.id);

                const marksToUpsert = [];
                classRows.forEach(row => {
                    const roll = row[rollIndex];
                    const studentId = studentMap[roll];
                    if (!studentId) return;

                    subjectIndices.forEach(idx => {
                        const subjectId = subjectMap[idx];
                        if (!subjectId) return;

                        let rawMark = row[idx];
                        let obtained = 0;
                        if (typeof rawMark === 'string') {
                            if (rawMark.toUpperCase().trim() === 'A') obtained = 0;
                            else obtained = parseFloat(rawMark) || 0;
                        } else {
                            obtained = parseFloat(rawMark) || 0;
                        }

                        marksToUpsert.push({
                            student_id: studentId,
                            subject_id: subjectId,
                            session_id: sessionId,
                            obtained_marks: obtained
                        });
                    });
                });

                if (marksToUpsert.length > 0) {
                    await supabaseApi.upsert('result_marks', marksToUpsert);
                }
            }

            message.success(`Saved successfully!`);
            navigate('/dashboard/result-portal/manage');

        } catch (error) {
            console.error(error);
            message.error("Error processing upload: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
            <style>{`
                .editable-input:focus {
                    background: #fff !important;
                    border: 1px solid #1890ff !important;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
                    border-radius: 4px;
                    padding: 4px 8px !important;
                }
                .ant-table-cell {
                    padding: 4px !important; 
                }
            `}</style>

            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/dashboard/result-portal/manage')}
                style={{ marginBottom: 16 }}
            >
                Back to Result Hub
            </Button>

            <Card className="shadow-sm" style={{ borderRadius: 12 }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <Title level={2} style={{ color: '#1890ff', margin: 0 }}> <FileExcelOutlined /> Direct Result Editor</Title>
                    <Text type="secondary">Upload, Edit Data in Grid, and Save.</Text>
                </div>

                <div style={{ background: '#f5f5f5', padding: 24, borderRadius: 8, marginBottom: 24 }}>
                    <Row justify="center" gutter={16}>
                        <Col xs={24} md={10}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Session Name</label>
                            <AutoComplete
                                options={sessionOptions}
                                value={sessionInput}
                                onChange={setSessionInput}
                                placeholder="e.g. Annual 2026"
                                style={{ width: '100%' }}
                                size="large"
                                filterOption={(inputValue, option) =>
                                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                }
                            />
                        </Col>
                        <Col xs={24} md={10} style={{ display: 'flex', alignItems: 'end' }}>
                            <Upload
                                beforeUpload={handleFileUpload}
                                showUploadList={false}
                                accept=".xlsx,.xls,.csv"
                            >
                                <Button
                                    icon={<UploadOutlined />}
                                    type="primary"
                                    size="large"
                                    style={{ width: '100%' }}
                                >
                                    Select Result File
                                </Button>
                            </Upload>
                        </Col>
                    </Row>
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                        <Button type="link" size="small" icon={<DownloadOutlined />} onClick={downloadTemplate}>
                            Download Format Template
                        </Button>
                    </div>
                </div>

                {tableData.length > 0 && (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <Alert message="Grid is editable. Type directly in cells to make changes." type="info" showIcon />
                        </div>

                        <Table
                            bordered
                            dataSource={tableData}
                            columns={tableColumns}
                            pagination={false}
                            scroll={{ x: true, y: 500 }}
                            size="small"
                        />

                        <Divider />

                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleBulkSave}
                            loading={saving}
                            size="large"
                            block
                            style={{ height: 60, background: '#52c41a', borderColor: '#52c41a', fontSize: 20, fontWeight: 'bold' }}
                        >
                            Confirm & Save All Results
                        </Button>
                    </>
                )}
            </Card>
        </div>
    );
};

export default UploadResults;
