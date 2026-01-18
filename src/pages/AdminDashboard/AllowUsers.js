import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Spin, Typography, message } from 'antd';
import { UserOutlined, CrownOutlined, SafetyCertificateOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { supabaseApi } from '../../config/supabase';
import RoleNotChangedUsers from './RoleNotChangedUsers';
import RoleChangedUsers from './RoleChangedUsers';
import PremiumUser from './PremiumUser';

const { Title } = Typography;

const AdminUserList = () => {
  const [counts, setCounts] = useState({ notChanged: 0, changed: 0, premium: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); // 'dashboard', 'not-changed', 'changed', 'premium'
  const navigate = useNavigate();

  const fetchUserCounts = async () => {
    setLoading(true);
    try {
      const allProfiles = await supabaseApi.fetch('profiles');
      const notChanged = allProfiles.filter(u => u.role === 'user').length;
      const changed = allProfiles.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
      const premium = allProfiles.filter(u => u.role === 'premium').length;

      setCounts({ notChanged, changed, premium });
    } catch (err) {
      console.error('Error fetching user counts:', err);
      message.error('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCounts();
  }, []);

  if (loading && view === 'dashboard') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Loading system users..." />
      </div>
    );
  }

  // Render Sub-view if active
  if (view === 'not-changed') return <RoleNotChangedUsers goBack={() => { setView('dashboard'); fetchUserCounts(); }} />;
  if (view === 'changed') return <RoleChangedUsers goBack={() => { setView('dashboard'); fetchUserCounts(); }} />;
  if (view === 'premium') return <PremiumUser goBack={() => { setView('dashboard'); fetchUserCounts(); }} />;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ flex: 1 }} />
        <Title level={2} style={{ margin: 0, textAlign: 'center', flex: 2 }}>User Management Center</Title>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <Button icon={<ReloadOutlined />} onClick={fetchUserCounts} loading={loading}>Refresh</Button>
        </div>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {/* Card for Users with 'user' role */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{ textAlign: 'center', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            actions={[
              <Button type="primary" onClick={() => setView('not-changed')}>
                Manage Requests
              </Button>
            ]}
          >
            <Statistic
              title="New User Requests"
              value={counts.notChanged}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>Users waiting for role assignment</div>
          </Card>
        </Col>

        {/* Card for Users with 'admin' role */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{ textAlign: 'center', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            actions={[
              <Button type="primary" onClick={() => setView('changed')}>
                Manage Admins
              </Button>
            ]}
          >
            <Statistic
              title="Active Administrators"
              value={counts.changed}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>Users with system management access</div>
          </Card>
        </Col>

        {/* Card for Premium Users */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{ textAlign: 'center', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            actions={[
              <Button type="primary" onClick={() => setView('premium')}>
                Manage Premium
              </Button>
            ]}
          >
            <Statistic
              title="Premium Members"
              value={counts.premium}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>Users with access to premium content</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminUserList;
