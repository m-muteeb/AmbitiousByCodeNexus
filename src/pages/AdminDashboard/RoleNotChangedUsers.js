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
  TeamOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { supabase } from "../../config/supabase";

const { Option } = Select;
const { Title } = Typography;

const RoleManager = ({ goBack }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

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

  const handleUpdate = async (values) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          institution_name: values.institution_name,
          class_name: values.class_name,
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

  const pendingUsers = profiles.filter(p => p.role === 'user');
  const institutionalAdmins = profiles.filter(p => p.role === 'admin' || p.role === 'premium');
  const studentUsers = profiles.filter(p => p.role === 'student');
  const superAdmins = profiles.filter(p => p.role === 'superadmin');

  const actionColumn = {
    title: "Actions",
    key: "action",
    width: 100,
    fixed: 'right',
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

  const baseColumns = [
    {
      title: "Institution / Name",
      dataIndex: "institution_name",
      key: "name",
      minWidth: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{text || record.full_name}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.email}</div>
          {record.class_name && (
            <Tag color="cyan" style={{ marginTop: 4 }}>Class: {record.class_name}</Tag>
          )}
        </div>
      )
    },
    {
      title: "Current Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => {
        let color = 'default';
        let icon = null;
        if (role === 'admin') { color = 'processing'; icon = <InfoCircleOutlined />; }
        if (role === 'premium') { color = 'gold'; icon = <CrownOutlined />; }
        if (role === 'student') { color = 'cyan'; icon = <TeamOutlined />; }
        if (role === 'superadmin') { color = 'purple'; icon = <SafetyCertificateOutlined />; }
        return <Tag color={color} icon={icon}>{role.toUpperCase()}</Tag>;
      }
    },
    {
      title: "Joined",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString()
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>User & Role Console</Title>
        {goBack && <Button onClick={goBack} icon={<ArrowLeftOutlined />} size="large">Back to Hub</Button>}
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={12}>
          <Card
            title={<Space><CheckCircleOutlined style={{ color: '#1890ff' }} /> Institutional (Demo Access)</Space>}
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '0' }}
          >
            <Table
              dataSource={institutionalAdmins}
              columns={[...baseColumns, actionColumn]}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="middle"
              loading={loading}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            title={<Space><TeamOutlined style={{ color: '#13c2c2' }} /> Registered Students</Space>}
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '0' }}
          >
            <Table
              dataSource={studentUsers}
              columns={[...baseColumns, actionColumn]}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="middle"
              loading={loading}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>

        {pendingUsers.length > 0 && (
          <Col xs={24} xl={12}>
            <Card
              title={<Space><UserSwitchOutlined style={{ color: '#ffa940' }} /> Manual Approvals</Space>}
              style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              bodyStyle={{ padding: '0' }}
            >
              <Table
                dataSource={pendingUsers}
                columns={[...baseColumns, actionColumn]}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="middle"
                loading={loading}
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </Col>
        )}

        <Col xs={24} xl={12}>
          <Card
            title={<Space><SafetyCertificateOutlined style={{ color: '#722ed1' }} /> Platform Admins</Space>}
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '0' }}
          >
            <Table
              dataSource={superAdmins}
              columns={baseColumns}
              rowKey="id"
              pagination={false}
              size="middle"
              loading={loading}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Manage User Role"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate} initialValues={{ role: 'student' }}>
          <Form.Item name="role" label="Current Role" rules={[{ required: true }]}>
            <Select>
              <Option value="student">Student (Demo)</Option>
              <Option value="admin">Institutional (Demo)</Option>
              <Option value="premium">Premium Member</Option>
              <Option value="superadmin">Superadmin</Option>
            </Select>
          </Form.Item>

          <Form.Item name="full_name" label="Full Name">
            <Input placeholder="User's name" />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
          >
            {({ getFieldValue }) => {
              const role = getFieldValue('role');
              if (role === 'student') {
                return (
                  <Form.Item name="class_name" label="Class / Grade">
                    <Select placeholder="Select Class">
                      <Option value="8th">8th Grade</Option>
                      <Option value="9th">9th Grade</Option>
                      <Option value="10th">10th Grade</Option>
                      <Option value="11th">11th Grade</Option>
                      <Option value="12th">12th Grade</Option>
                      <Option value="ecat">ECAT</Option>
                    </Select>
                  </Form.Item>
                );
              }
              return (
                <Form.Item name="institution_name" label="Institution Name">
                  <Input prefix={<TeamOutlined />} placeholder="e.g. Govt College" />
                </Form.Item>
              );
            }}
          </Form.Item>

          <div style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" block size="large" style={{ borderRadius: 8 }}>
              Update Profile
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManager;
