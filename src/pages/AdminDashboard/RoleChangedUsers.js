import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Tooltip, Avatar, Tag, Modal, Form, Select, Input, Card } from 'antd';
import { DeleteOutlined, EditOutlined, ArrowLeftOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { supabase } from '../../config/supabase';

const { Option } = Select;

const RoleChangedUsers = ({ goBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      // Use the standard client for proper session handling
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'superadmin'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Fetch admins error:', error);
      message.error('Failed to load administrator list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      message.success("Administrator record deleted from system");
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Delete user error:', error);
      message.error('Failed to remove administrator: ' + error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...values,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      message.success("Administrator record updated");
      setIsModalVisible(false);
      fetchAdmins();
    } catch (error) {
      console.error('Update user error:', error);
      message.error('Failed to update administrator');
    }
  };

  const columns = [
    {
      title: 'Admin',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.logo_url} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.full_name || 'N/A'}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Institution',
      dataIndex: 'institution_name',
      key: 'institution_name',
      responsive: ['md'],
      render: (text) => text || 'General',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'superadmin' ? 'purple' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Remove Admin?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ margin: '20px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
          Dashboard
        </Button>
        <h2 style={{ margin: 0, fontWeight: 800 }}>System Administrators</h2>
        <Button icon={<ReloadOutlined />} onClick={fetchAdmins} loading={loading} />
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
        scroll={{ x: true }}
      />

      <Modal
        title="Edit Admin Permissions"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="full_name" label="Display Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="institution_name" label="Institution / Department">
            <Input placeholder="Leave empty for central admin" />
          </Form.Item>
          <Form.Item name="role" label="Role Assignment" rules={[{ required: true }]}>
            <Select>
              <Option value="admin">Administrator</Option>
              <Option value="superadmin">Super Administrator</Option>
              <Divider />
              <Option value="user">Demote to Standard User</Option>
              <Option value="premium">Switch to Premium Member</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 10, borderRadius: '8px' }}>
            Save Permissions
          </Button>
        </Form>
      </Modal>
    </Card>
  );
};

// Simple divider shim
const Divider = () => <div style={{ height: '1px', background: '#f0f0f0', margin: '4px 0' }} />;

export default RoleChangedUsers;
