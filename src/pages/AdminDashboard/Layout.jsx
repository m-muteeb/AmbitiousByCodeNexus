import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Button, Breadcrumb, Typography, ConfigProvider } from 'antd';
import {
    ArrowLeftOutlined,
    HomeOutlined,
    DashboardOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isHomePage = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1d3557',
                    borderRadius: 8,
                },
            }}
        >
            <Layout style={{ minHeight: '100vh', background: '#f8f9fa' }}>
                <Header style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    width: '100%',
                    background: '#fff',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    height: '64px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {!isHomePage && (
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/dashboard')}
                                style={{ marginRight: 16 }}
                            >
                                Back to Hub
                            </Button>
                        )}
                        <Title level={4} style={{ margin: 0, color: '#1d3557', fontWeight: 700 }}>
                            <DashboardOutlined style={{ marginRight: 8 }} />
                            Admin Console
                        </Title>
                    </div>
                    <Button
                        type="default"
                        onClick={() => navigate('/')}
                        style={{ borderRadius: '6px' }}
                    >
                        Back to Website
                    </Button>
                </Header>

                <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                            <HomeOutlined />
                        </Breadcrumb.Item>
                        {location.pathname.split('/').filter(i => i && i !== 'dashboard').map((item, index) => (
                            <Breadcrumb.Item key={index}>
                                {item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, ' ')}
                            </Breadcrumb.Item>
                        ))}
                    </Breadcrumb>

                    <div style={{ minHeight: 400 }}>
                        {children}
                    </div>
                </Content>

                <Footer style={{ textAlign: 'center', background: 'transparent', color: '#888', padding: '24px 0' }}>
                    Ambitious Academic Portal ©{new Date().getFullYear()} - Admin Dashboard
                </Footer>
            </Layout>
        </ConfigProvider>
    );
};

export default DashboardLayout;
