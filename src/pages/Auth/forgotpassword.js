import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Password reset email sent (Mock).');
    } catch (err) {
      setError('Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        <Form onSubmit={handleSubmit} className="auth-form">
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Sending...' : 'Reset Password'}
          </Button>
        </Form>
        <div className="mt-3 text-center">
          <Link to="/auth/login" className="auth-link">Back to Login</Link>
        </div>
      </div>
    </Container>
  );
};

export default ForgotPassword;
