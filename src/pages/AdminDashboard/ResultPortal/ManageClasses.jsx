import React, { useState, useEffect } from 'react';
import {
    Table, Button, Select, Typography, Card, Space, Popconfirm,
    message, Row, Col, Alert, Empty, InputNumber, Modal, Form, Input
} from 'antd';
import {
    DeleteOutlined, CloudUploadOutlined, EditOutlined, CloseOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabaseApi } from '../../../config/supabase';

const { Title, Text } = Typography;
const { Option } = Select;

const MasterResultHub = () => {
    // === STATE ===
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Data State
    const [sessions, setSessions] = useState([]);
    const [allClasses, setAllClasses] = useState([]); // Raw class data
    const [allSubjects, setAllSubjects] = useState([]);
    const [allStudents, setAllStudents] = useState([]);

    // Filtering State
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [viewClassName, setViewClassName] = useState(null);
    const [viewSection, setViewSection] = useState(null); // String or null

    // Helper: Derive actual class ID from Name + Section
    const activeClassId = allClasses.find(c =>
        c.name === viewClassName && (c.section === (viewSection || '') || (!c.section && !viewSection))
    )?.id;

    // Marks Data (Read Only for Grid)
    const [marksData, setMarksData] = useState({});

    // === EDIT MODE STATE ===
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [sessionSubjectMaxMarks, setSessionSubjectMaxMarks] = useState({});
    const [subjectForm] = Form.useForm();

    // === INITIAL LOAD ===
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [sessionData, classData, subjectData] = await Promise.all([
                supabaseApi.fetch('result_sessions', 'select=*&order=created_at.desc'),
                supabaseApi.fetch('result_classes', 'select=*&order=name'),
                supabaseApi.fetch('result_subjects', 'select=*&order=name')
            ]);

            setSessions(sessionData || []);
            setAllClasses(classData || []);
            setAllSubjects(subjectData || []);

            // Auto-select most recent session
            if (sessionData?.length > 0 && !selectedSessionId) setSelectedSessionId(sessionData[0].id);
        } catch (error) {
            message.error('Load failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // === DATA FETCHERS ===
    useEffect(() => {
        if (activeClassId) {
            const fetchStudents = async () => {
                try {
                    const data = await supabaseApi.fetch('result_students', `select=*&class_id=eq.${activeClassId}&order=roll_number`);
                    setAllStudents(data || []);
                } catch (error) {
                    message.error('Failed to load students');
                }
            };
            fetchStudents();
        }
    }, [activeClassId]);

    const loadMarksGrid = async () => {
        if (!selectedSessionId || !activeClassId) return;
        setLoading(true);
        try {
            const classSubjects = allSubjects.filter(s => s.class_id === activeClassId);
            const subjectIds = classSubjects.map(s => s.id);

            if (subjectIds.length === 0) {
                setMarksData({});
                return;
            }

            const marks = await supabaseApi.fetch('result_marks', `session_id=eq.${selectedSessionId}&subject_id=in.(${subjectIds.join(',')})`);

            const grid = {};
            const subjectMaxMap = {};

            marks?.forEach(m => {
                if (!grid[m.student_id]) grid[m.student_id] = {};
                grid[m.student_id][m.subject_id] = m.obtained_marks;

                // Capture max_marks for the subject in this session
                // We assume consistency, so the last seen valid max_marks is used
                if (m.max_marks) {
                    subjectMaxMap[m.subject_id] = m.max_marks;
                }
            });
            setMarksData(grid);
            setSessionSubjectMaxMarks(subjectMaxMap);
        } catch (error) {
            console.error(error);
            message.error('Failed to load marks grid');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMarksGrid();
    }, [selectedSessionId, activeClassId]);

    // === DELETE FUNCTIONALITY ===
    const handleDeleteClassResults = async () => {
        if (!selectedSessionId || !activeClassId) return;
        setLoading(true);
        try {
            // Delete all marks for this session and class
            // 1. Identify students in this class
            const studentIds = allStudents.map(s => s.id);
            if (studentIds.length === 0) {
                message.warning("No students found in this class.");
                setLoading(false);
                return;
            }

            // 2. Perform Bulk Delete using deleteByQuery
            // We delete all marks where session_id is X and student_id is in our list
            const studentIdList = studentIds.join(',');
            const query = `session_id=eq.${selectedSessionId}&student_id=in.(${studentIdList})`;

            await supabaseApi.deleteByQuery('result_marks', query);

            message.success(`Result records deleted successfully.`);
            setMarksData({});
            // loadMarksGrid will re-run but marksData is now empty, so UI will clear
            await loadMarksGrid();
        } catch (error) {
            console.error(error);
            message.error("Failed to delete results.");
        } finally {
            setLoading(false);
        }
    };

    // === EDIT HANDLERS ===
    const handleMarkUpdate = async (studentId, subjectId, newVal) => {
        // Optimistic UI Update
        // const oldVal = marksData[studentId]?.[subjectId]; // oldVal might be object now
        // if (newVal === oldVal) return; 

        // Simplified: Just trigger update
        try {
            // We need to know the current max_marks for this mark to preserve it
            // marksData now might need to store it, or we assume subject default if missing? 
            // Better: fetch single mark or use what we have.
            // Let's assume we maintain existing max_marks if possible, or fetch it.
            // Actuallly, for invalid/missing max_marks, we might default to subject's max.

            const subject = allSubjects.find(s => s.id === subjectId);
            const currentMax = subject ? subject.max_marks : 100;

            await supabaseApi.upsert('result_marks', [{
                student_id: studentId,
                subject_id: subjectId,
                session_id: selectedSessionId,
                obtained_marks: newVal,
                max_marks: currentMax // Ensure we save max_marks too!
            }]);
            message.success("Mark updated", 0.5);
            // Update local state (marksData)
            setMarksData(prev => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    [subjectId]: newVal
                }
            }));
        } catch (error) {
            message.error("Failed to save mark");
        }
    };

    const openSubjectEdit = (subject) => {
        setEditingSubject(subject);
        // Pre-fill with session specific max marks if available, else global default
        const currentMax = sessionSubjectMaxMarks[subject.id] || subject.max_marks;

        subjectForm.setFieldsValue({
            name: subject.name,
            max_marks: currentMax
        });
    };

    const handleSubjectUpdate = async () => {
        try {
            const values = await subjectForm.validateFields();
            setLoading(true);

            // 1. Update Subject NAME ONLY (keep global max_marks untouched to preserve defaults)
            await supabaseApi.upsert('result_subjects', [{
                id: editingSubject.id,
                class_id: activeClassId,
                name: values.name,
                // max_marks: values.max_marks // REMOVED: Do not update global max marks!
            }]);

            // 2. BULK UPDATE existing marks for this session/subject with new Max Marks  
            // This ensures ONLY the current Round is affected.
            const relevantMarks = await supabaseApi.fetch('result_marks', `subject_id=eq.${editingSubject.id}&session_id=eq.${selectedSessionId}`);

            if (relevantMarks.length > 0) {
                const updates = relevantMarks.map(m => ({
                    ...m,
                    max_marks: values.max_marks
                }));
                await supabaseApi.upsert('result_marks', updates);
            }

            message.success("Subject & Session Marks updated successfully");
            setEditingSubject(null);
            fetchAllData(); // Refetch to update UI
        } catch (error) {
            console.error(error);
            message.error("Failed to update subject");
        } finally {
            setLoading(false);
        }
    };

    // === SELECT HELPERS ===
    const uniqueClassNames = [...new Set(allClasses.map(c => c.name))];
    const availableSections = allClasses
        .filter(c => c.name === viewClassName)
        .map(c => c.section)
        .filter(s => s);

    // Filter students: ONLY show students who have marks for this session/class
    // This supports the "Bulk Only" workflow - if you haven't uploaded marks, you don't see the student.
    // If you delete marks, the student disappears from this view.
    const visibleStudents = allStudents.filter(s => {
        const sMarks = marksData[s.id];
        return sMarks && Object.keys(sMarks).length > 0;
    });

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Result Management Hub</Title>
                    <Text type="secondary">View & Manage Class Results (Bulk Upload Only)</Text>
                </div>
                <Space>
                    <Button
                        type={isEditMode ? "default" : "default"}
                        danger={isEditMode}
                        icon={isEditMode ? <CloseOutlined /> : <EditOutlined />}
                        onClick={() => setIsEditMode(!isEditMode)}
                        style={{ height: 50 }}
                    >
                        {isEditMode ? "Exit Edit Mode" : "Enable Edit Mode"}
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        icon={<CloudUploadOutlined />}
                        onClick={() => navigate('/dashboard/result-portal/upload')}
                        style={{ background: '#52c41a', borderColor: '#52c41a', height: 50, paddingLeft: 30, paddingRight: 30, fontSize: 16 }}
                    >
                        Bulk Upload New Results
                    </Button>
                </Space>
            </div>

            <Card style={{ marginBottom: 20, borderRadius: 12, border: '1px solid #d9d9d9' }}>
                <Row gutter={16} align="middle">
                    <Col xs={24} md={8}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>1. Select Session (Round)</Text>
                        <Select block value={selectedSessionId} onChange={setSelectedSessionId} size="large" style={{ width: '100%' }}>
                            {sessions.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} md={8}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>2. Select Class</Text>
                        <Select block value={viewClassName} onChange={(v) => { setViewClassName(v); setViewSection(null); }} size="large" placeholder="Select Class" style={{ width: '100%' }}>
                            {uniqueClassNames.map(name => <Option key={name} value={name}>{name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} md={8}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>3. Section (Optional)</Text>
                        <Select block value={viewSection} onChange={setViewSection} allowClear disabled={!viewClassName} size="large" placeholder="Any / Empty" style={{ width: '100%' }}>
                            {availableSections.map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </Col>
                </Row>
            </Card>

            {(!selectedSessionId || !activeClassId) ? (
                <Empty description="Please select a Session and Class to view results." style={{ marginTop: 50 }} />
            ) : (
                <Card
                    title={<span style={{ fontSize: 18 }}> <span style={{ color: '#1890ff' }}>{sessions.find(s => s.id === selectedSessionId)?.name}</span> &nbsp;/&nbsp; {viewClassName} {viewSection ? `(${viewSection})` : ''}</span>}
                    extra={
                        <Popconfirm
                            title="Delete All Results?"
                            description={`Are you sure you want to delete ALL marks for:
Session: ${sessions.find(s => s.id === selectedSessionId)?.name}
Class: ${viewClassName} ${viewSection || ''}?
This cannot be undone.`}
                            onConfirm={handleDeleteClassResults}
                            okText="Yes, Delete All"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true, size: 'large' }}
                        >
                            <Button danger type="primary" size="large" icon={<DeleteOutlined />}>Delete Class Results</Button>
                        </Popconfirm>
                    }
                    bodyStyle={{ padding: 0 }}
                    style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #d9d9d9' }}
                >
                    <Alert
                        message="Bulk-Only View"
                        description="Only students with uploaded marks are shown here. Updates must be done via Bulk Upload."
                        type="info"
                        showIcon
                        style={{ margin: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderRadius: 0 }}
                    />

                    <div style={{ overflowX: 'auto' }}>
                        <Table
                            dataSource={visibleStudents}
                            pagination={false}
                            size="small"
                            bordered
                            rowKey="id"
                            locale={{ emptyText: 'No results found. Upload a file to see students & marks.' }}
                            scroll={{ x: true }}
                            columns={[
                                {
                                    title: 'Student Details',
                                    fixed: 'left',
                                    width: 200,
                                    children: [
                                        { title: 'Roll #', dataIndex: 'roll_number', key: 'roll', width: 90, fixed: 'left', sorter: (a, b) => a.roll_number.localeCompare(b.roll_number, undefined, { numeric: true }) },
                                        { title: 'Name', dataIndex: 'full_name', key: 'name', width: 150, fixed: 'left' },
                                    ]
                                },
                                ...allSubjects.filter(s => s.class_id === activeClassId).map(sub => {
                                    // Determine the max_marks for this subject in the current session
                                    // Fallback to the subject's default max_marks if no session-specific max is found
                                    const currentSubjectMaxMarks = sessionSubjectMaxMarks[sub.id] || sub.max_marks;

                                    return {
                                        title: (
                                            <div style={{ textAlign: 'center' }}>
                                                {sub.name}
                                                {isEditMode && (
                                                    <EditOutlined
                                                        style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }}
                                                        title="Edit Subject Max Marks (This Session Only)"
                                                        onClick={() => openSubjectEdit(sub)}
                                                    />
                                                )}
                                                <br />
                                                <span style={{ fontSize: 10, color: '#888' }}>(Max: {currentSubjectMaxMarks})</span>
                                            </div>
                                        ),
                                        key: sub.id,
                                        width: 120,
                                        align: 'center',
                                        render: (_, student) => {
                                            const marks = marksData[student.id]?.[sub.id];
                                            if (isEditMode) {
                                                return (
                                                    <InputNumber
                                                        min={0}
                                                        max={currentSubjectMaxMarks} // Use session-specific max_marks for input validation
                                                        value={marks}
                                                        onBlur={(e) => handleMarkUpdate(student.id, sub.id, parseFloat(e.target.value) || 0)}
                                                        onPressEnter={(e) => handleMarkUpdate(student.id, sub.id, parseFloat(e.target.value) || 0)}
                                                        size="small"
                                                        style={{ width: '100%' }}
                                                    />
                                                );
                                            }
                                            return (
                                                <div style={{ fontWeight: 600, color: marks !== undefined ? '#333' : '#ccc' }}>
                                                    {marks !== undefined ? marks : '-'}
                                                </div>
                                            );
                                        }
                                    };
                                })
                            ]}
                        />
                    </div>
                </Card>
            )}

            {/* Subject Edit Modal */}
            <Modal
                title="Edit Subject Details"
                open={!!editingSubject}
                onCancel={() => setEditingSubject(null)}
                onOk={handleSubjectUpdate}
            >
                <Form form={subjectForm} layout="vertical">
                    <Form.Item name="name" label="Subject Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="max_marks" label="Max Marks (Total)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MasterResultHub;
