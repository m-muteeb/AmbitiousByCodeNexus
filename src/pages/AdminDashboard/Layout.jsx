import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, ConfigProvider, Space, Avatar, Dropdown } from 'antd';
import {
    DashboardOutlined,
    PlusOutlined,
    FileTextOutlined,
    TeamOutlined,
    TrophyOutlined,
    BarChartOutlined,
    HomeOutlined,
    LogoutOutlined,
    UserOutlined,
    MenuOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile, signOut } = useAuth();

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Home',
        },
        {
            key: '/dashboard/addContent',
            icon: <PlusOutlined />,
            label: 'Add',
        },
        {
            key: '/dashboard/manageContent',
            icon: <FileTextOutlined />,
            label: 'Library',
        },
        {
            key: '/dashboard/allowusers',
            icon: <TeamOutlined />,
            label: 'Users',
        },
        {
            key: '/dashboard/result-portal/manage',
            icon: <TrophyOutlined />,
            label: 'Results',
        },
        {
            key: '/dashboard/result-portal/report',
            icon: <BarChartOutlined />,
            label: 'Reports',
        },
    ];

    const mobileMenu = (
        <Menu
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={[...menuItems, { type: 'divider' }, { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, danger: true }]}
        />
    );

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1d3557',
                    borderRadius: 6,
                    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                },
                components: {
                    Layout: {
                        headerBg: '#ffffff',
                    }
                }
            }}
        >
            <Layout style={{ minHeight: '100vh', background: '#f8f9fa' }}>
                <Header style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    width: '100%',
                    padding: '0 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e9ecef',
                    height: '64px',
                    background: '#fff'
                }}>
                    <Space size="large" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                            <Title level={4} style={{ margin: 0, color: '#1d3557', fontWeight: 800, whiteSpace: 'nowrap' }}>AMBITIOUS</Title>
                        </div>

                        {/* Desktop Horizontal Menu */}
                        <Menu
                            mode="horizontal"
                            selectedKeys={[location.pathname]}
                            onClick={({ key }) => navigate(key)}
                            items={menuItems}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                minWidth: 400,
                                flex: 1
                            }}
                            className="desktop-menu"
                        />
                    </Space>

                    <Space size="middle">
                        <Button
                            icon={<HomeOutlined />}
                            type="text"
                            onClick={() => navigate('/')}
                            className="desktop-menu"
                        >
                            Website
                        </Button>

                        {/* Mobile Menu Icon */}
                        <Dropdown overlay={mobileMenu} trigger={['click']} placement="bottomRight">
                            <Button
                                className="mobile-only-btn"
                                type="text"
                                icon={<MenuOutlined />}
                                style={{ display: 'none' }}
                            />
                        </Dropdown>

                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f3f5', padding: '4px 12px', borderRadius: 20 }}>
                            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1d3557', marginRight: 8 }} />
                            <Text strong style={{ fontSize: 13 }} className="desktop-menu">{profile?.full_name?.split(' ')[0] || 'Admin'}</Text>
                        </div>

                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            onClick={signOut}
                            danger
                            className="desktop-menu"
                        />
                    </Space>

                    <style>{`
                        @media (max-width: 900px) {
                            .desktop-menu { display: none !important; }
                            .mobile-only-btn { display: inline-flex !important; align-items: center; justify-content: center; }
                        }
                    `}</style>
                </Header>

                <Content style={{ padding: '20px 0' }}>
                    <div style={{ width: '95%', maxWidth: '1400px', margin: '0 auto' }}>
                        {children}
                    </div>
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default DashboardLayout;
