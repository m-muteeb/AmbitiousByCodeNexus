// src/Router.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/Frontend/HomePage';
import Dashboard from './pages/AdminDashboard';
import FrontEnd from './pages/Frontend';
import Auth from './pages/Auth/index';
import InstitutionAdminPage from './components/institutionadmin';
import PrivateRoute from './components/PrivateRoute';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* SUPERADMIN ONLY */}
      <Route 
        path="/dashboard/*"   
        element={
          <PrivateRoute requiredRoles={['superadmin']}>
            <Dashboard />
          </PrivateRoute>
        } 
      />

      {/* ADMIN AND SUPERADMIN */}
      <Route 
        path="/institutionpage" 
        element={
          <PrivateRoute requiredRoles={['admin', 'superadmin' , 'premium']}>  

          {/* There will be the admin */}
            <InstitutionAdminPage />
          </PrivateRoute>
        } 
      />

      {/* Auth and Frontend */}
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/*" element={<FrontEnd />} />
    </Routes>
  );
}
