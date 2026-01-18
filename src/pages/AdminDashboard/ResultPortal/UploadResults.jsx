import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Table, InputNumber, Typography, Space, Divider, message, Alert } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseApi } from '../../../config/supabase';

const { Title } = Typography;
const { Option } = Select;

const UploadResults = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Data
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [marksData, setMarksData] = useState({});

    // Selections
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        if (selectedSession) {
            fetchClasses(selectedSession);
            setSelectedClass(null);
            setSelectedSubject(null);
            setStudents([]);
        }
    }, [selectedSession]);

    useEffect(() => {
        if (selectedClass) {
            fetchSubjects(selectedClass);
            setSelectedSubject(null);
            setStudents([]);
        }
    }, [selectedClass]);

    const fetchSessions = async () => {
        try {
            const data = await supabaseApi.fetch('result_sessions', 'is_active=eq.true&order=created_at.desc');
            setSessions(data || []);
        } catch (error) {
            message.error('Failed to load sessions');
        }
    };

    const fetchClasses = async (sessionId) => {
        try {
            const data = await supabaseApi.fetch('result_classes', `session_id=eq.${sessionId}&order=name`);
            setClasses(data || []);
        } catch (error) {
            message.error('Failed to load classes');
        }
    };

    const fetchSubjects = async (classId) => {
        try {
            const data = await supabaseApi.fetch('result_subjects', `class_id=eq.${classId}&order=name`);
            setSubjects(data || []);
        } catch (error) {
            message.error('Failed to load subjects');
        }
    };

    const fetchStudentsWithMarks = async () => {
        if (!selectedClass || !selectedSubject) {
            message.warning('Please select class and subject');
            return;
        }

        setLoading(true);
        try {
            // Fetch students
            const studentsData = await supabaseApi.fetch('result_students', `class_id=eq.${selectedClass}&order=roll_number`);

            // Fetch existing marks for this subject
            const marksResult = await supabaseApi.fetch('result_marks', `subject_id=eq.${selectedSubject}`);

            // Create marks lookup
            const marksLookup = {};
            marksResult?.forEach(mark => {
                marksLookup[mark.student_id] = mark.obtained_marks;
            });

            setStudents(studentsData || []);
            setMarksData(marksLookup);
        } catch (error) {
            console.error('Fetch students error:', error);
            message.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSave = async () => {
        if (students.length === 0) {
            message.warning('No students to save');
            return;
        }

        setSaving(true);
        try {
            // Prepare upsert data
            const upsertData = students.map(student => ({
                student_id: student.id,
                subject_id: selectedSubject,
                obtained_marks: marksData[student.id] || 0,
            }));

            // Bulk upsert marks
            await supabaseApi.upsert('result_marks', upsertData);

            message.success('Marks saved successfully!');
        } catch (error) {
            console.error('Save error:', error);
            message.error('Failed to save marks: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const getMaxMarks = () => {
        const subject = subjects.find(s => s.id === selectedSubject);
        return subject?.max_marks || 100;
    };

    const columns = [
        {
            title: 'Roll No',
            dataIndex: 'roll_number',
            key: 'roll_number',
            width: 100,
        },
        {
            title: 'Student Name',
            dataIndex: 'full_name',
            key: 'full_name',
        },
        {
            title: 'Father Name',
            dataIndex: 'father_name',
            key: 'father_name',
        },
        {
            title: `Marks (out of ${getMaxMarks()})`,
            key: 'marks',
            width: 150,
            render: (_, record) => (
                <InputNumber
                    min={0}
                    max={getMaxMarks()}
                    value={marksData[record.id] || 0}
                    onChange={val => handleMarkChange(record.id, val)}
                    style={{ width: '100%' }}
                />
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/dashboard/result-portal/manage')}
                style={{ marginBottom: 16 }}
            >
                Back to Portal
            </Button>
            <Title level={2}>Upload Results</Title>

            <Card style={{ marginBottom: 20 }}>
                <Space size="large" wrap>
                    <div>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Session</label>
                        <Select
                            placeholder="Select Session"
                            style={{ width: 180 }}
                            value={selectedSession}
                            onChange={setSelectedSession}
                        >
                            {sessions.map(s => (
                                <Option key={s.id} value={s.id}>{s.name}</Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Class</label>
                        <Select
                            placeholder="Select Class"
                            style={{ width: 180 }}
                            value={selectedClass}
                            onChange={setSelectedClass}
                            disabled={!selectedSession}
                        >
                            {classes.map(c => (
                                <Option key={c.id} value={c.id}>
                                    {c.name} {c.section ? `- ${c.section}` : ''}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Subject</label>
                        <Select
                            placeholder="Select Subject"
                            style={{ width: 180 }}
                            value={selectedSubject}
                            onChange={setSelectedSubject}
                            disabled={!selectedClass}
                        >
                            {subjects.map(s => (
                                <Option key={s.id} value={s.id}>
                                    {s.name} ({s.max_marks} marks)
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div style={{ alignSelf: 'flex-end' }}>
                        <Button
                            type="primary"
                            onClick={fetchStudentsWithMarks}
                            loading={loading}
                            disabled={!selectedSubject}
                        >
                            Load Students
                        </Button>
                    </div>
                </Space>
            </Card>

            {students.length > 0 ? (
                <Card title={`Enter Marks for ${subjects.find(s => s.id === selectedSubject)?.name || 'Subject'}`}>
                    <Table
                        dataSource={students}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                    />
                    <Divider />
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={saving}
                        size="large"
                        block
                    >
                        Save All Results
                    </Button>
                </Card>
            ) : selectedSubject ? (
                <Alert
                    message="No Students Found"
                    description="Click 'Load Students' to fetch students for the selected class, or add students first in the Manage section."
                    type="info"
                    showIcon
                />
            ) : null}
        </div>
    );
};

export default UploadResults;
