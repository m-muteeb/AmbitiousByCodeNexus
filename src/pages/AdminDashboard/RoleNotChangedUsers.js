import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Popconfirm,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Tag,
  Row,
  Col,
  Space,
  Typography
} from "antd";
import {
  UserDeleteOutlined,
  EditOutlined,
  UserSwitchOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { supabase } from "../../config/supabase";

const { Option } = Select;
const { Title } = Typography;

const RoleManager = () => {
  // We'll fetch ALL profiles once and split them in the UI
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for Editing
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Fetch all profiles
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Fetch Roles Error:", error);
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Update User Role/Profile
  const handleUpdate = async (values) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          institution_name: values.institution_name,
          role: values.role
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      message.success("User Profile Updated Successfully");
      setIsModalVisible(false);
      fetchProfiles();
    } catch (error) {
      console.error("Update Error:", error);
      message.error("Failed to update user");
    }
  };

  // Delete User (Only from profiles table for now as per previous logic)
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      message.success("User removed from database");
      fetchProfiles();
    } catch (error) {
      console.error("Delete Error:", error);
      message.error("Failed to delete user");
    }
  };

  // Categorize Users
  const pendingUsers = profiles.filter(p => p.role === 'user');
  const institutionalAdmins = profiles.filter(p => p.role === 'admin' || p.role === 'premium');
  const superAdmins = profiles.filter(p => p.role === 'superadmin');

  // Common Action Columns
  const actionColumn = {
    title: "Actions",
    key: "action",
    render: (_, record) => (
      <Space>
        <Tooltip title="Promote / Edit">
          <Button
            type="primary"
            ghost
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue({ ...record });
              setIsModalVisible(true);
            }}
          />
        </Tooltip>
        {!record.role.includes('superadmin') && (
          <Popconfirm
            title="Are you sure delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger shape="circle" icon={<UserDeleteOutlined />} />
          </Popconfirm>
        )}
      </Space>
    ),
  };

  // Columns Definitions
  const baseColumns = [
    {
      title: "Institution / Name",
      dataIndex: "institution_name",
      key: "name",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{text || record.full_name}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.email}</div>
        </div>
      )
    },
    {
      title: "Current Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = 'default';
        let icon = null;
        if (role === 'admin') { color = 'processing'; icon = <InfoCircleOutlined />; }
        if (role === 'premium') { color = 'gold'; icon = <CrownOutlined />; }
        if (role === 'superadmin') { color = 'purple'; icon = <SafetyCertificateOutlined />; }
        return <Tag color={color} icon={icon}>{role.toUpperCase()}</Tag>;
      }
    },
    {
      title: "Joined",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString()
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: 32 }}>Role Management Console</Title>

      <Row gutter={[24, 24]}>

        {/* CARD 1: Pending Requests (Role: 'user') */}
        <Col xs={24} xl={8}>
          <Card
            title={<Space><UserSwitchOutlined style={{ color: '#1890ff' }} /> Pending Requests</Space>}
            style={{ borderRadius: 16, border: 'none', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '12px' }}
          >
            <Table
              dataSource={pendingUsers}
              columns={[...baseColumns.slice(0, 1), actionColumn]}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>

        {/* CARD 2: Institutional Admins (Role: 'admin' or 'premium') */}
        <Col xs={24} xl={8}>
          <Card
            title={<Space><CheckCircleOutlined style={{ color: '#52c41a' }} /> Institutional Admins</Space>}
            style={{ borderRadius: 16, border: 'none', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '12px' }}
          >
            <Table
              dataSource={institutionalAdmins}
              columns={[...baseColumns.slice(0, 2), actionColumn]}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>

        {/* CARD 3: Superadmins (Role: 'superadmin') */}
        <Col xs={24} xl={8}>
          <Card
            title={<Space><SafetyCertificateOutlined style={{ color: '#722ed1' }} /> Superadmin Roles</Space>}
            style={{ borderRadius: 16, border: 'none', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '12px' }}
          >
            <Table
              dataSource={superAdmins}
              columns={baseColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>

      </Row>

      {/* Edit Modal */}
      <Modal
        title="Manage User Role"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="institution_name" label="Institution Name" rules={[{ required: true }]}>
            <Input prefix={<TeamOutlined />} />
          </Form.Item>
          <Form.Item name="full_name" label="Contact Person">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Assign Role" rules={[{ required: true }]}>
            <Select>
              <Option value="user">User (Standard)</Option>
              <Option value="admin">
                <Space><InfoCircleOutlined /> Demo Admin</Space>
              </Option>
              <Option value="premium">
                <Space><CrownOutlined style={{ color: '#faad14' }} /> Premium Member</Space>
              </Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Update Profile
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManager;
