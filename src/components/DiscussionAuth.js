import React, { useState } from 'react';
import { Modal, Input, Button, Select, message } from 'antd';

const { Option } = Select;

const CustomAuth = ({ visible, onClose, mode = 'login' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setTimeout(() => {
      message.success(`Successfully ${mode === 'login' ? 'Logged In' : 'Registered'} (Mock)`);
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      open={visible}
      title={mode === 'login' ? "Login to Portal" : "Register for Portal"}
      onCancel={onClose}
      footer={null}
    >
      <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 16 }} />
      <Input.Password placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ marginBottom: 16 }} />

      {mode === 'register' && (
        <>
          <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ marginBottom: 16 }} />
          <Select value={role} onChange={setRole} style={{ width: '100%', marginBottom: 16 }}>
            <Option value="student">Student</Option>
            <Option value="teacher">Teacher</Option>
          </Select>
        </>
      )}

      <Button type="primary" block onClick={handleAuth} loading={loading}>
        {mode === 'login' ? "Login" : "Register"}
      </Button>
    </Modal>
  );
};

export default CustomAuth;