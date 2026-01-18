import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: profileData, error } = await signIn(email, password);
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    setError('Invalid email or password.');
                } else {
                    setError(error.message || 'Failed to login');
                }
            } else {
                if (profileData && (profileData.role === 'admin' || profileData.role === 'superadmin')) {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wide-container">
            <div className="auth-simple-card" style={{ maxWidth: '450px' }}>
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Login to continue your academic journey</p>
                </div>

                {error && <Alert variant="danger" style={{ borderRadius: '8px' }}>{error}</Alert>}

                <Form onSubmit={handleSubmit} className="auth-form-modern">
                    <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button type="submit" className="auth-primary-btn" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
                    </Button>
                </Form>

                <div className="auth-footer">
                    <span>Don't have an account? </span>
                    <Link to="/auth/register" className="auth-link">Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
