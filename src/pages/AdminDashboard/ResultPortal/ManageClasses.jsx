import React, { useState, useEffect } from 'react';
import {
    Table, Button, Input, Select, Typography, Card, Space, Popconfirm,
    Modal, Form, InputNumber, message, Tabs, Tag, Row, Col, Divider, Tooltip,
    Alert, Empty
} from 'antd';
import {
    DeleteOutlined, SearchOutlined, PlusOutlined, ReloadOutlined,
    EditOutlined, UserOutlined, BookOutlined, CalendarOutlined,
    CheckCircleOutlined, SettingOutlined, TrophyOutlined,
    SaveOutlined, CloudUploadOutlined, EyeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabaseApi } from '../../../config/supabase';

const { Title, Text } = Typography;
const { Option } = Select;

const MasterResultHub = () => {
    // === STATE ===
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTab, setCurrentTab] = useState('1');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state && location.state.activeTab) {
            setCurrentTab(location.state.activeTab);
        }
    }, [location.state]);

    // Data State
    const [sessions, setSessions] = useState([]);
    const [allClasses, setAllClasses] = useState([]); // Raw class data
    const [allSubjects, setAllSubjects] = useState([]);
    const [allStudents, setAllStudents] = useState([]);

    // Filtering State (Split Filter for View/Rapid Entry)
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [viewClassName, setViewClassName] = useState(null);
    const [viewSection, setViewSection] = useState(null); // String or null

    // Helper: Derive actual class ID from Name + Section
    const activeClassId = allClasses.find(c =>
        c.name === viewClassName && (c.section === (viewSection || '') || (!c.section && !viewSection))
    )?.id;

    // Marks Input State (Grid: marksData[studentId][subjectId] = value)
    const [marksData, setMarksData] = useState({});
    const [savingMarks, setSavingMarks] = useState(false);

    // Modal / Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ type: null, mode: 'add', record: null });
    const [form] = Form.useForm();

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

            if (sessionData?.length > 0 && !selectedSessionId) setSelectedSessionId(sessionData[0].id);
        } catch (error) {
            message.error('Load failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // === DATA FETCHERS FOR TABS ===
    const refreshStudents = async (classId) => {
        if (!classId) return;
        try {
            const data = await supabaseApi.fetch('result_students', `select=*&class_id=eq.${classId}&order=roll_number`);
            setAllStudents(data || []);
        } catch (error) {
            message.error('Failed to load students');
        }
    };

    useEffect(() => {
        if (activeClassId) refreshStudents(activeClassId);
    }, [activeClassId]);

    // === CRUD OPERATIONS ===
    const handleModalSubmit = async (values) => {
        setLoading(true);
        try {
            const { type, mode, record } = modalConfig;

            if (type === 'class_section') {
                const sections = values.sections || [];
                const finalSections = [...new Set(sections)];

                const promises = finalSections.map(sec =>
                    supabaseApi.insert('result_classes', {
                        name: values.class_name,
                        section: sec
                    })
                );
                await Promise.all(promises);
                message.success(`Class added!`);
            }
            else if (type === 'subject') {
                await supabaseApi.insert('result_subjects', {
                    name: values.name,
                    class_id: values.class_id,
                    max_marks: 100
                });
                message.success('Subject added!');
            }
            else if (type === 'student') {
                // For enrollment, user might select a specific class directly in modal
                // or we use a passed activeClassId.
                if (mode === 'add') {
                    await supabaseApi.insert('result_students', {
                        full_name: values.full_name,
                        father_name: values.father_name,
                        roll_number: values.roll_number,
                        class_id: values.class_id
                    });
                } else {
                    const response = await fetch(`https://cjzxfilklerlhyysrgye.supabase.co/rest/v1/result_students?id=eq.${record.id}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenhmaWxrbGVybGh5eXNyZ3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTE4ODgsImV4cCI6MjA4NDE2Nzg4OH0.j0Iq1Lnv6HUg1P-Xvtsvu0sZ0APCGSw17ABdHWu3JGU',
                            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenhmaWxrbGVybGh5eXNyZ3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTE4ODgsImV4cCI6MjA4NDE2Nzg4OH0.j0Iq1Lnv6HUg1P-Xvtsvu0sZ0APCGSw17ABdHWu3JGU',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(values)
                    });
                    if (!response.ok) throw new Error('Update failed');
                }
                refreshStudents(values.class_id);
            }
            else if (type === 'session') {
                await supabaseApi.insert('result_sessions', {
                    name: values.name,
                    is_active: true
                });
                message.success('Result Session created!');
                fetchAllData();
            }

            setIsModalOpen(false);
            form.resetFields();
            fetchAllData();
        } catch (error) {
            message.error('Operation failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (table, id, refreshFn) => {
        try {
            await supabaseApi.delete(table, id);
            message.success('Deleted successfully');
            if (refreshFn) refreshFn();
            else fetchAllData();
        } catch (error) {
            message.error('Delete failed');
        }
    };

    // === MARKS ENTRY GRID LOGIC ===
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
            marks?.forEach(m => {
                if (!grid[m.student_id]) grid[m.student_id] = {};
                grid[m.student_id][m.subject_id] = m.obtained_marks;
            });
            setMarksData(grid);
        } catch (error) {
            console.error(error);
            message.error('Failed to load marks grid');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentTab === '4') loadMarksGrid();
    }, [selectedSessionId, activeClassId, currentTab]);

    const handleSaveMarks = async () => {
        setSavingMarks(true);
        try {
            const entries = [];
            Object.keys(marksData).forEach(stId => {
                Object.keys(marksData[stId]).forEach(subId => {
                    entries.push({
                        student_id: stId,
                        subject_id: subId,
                        session_id: selectedSessionId,
                        obtained_marks: marksData[stId][subId]
                    });
                });
            });

            if (entries.length === 0) {
                message.warning('No marks to save');
                return;
            }

            await supabaseApi.upsert('result_marks', entries, 'student_id,subject_id,session_id');
            message.success('All marks for this class saved successfully!');
        } catch (error) {
            message.error('Save failed: ' + error.message);
        } finally {
            setSavingMarks(false);
        }
    };

    // === HELPERS FOR SELECTS ===
    const uniqueClassNames = [...new Set(allClasses.map(c => c.name))];
    const availableSections = allClasses
        .filter(c => c.name === viewClassName)
        .map(c => c.section)
        .filter(s => s); // remove empty/null for list, but allow empty selection

    // === RENDER HELPERS ===

    const infrastructureTab = (
        <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
                <Card
                    title={<span><BookOutlined /> Classes & Sections</span>}
                    extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setModalConfig({ type: 'class_section', mode: 'add' }); setIsModalOpen(true); }}>Add Class</Button>}
                >
                    <Table
                        size="small"
                        dataSource={allClasses}
                        pagination={{ pageSize: 8 }}
                        columns={[
                            { title: 'Class', dataIndex: 'name', key: 'name' },
                            { title: 'Section', dataIndex: 'section', key: 'section' },
                            {
                                title: 'Actions',
                                key: 'actions',
                                render: (_, r) => (
                                    <Popconfirm title="Delete this class/section?" onConfirm={() => handleDelete('result_classes', r.id)}>
                                        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                                    </Popconfirm>
                                )
                            }
                        ]}
                    />
                </Card>
            </Col>
            <Col xs={24} lg={12}>
                <Card
                    title={<span><SettingOutlined /> Subjects List</span>}
                    extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setModalConfig({ type: 'subject', mode: 'add' }); setIsModalOpen(true); }}>Add Subject</Button>}
                >
                    <Table
                        size="small"
                        dataSource={allSubjects}
                        pagination={{ pageSize: 8 }}
                        columns={[
                            { title: 'Subject', dataIndex: 'name', key: 'name' },
                            {
                                title: 'Target Class',
                                key: 'target',
                                render: (_, r) => {
                                    const cls = allClasses.find(c => c.id === r.class_id);
                                    return cls ? `${cls.name} (${cls.section})` : 'Unknown';
                                }
                            },
                            {
                                title: 'Actions',
                                key: 'actions',
                                render: (_, r) => (
                                    <Popconfirm title="Delete subject?" onConfirm={() => handleDelete('result_subjects', r.id)}>
                                        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                                    </Popconfirm>
                                )
                            }
                        ]}
                    />
                </Card>
            </Col>
        </Row>
    );

    const studentTab = (
        <Card title={<span><UserOutlined /> Student Enrollment</span>}>
            <Space style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Class Name"
                    style={{ width: 150 }}
                    value={viewClassName}
                    onChange={(v) => { setViewClassName(v); setViewSection(null); }}
                >
                    {uniqueClassNames.map(name => <Option key={name} value={name}>{name}</Option>)}
                </Select>
                <Select
                    placeholder="Section (Opt)"
                    style={{ width: 120 }}
                    value={viewSection}
                    onChange={setViewSection}
                    allowClear
                    disabled={!viewClassName}
                >
                    {availableSections.map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    disabled={!activeClassId}
                    onClick={() => { setModalConfig({ type: 'student', mode: 'add' }); setIsModalOpen(true); }}
                >
                    Enroll New Student
                </Button>
            </Space>

            <Table
                loading={loading}
                dataSource={allStudents}
                columns={[
                    { title: 'Roll No', dataIndex: 'roll_number', key: 'roll' },
                    { title: 'Full Name', dataIndex: 'full_name', key: 'name' },
                    { title: 'Father Name', dataIndex: 'father_name', key: 'father' },
                    {
                        title: 'Actions',
                        key: 'actions',
                        render: (_, r) => (
                            <Space>
                                <Button icon={<EditOutlined />} size="small" onClick={() => { setModalConfig({ type: 'student', mode: 'edit', record: r }); form.setFieldsValue(r); setIsModalOpen(true); }} />
                                <Popconfirm title="Remove student?" onConfirm={() => handleDelete('result_students', r.id, () => refreshStudents(activeClassId))}>
                                    <Button danger icon={<DeleteOutlined />} size="small" />
                                </Popconfirm>
                            </Space>
                        )
                    }
                ]}
            />
        </Card>
    );

    const sessionTab = (
        <div>
            <Card
                title={<span><CalendarOutlined /> Planning Result Sessions / Tests</span>}
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setModalConfig({ type: 'session', mode: 'add' }); setIsModalOpen(true); }}>Create New Test Session</Button>}
                style={{ marginBottom: 20 }}
            >
                <Table
                    size="small"
                    dataSource={sessions}
                    pagination={{ pageSize: 5 }}
                    columns={[
                        { title: 'Test / Event Name', dataIndex: 'name', key: 'name' },
                        { title: 'Created', dataIndex: 'created_at', key: 'date', render: d => new Date(d).toLocaleDateString() },
                        {
                            title: 'Actions',
                            key: 'actions',
                            render: (_, r) => (
                                <Popconfirm title="Delete entire session?" onConfirm={() => handleDelete('result_sessions', r.id)}>
                                    <Button danger icon={<DeleteOutlined />} size="small" />
                                </Popconfirm>
                            )
                        }
                    ]}
                />
            </Card>

            <Card title={<span><SettingOutlined /> Session Subject Setup (Set Total Marks)</span>}>
                <Space style={{ marginBottom: 20 }}>
                    <Select
                        placeholder="Class Name"
                        style={{ width: 150 }}
                        value={viewClassName}
                        onChange={(v) => { setViewClassName(v); setViewSection(null); }}
                    >
                        {uniqueClassNames.map(name => <Option key={name} value={name}>{name}</Option>)}
                    </Select>
                    <Select
                        placeholder="Section"
                        style={{ width: 120 }}
                        value={viewSection}
                        onChange={setViewSection}
                        allowClear
                        disabled={!viewClassName}
                    >
                        {availableSections.map(s => <Option key={s} value={s}>{s}</Option>)}
                    </Select>
                </Space>

                <Table
                    dataSource={allSubjects.filter(s => s.class_id === activeClassId)}
                    pagination={false}
                    columns={[
                        { title: 'Subject Name', dataIndex: 'name', key: 'name' },
                        {
                            title: 'Total Marks for this Session',
                            key: 'max',
                            render: (_, r) => (
                                <InputNumber
                                    min={1}
                                    value={r.max_marks}
                                    onChange={async (val) => {
                                        try {
                                            await fetch(`https://cjzxfilklerlhyysrgye.supabase.co/rest/v1/result_subjects?id=eq.${r.id}`, {
                                                method: 'PATCH',
                                                headers: {
                                                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenhmaWxrbGVybGh5eXNyZ3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTE4ODgsImV4cCI6MjA4NDE2Nzg4OH0.j0Iq1Lnv6HUg1P-Xvtsvu0sZ0APCGSw17ABdHWu3JGU',
                                                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenhmaWxrbGVybGh5eXNyZ3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTE4ODgsImV4cCI6MjA4NDE2Nzg4OH0.j0Iq1Lnv6HUg1P-Xvtsvu0sZ0APCGSw17ABdHWu3JGU',
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({ max_marks: val })
                                            });
                                            setAllSubjects(prev => prev.map(s => s.id === r.id ? { ...s, max_marks: val } : s));
                                        } catch (e) { message.error('Update failed'); }
                                    }}
                                />
                            )
                        }
                    ]}
                />
            </Card>
        </div>
    );

    const marksTab = (
        <div>
            <Card style={{ marginBottom: 20 }}>
                <Row gutter={16} align="middle">
                    <Col span={8}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>1. Select Session</Text>
                        <Select block value={selectedSessionId} onChange={setSelectedSessionId} size="large">
                            {sessions.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>2. Select Class</Text>
                        <Select block value={viewClassName} onChange={(v) => { setViewClassName(v); setViewSection(null); }} size="large" placeholder="Select Class">
                            {uniqueClassNames.map(name => <Option key={name} value={name}>{name}</Option>)}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>3. Section (Optional)</Text>
                        <Select block value={viewSection} onChange={setViewSection} allowClear disabled={!viewClassName} size="large" placeholder="Any / Empty">
                            {availableSections.map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </Col>
                </Row>
            </Card>

            {(!selectedSessionId || !activeClassId) ? (
                <Empty description="Select Session and Class to load the Marks Entry Grid" />
            ) : (
                <Card
                    title={`Rapid Marks Entry: ${sessions.find(s => s.id === selectedSessionId)?.name} | ${viewClassName} ${viewSection ? `(${viewSection})` : ''}`}
                    extra={<Button type="primary" icon={<SaveOutlined />} loading={savingMarks} onClick={handleSaveMarks}>Save Entire Class Grid</Button>}
                    bodyStyle={{ padding: 0 }}
                >
                    <div style={{ overflowX: 'auto' }}>
                        <Table
                            dataSource={allStudents}
                            pagination={false}
                            size="small"
                            bordered
                            columns={[
                                {
                                    title: 'Student Details',
                                    children: [
                                        { title: 'Roll #', dataIndex: 'roll_number', key: 'roll', width: 80, fixed: 'left' },
                                        { title: 'Name', dataIndex: 'full_name', key: 'name', width: 150, fixed: 'left' },
                                    ]
                                },
                                ...allSubjects.filter(s => s.class_id === activeClassId).map(sub => ({
                                    title: <div>{sub.name}<br /><span style={{ fontSize: 10, color: '#888' }}>(Max: {sub.max_marks})</span></div>,
                                    key: sub.id,
                                    width: 120,
                                    render: (_, student) => (
                                        <InputNumber
                                            min={0}
                                            max={sub.max_marks}
                                            placeholder="0"
                                            value={marksData[student.id]?.[sub.id] || 0}
                                            onChange={val => {
                                                setMarksData(prev => ({
                                                    ...prev,
                                                    [student.id]: {
                                                        ...(prev[student.id] || {}),
                                                        [sub.id]: val
                                                    }
                                                }));
                                            }}
                                            style={{ width: '100%' }}
                                        />
                                    )
                                }))
                            ]}
                        />
                    </div>
                    <div style={{ padding: 24, textAlign: 'center' }}>
                        <Button type="primary" size="large" icon={<SaveOutlined />} loading={savingMarks} onClick={handleSaveMarks} block>
                            Finalize and Save All Subject Marks
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );

    const tabItems = [
        { key: '1', label: <span><SettingOutlined /> Infrastructure</span>, children: infrastructureTab },
        { key: '2', label: <span><UserOutlined /> Enrollment</span>, children: studentTab },
        { key: '3', label: <span><CalendarOutlined /> Plan Tests</span>, children: sessionTab },
        { key: '4', label: <span><CheckCircleOutlined /> Show Results & Edit</span>, children: marksTab }
    ];

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Unified Result Hub</Title>
                    <Text type="secondary">Centralized Management & Rapid Multi-Subject Grading</Text>
                </div>
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => setCurrentTab('4')}
                        style={{ borderColor: '#1890ff', color: '#1890ff' }}
                    >
                        View Results
                    </Button>
                    <Button
                        type="primary"
                        icon={<CloudUploadOutlined />}
                        onClick={() => navigate('/dashboard/result-portal/upload')}
                        style={{ background: '#52c41a', borderColor: '#52c41a' }}
                    >
                        Bulk Upload
                    </Button>
                </Space>
            </div>

            <Tabs
                activeKey={currentTab}
                onChange={setCurrentTab}
                type="card"
                items={tabItems}
                style={{ background: '#fff', padding: 16, borderRadius: 12 }}
            />

            {/* SHARED MODAL */}
            <Modal
                title={modalConfig.type?.replace('_', ' ').toUpperCase()}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleModalSubmit} initialValues={{ class_id: activeClassId }}>
                    {modalConfig.type === 'class_section' && (
                        <>
                            <Form.Item name="class_name" label="Class Name (e.g. 9th, 10th)" rules={[{ required: true }]}>
                                <Input placeholder="Enter class name" />
                            </Form.Item>
                            <Form.Item name="sections" label="Sections (Optional)" rules={[{ required: false }]}>
                                <Select
                                    mode="tags"
                                    placeholder="Select or type section (leave empty if none)"
                                    tokenSeparators={[',']}
                                >
                                    {['A', 'B', 'C', 'D', 'Science', 'Arts', 'General'].map(s => <Option key={s}>{s}</Option>)}
                                </Select>
                            </Form.Item>
                        </>
                    )}

                    {modalConfig.type === 'subject' && (
                        <>
                            <Form.Item name="name" label="Subject Name" rules={[{ required: true }]}>
                                <Input placeholder="e.g. Physics" />
                            </Form.Item>
                            <Form.Item name="class_id" label="Primary Class" rules={[{ required: true }]}>
                                <Select placeholder="Assign to class">
                                    {allClasses.map(c => <Option key={c.id} value={c.id}>{c.name} - {c.section}</Option>)}
                                </Select>
                            </Form.Item>
                        </>
                    )}

                    {modalConfig.type === 'student' && (
                        <>
                            <Form.Item name="full_name" label="Student Full Name" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                            <Form.Item name="father_name" label="Father Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="roll_number" label="Roll # (Unique in class)" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="class_id" label="Enroll in Class" rules={[{ required: true }]}>
                                <Select disabled={modalConfig.mode === 'edit'}>
                                    {allClasses.map(c => <Option key={c.id} value={c.id}>{c.name} - {c.section}</Option>)}
                                </Select>
                            </Form.Item>
                        </>
                    )}

                    {modalConfig.type === 'session' && (
                        <Form.Item name="name" label="Test Session / Event Name" rules={[{ required: true }]}>
                            <Input placeholder="e.g. Midterm Exams 2026" />
                        </Form.Item>
                    )}

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Button style={{ marginRight: 8 }} onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Save Hub Record</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MasterResultHub;
