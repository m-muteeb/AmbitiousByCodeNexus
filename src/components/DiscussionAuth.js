import React, { useState } from 'react';
import { supabase } from '../config/supabase';
import { Modal, Input, Button, Select, message } from 'antd';

const { Option } = Select;

const CustomAuth = ({ visible, onClose, mode = 'login' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState(mode);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        message.success('Logged in successfully!');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              role,
            },
          },
        });
        if (error) throw error;
        
        // Create profile after successful signup
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                username,
                role,
              },
            ]);
          
          if (profileError) throw profileError;
        }
        
        message.success('Account created successfully! Please check your email for verification.');
      }
      onClose();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={authMode === 'login' ? 'Login' : 'Create Account'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <div className="auth-form">
        {authMode === 'register' && (
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        
        <Input.Password
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        
        {authMode === 'register' && (
          <Select
            value={role}
            onChange={setRole}
            style={{ width: '100%', marginBottom: 16 }}
          >
            <Option value="student">Student</Option>
            <Option value="myrole">My Role</Option>
          </Select>
        )}
        
        <Button
          type="primary"
          onClick={handleAuth}
          loading={loading}
          style={{ width: '100%', marginBottom: 16 }}
        >
          {authMode === 'login' ? 'Login' : 'Sign Up'}
        </Button>
        
        <div style={{ textAlign: 'center' }}>
          {authMode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <Button type="link" onClick={() => setAuthMode('register')}>
                Sign up
              </Button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <Button type="link" onClick={() => setAuthMode('login')}>
                Login
              </Button>
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CustomAuth;