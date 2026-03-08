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
  const [counts, setCounts] = useState({ student: 0, changed: 0, premium: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); // 'dashboard', 'user-console', 'changed', 'premium'
  const navigate = useNavigate();

  const fetchUserCounts = async () => {
    setLoading(true);
    try {
      const allProfiles = await supabaseApi.fetch('profiles');
      const pending = allProfiles.filter(u => u.role === 'user').length;
      const changed = allProfiles.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
      const premium = allProfiles.filter(u => u.role === 'premium').length;
      const student = allProfiles.filter(u => u.role === 'student').length;

      setCounts({ pending, changed, premium, student });
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
  if (view === 'user-console') return <RoleNotChangedUsers goBack={() => { setView('dashboard'); fetchUserCounts(); }} />;
  if (view === 'changed') return <RoleChangedUsers goBack={() => { setView('dashboard'); fetchUserCounts(); }} />;
  if (view === 'premium') return <PremiumUser goBack={() => { setView('dashboard'); fetchUserCounts(); }} />;

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ flex: 1 }} />
        <Title level={2} style={{ margin: 0, textAlign: 'center', flex: 3 }}>Users Management Hub</Title>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <Button icon={<ReloadOutlined />} onClick={fetchUserCounts} loading={loading}>Refresh Stats</Button>
        </div>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {/* Main Console Button */}
        <Col xs={24} style={{ textAlign: 'center', marginBottom: 20 }}>
          <Button
            type="primary"
            size="large"
            icon={<ReloadOutlined />}
            onClick={() => setView('user-console')}
            style={{ height: 60, padding: '0 40px', fontSize: 18, borderRadius: 30 }}
          >
            Open Unified User Console
          </Button>
        </Col>

        {/* Card for Students */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ textAlign: 'center', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Statistic
              title="Students"
              value={counts.student}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>Registered student accounts</div>
          </Card>
        </Col>

        {/* Card for Institutions */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ textAlign: 'center', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Statistic
              title="Institutions"
              value={counts.changed}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>Active institutional admins</div>
          </Card>
        </Col>

        {/* Card for Premium Users */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ textAlign: 'center', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Statistic
              title="Premium"
              value={counts.premium}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>Members with full access</div>
          </Card>
        </Col>

        {/* Card for Pending (Legacy) */}
        {counts.pending > 0 && (
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(255, 169, 64, 0.1)' }}
            >
              <Statistic
                title="Pending Approval"
                value={counts.pending}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#ffa940' }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>Legacy manual requests</div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default AdminUserList;
