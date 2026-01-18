import React, { useEffect, useState } from 'react';
import { Table, Button, Switch, Card, Typography, message, Tag, Space, Avatar, Empty } from 'antd';
import { ArrowLeftOutlined, UserOutlined, ReloadOutlined, CrownOutlined } from '@ant-design/icons';
import { supabase } from '../../config/supabase';

const { Title, Text } = Typography;

const PremiumUsers = ({ goBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [premiumTopicsCount, setPremiumTopicsCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users with 'premium' role using standard client
      const { data: userProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'premium')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Fetch topics count that are marked as premium
      const { count, error: countError } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true);

      if (countError) throw countError;

      setUsers(userProfiles || []);
      setPremiumTopicsCount(count || 0);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to load premium management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card style={{ margin: '20px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '15px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
          Dashboard
        </Button>
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            <CrownOutlined style={{ color: '#faad14', marginRight: 10 }} />
            Premium Member Directory
          </Title>
          <Text type="secondary">Managing {users.length} active premium accounts</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px' }}>
            <ReloadOutlined spin style={{ fontSize: 40, color: '#1890ff' }} />
            <p style={{ marginTop: 20 }}>Syncing premium database...</p>
          </div>
        ) : users.length > 0 ? (
          users.map(u => (
            <Card
              key={u.id}
              hoverable
              style={{ borderRadius: '15px', overflow: 'hidden', border: '1px solid #f0f0f0' }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <Avatar size={64} src={u.logo_url} icon={<UserOutlined />} style={{ backgroundColor: '#fffbe6' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1d3557' }}>{u.full_name || 'Anonymous Member'}</div>
                  <Tag color="gold" style={{ fontWeight: 600 }}>PREMIUM STATUS</Tag>
                </div>
              </div>

              <div style={{ backgroundColor: '#fdfdfd', padding: '15px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">Email:</Text>
                  <Text strong>{u.email}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">Institution:</Text>
                  <Text strong>{u.institution_name || 'Individual Student'}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Access Level:</Text>
                  <Text type="success" strong>Full Library Access</Text>
                </div>
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  User currently has verified access to all <b>{premiumTopicsCount}</b> premium resources on the portal.
                </Text>
              </div>
            </Card>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <Empty description="No premium members currently registered" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default PremiumUsers;
