// src/components/PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Spin } from 'antd';

const PrivateRoute = ({ children, requiredRoles = [] }) => {
  const [user, loading] = useAuthState(auth);
  const [checkingRole, setCheckingRole] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const role = userSnap.data().role;
          setUserRole(role);

          // Check if user's role is in the list of required roles
          if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
            setUnauthorized(true);
          }
        } else {
          setUnauthorized(true);
        }
      }
      setCheckingRole(false);
    };

    if (user) {
      checkUserRole();
    } else {
      setCheckingRole(false);
    }
  }, [user, requiredRoles]);

  if (loading || checkingRole) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;

  if (unauthorized) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1>🚫 Access Denied</h1>
        <p style={{ fontSize: '18px', marginTop: '10px' }}>
          You do not have access to this page.<br />
          Please <strong>contact the admin</strong> if you believe this is a mistake.
        </p>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
