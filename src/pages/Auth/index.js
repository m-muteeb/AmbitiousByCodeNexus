// src/pages/Auth/index.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './login.js';
import ForgotPassword from './forgotpassword.js';
import SignupPage from './signup.js';

export default function AuthRouter() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="register" element={<SignupPage />} />
    </Routes>
  );
}
