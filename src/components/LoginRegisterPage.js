import React, { useState } from 'react';
import { Input, Button, Card, message, Spin, Divider, Form, Typography, Space } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined,
  LoginOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { discussionAuth } from '../config/discussionfirebase';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginRegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      
      if (!email || !password || (!isLogin && !name)) {
        message.warning('Please fill in all required fields');
        return;
      }

      setLoading(true);

      if (isLogin) {
        // Login user
        await signInWithEmailAndPassword(discussionAuth, email, password);
        message.success('Logged in successfully');
      } else {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(
          discussionAuth,
          email,
          password
        );

        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }

        message.success('Account created successfully');
      }

      // Redirect to /fourm
      navigate('/fourm');
    } catch (error) {
      if (error.errorFields) {
        // Form validation errors
        message.error('Please check the form for errors');
      } else {
        // Firebase errors
        message.error(error.code.replace('auth/', '').replace(/-/g, ' '));
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    form.resetFields();
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
     
      padding: '20px'
    }}>
      <Card
        style={{ 
          width: '100%', 
          maxWidth: 440,
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          marginTop: '50px'
        }}
        bodyStyle={{ padding: 32 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28  }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Title>
          <Text type="secondary">
            {isLogin ? 'Sign in to continue to your account' : 'Join our community to start discussing'}
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {!isLogin && (
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Please input your full name!' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Full Name"
                size="large"
                onChange={(e) => setName(e.target.value)}
                style={{ marginBottom: 16 }}
              />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Email"
              type="email"
              size="large"
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: 16 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Password"
              size="large"
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginBottom: 24 }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              icon={isLogin ? <LoginOutlined /> : <UserAddOutlined />}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>Or</Divider>

        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="link" 
              onClick={switchMode}
              disabled={loading}
              icon={<ArrowRightOutlined />}
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LoginRegisterPage;