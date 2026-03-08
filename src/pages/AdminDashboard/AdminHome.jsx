import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Statistic, Skeleton, message, Button } from 'antd';
import {
    PlusOutlined,
    FileTextOutlined,
    TeamOutlined,
    TrophyOutlined,
    SyncOutlined,
    UserOutlined,
    BookOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { supabaseApi } from '../../config/supabase';

const { Title, Text } = Typography;

const AdminHome = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        content: 0
    });

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [profiles, topics] = await Promise.all([
                supabaseApi.fetch('profiles'),
                supabaseApi.fetch('topics')
            ]);

            setStats({
                users: profiles?.length || 0,
                content: topics?.length || 0
            });
        } catch (err) {
            message.error('Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const actions = [
        { title: 'Add New Content', path: '/dashboard/addContent', icon: <PlusOutlined />, desc: 'Upload PDFs and materials' },
        { title: 'Manage Library', path: '/dashboard/manageContent', icon: <FileTextOutlined />, desc: 'Edit or remove files' },
        { title: 'User Access', path: '/dashboard/allowusers', icon: <TeamOutlined />, desc: 'Manage roles and permissions' },
        { title: 'Result Marks', path: '/dashboard/result-portal/manage', icon: <TrophyOutlined />, desc: 'Enter and update marks' },
    ];

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <Title level={3}>Dashboard Overview</Title>
                <Text type="secondary">Quick access to administrative tools</Text>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                <Col xs={12} sm={6}>
                    <Card bordered size="small">
                        <Skeleton loading={loading} active paragraph={{ rows: 0 }}>
                            <Statistic title="Total Users" value={stats.users} prefix={<UserOutlined />} />
                        </Skeleton>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered size="small">
                        <Skeleton loading={loading} active paragraph={{ rows: 0 }}>
                            <Statistic title="Resources" value={stats.content} prefix={<BookOutlined />} />
                        </Skeleton>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered size="small">
                        <Statistic title="Status" value="Online" prefix={<SyncOutlined style={{ color: '#52c41a' }} />} />
                    </Card>
                </Col>
            </Row>

            <Title level={4} style={{ marginBottom: 16 }}>Quick Actions</Title>
            <Row gutter={[16, 16]}>
                {actions.map((act, i) => (
                    <Col xs={24} md={12} lg={6} key={i}>
                        <Card
                            hoverable
                            onClick={() => navigate(act.path)}
                            style={{ borderRadius: 8 }}
                        >
                            <Space align="start">
                                <div style={{
                                    padding: 12,
                                    background: '#f0f2f5',
                                    borderRadius: 6,
                                    fontSize: 20,
                                    color: '#1d3557'
                                }}>
                                    {act.icon}
                                </div>
                                <div>
                                    <Text strong style={{ fontSize: 16, display: 'block' }}>{act.title}</Text>
                                    <Text type="secondary" style={{ fontSize: 13 }}>{act.desc}</Text>
                                </div>
                            </Space>
                            <div style={{ marginTop: 12, textAlign: 'right' }}>
                                <ArrowRightOutlined style={{ color: '#1d3557' }} />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default AdminHome;
