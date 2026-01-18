import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin, Button, Result, Space } from 'antd';

const PrivateRoute = ({ children, requiredRoles = [] }) => {
    const { user, profile, loading, signOut } = useAuth();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#f8f9fa'
            }}>
                <Spin size="large" tip="Verifying secure access..." />
                <p style={{ marginTop: 20, color: '#666' }}>This should only take a moment.</p>

                {/* Safeguard for the user if something goes wrong with session initialization */}
                <Button
                    type="link"
                    onClick={() => signOut()}
                    style={{ marginTop: 40, color: '#999' }}
                >
                    Taking too long? Click here to reset session
                </Button>
            </div>
        );
    }

    // Redirect to login if no user is authenticated
    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    // Check if user profile was loaded
    if (!profile) {
        return (
            <div style={{ padding: '40px' }}>
                <Result
                    status="403"
                    title="Profile Sync Error"
                    subTitle="We found your account but couldn't sync your profile data. Please try logging out and back in."
                    extra={
                        <Button type="primary" onClick={() => signOut()}>
                            Sign Out & Retry
                        </Button>
                    }
                />
            </div>
        );
    }

    // Superadmin has access to everything
    if (profile.role === 'superadmin') {
        return children;
    }

    // Check if user's role matches required roles
    if (requiredRoles.length > 0 && !requiredRoles.includes(profile.role)) {
        return (
            <div style={{ padding: '40px' }}>
                <Result
                    status="warning"
                    title="Access Restricted"
                    subTitle={`This area requires ${requiredRoles.join(' or ')} permissions. Your current rank is ${profile.role.toUpperCase()}.`}
                    extra={
                        <Space direction="vertical">
                            <p>If you recently registered, please wait for an administrator to approve your request.</p>
                            <Button type="primary" onClick={() => window.location.href = '/'}>
                                Back to Home
                            </Button>
                        </Space>
                    }
                />
            </div>
        );
    }

    return children;
};

export default PrivateRoute;
