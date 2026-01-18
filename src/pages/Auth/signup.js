import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { CloudUploadOutlined, UserOutlined } from '@ant-design/icons';
import './Auth.css';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        institutionName: '',
        password: '',
        confirmPassword: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Logo size should be less than 2MB');
                return;
            }
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result);
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const uploadLogo = async (userId) => {
        if (!logoFile) return null;
        try {
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('institution-logos')
                .upload(fileName, logoFile);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('institution-logos')
                .getPublicUrl(fileName);

            return data.publicUrl;
        } catch (err) {
            console.error('Logo upload failed:', err);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { data: { user }, error: signUpError } = await signUp(formData.email, formData.password, {
                full_name: formData.fullName,
                institution_name: formData.institutionName,
                role: 'user', // Default role
            });

            if (signUpError) throw signUpError;

            if (user && logoFile) {
                const logoUrl = await uploadLogo(user.id);
                if (logoUrl) {
                    await supabase
                        .from('profiles')
                        .update({ logo_url: logoUrl })
                        .eq('id', user.id);
                }
            }

            setSuccess('Registration successful! Please check your email to confirm your account.');
            setTimeout(() => navigate('/auth/login'), 4000);
        } catch (err) {
            console.error('Signup error:', err);
            setError(err.message || 'An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wide-container">
            <div className="auth-simple-card">
                <div className="auth-header">
                    <h2>Institution Registration</h2>
                    <p>Register your academy to access branded premium test series</p>
                </div>

                {error && <Alert variant="danger" style={{ borderRadius: '8px' }}>{error}</Alert>}
                {success && <Alert variant="success" style={{ borderRadius: '8px' }}>{success}</Alert>}

                <Form onSubmit={handleSubmit} className="auth-form-modern">
                    <div className="signup-grid">
                        <div className="signup-fields">
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter your name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Institution Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="institutionName"
                                    placeholder="e.g. Ambitious Academy"
                                    value={formData.institutionName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="signup-logo-side">
                            <Form.Label>Institution Branding (Logo)</Form.Label>
                            <label className="logo-upload-box" htmlFor="logo-input">
                                {logoPreview ? (
                                    <div className="logo-preview-circle">
                                        <img src={logoPreview} alt="Logo Preview" />
                                    </div>
                                ) : (
                                    <div className="logo-preview-circle">
                                        <UserOutlined style={{ fontSize: '2.5rem', color: '#dee2e6' }} />
                                    </div>
                                )}
                                <div style={{ fontWeight: 700, color: '#1d3557' }}>
                                    <CloudUploadOutlined /> {logoFile ? 'Replace Logo' : 'Upload Logo'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                                    PNG, JPG (Max 2MB)
                                </div>
                                <input
                                    type="file"
                                    id="logo-input"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    style={{ display: 'none' }}
                                />
                            </label>

                            <div style={{ marginTop: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', fontSize: '12px', color: '#495057' }}>
                                <strong>Tip:</strong> Your logo will be used to automatically brand any test papers you download from the Paid Series.
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="auth-primary-btn" disabled={loading} style={{ marginTop: '25px' }}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Complete Registration'}
                    </Button>
                </Form>

                <div className="auth-footer">
                    <span>Already have an account? </span>
                    <Link to="/auth/login" className="auth-link">Login Here</Link>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
