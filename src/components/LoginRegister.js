import React, { useState } from 'react';
import { supabase } from '../config/supabase';
import { Input, Button, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !username)) {
      message.error('Please fill all required fields');
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        message.success('Login successful');
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });
        if (error) throw error;
        message.success('Registration successful, please check your email to verify.');
        navigate('/');
      }
    } catch (err) {
      message.error(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
      <Card title={isLogin ? 'Login' : 'Register'} style={{ width: 400 }}>
        {!isLogin && (
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: 10 }}
          />
        )}
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input.Password
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Button type="primary" onClick={handleSubmit} block>
          {isLogin ? 'Login' : 'Register'}
        </Button>
        <Button type="link" onClick={() => setIsLogin(!isLogin)} block>
          {isLogin ? 'New user? Register here' : 'Already have an account? Login'}
        </Button>
      </Card>
    </div>
  );
};

export default LoginRegister;
