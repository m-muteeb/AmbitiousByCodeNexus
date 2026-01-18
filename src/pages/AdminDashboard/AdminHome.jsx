import React from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import {
    PlusOutlined,
    FileTextOutlined,
    TeamOutlined,
    TrophyOutlined,
    UploadOutlined,
    BarChartOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AdminHome = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            title: 'Add Content',
            description: 'Upload new notes, mcqs, or past papers',
            icon: <PlusOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
            path: '/dashboard/addContent',
            color: '#e6f7ff'
        },
        {
            title: 'Manage Content',
            description: 'View, edit, or delete uploaded educational content',
            icon: <FileTextOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
            path: '/dashboard/manageContent',
            color: '#f6ffed'
        },
        {
            title: 'Result & Student Hub',
            description: 'Define classes, subjects, enroll students, and post results in one place',
            icon: <TrophyOutlined style={{ fontSize: '32px', color: '#faad14' }} />,
            path: '/dashboard/result-portal/manage',
            color: '#fffbe6'
        },
        {
            title: 'Result Reports',
            description: 'View and download result statements and performance analytics',
            icon: <BarChartOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
            path: '/dashboard/result-portal/report',
            color: '#f9f0ff'
        },
        {
            title: 'User Management',
            description: 'Manage user roles, permissions, and institutional access',
            icon: <TeamOutlined style={{ fontSize: '32px', color: '#13c2c2' }} />,
            path: '/dashboard/allowusers',
            color: '#e6fffb'
        }
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
                <Title level={2}>Admin Command Center</Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                    Welcome to your dashboard. Choose an action below to manage your portal.
                </Text>
            </div>

            <Row gutter={[24, 24]}>
                {menuItems.map((item, index) => (
                    <Col xs={24} sm={12} lg={8} key={index}>
                        <Card
                            hoverable
                            onClick={() => navigate(item.path)}
                            style={{
                                height: '100%',
                                borderRadius: 12,
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                overflow: 'hidden'
                            }}
                            bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                        >
                            <div style={{
                                width: 70,
                                height: 70,
                                borderRadius: '50%',
                                backgroundColor: item.color,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 16
                            }}>
                                {item.icon}
                            </div>
                            <Title level={4} style={{ margin: '8px 0' }}>{item.title}</Title>
                            <Text type="secondary">{item.description}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div style={{ marginTop: 48, textAlign: 'center', padding: 24, background: '#fff', borderRadius: 12 }}>
                <Space size="large">
                    <Statistic title="System Status" value="Healthy" valueStyle={{ color: '#52c41a' }} prefix={<SettingOutlined />} />
                    <Statistic title="Server Time" value={new Date().toLocaleTimeString()} />
                </Space>
            </div>
        </div>
    );
};

// Simple Statistic component since antd might not export it directly or user might prefer a styled div
const Statistic = ({ title, value, valueStyle, prefix }) => (
    <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
        <div style={{ fontSize: 24, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', ...valueStyle }}>
            {prefix} <span style={{ marginLeft: 8 }}>{value}</span>
        </div>
    </div>
);

export default AdminHome;
