import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const RoleNotChangedUsers = ({ goBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const filtered = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'user'); // only users with role 'user'
      setUsers(filtered);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    setLoading(false);
  };

  const updateRole = async (id, newRole) => {
    if (!newRole) return;
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, 'users', id), { role: newRole });
      // remove updated user from list immediately (since role changed)
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error('Error updating role:', err);
    }
    setUpdatingId(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={goBack}
        style={{
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 18px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontWeight: '600',
        }}
      >
        ⬅ Back
      </button>

      <h3 style={{ marginBottom: '15px' }}>Role Not Changed Users</h3>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users with role "user" found.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#1976d2',
                color: '#fff',
                textAlign: 'center',
              }}
            >
              <th style={thTdStyle}>#</th>
              <th style={thTdStyle}>Institution</th>
              <th style={thTdStyle}>Email</th>
              <th style={thTdStyle}>Phone</th>
              <th style={thTdStyle}>Address</th>
              <th style={thTdStyle}>Current Role</th>
              <th style={thTdStyle}>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user.id} style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                <td style={thTdStyle}>{idx + 1}</td>
                <td style={thTdStyle}>{user.institutionName || 'N/A'}</td>
                <td style={thTdStyle}>{user.email}</td>
                <td style={thTdStyle}>{user.phoneNumber || 'N/A'}</td>
                <td style={thTdStyle}>{user.address || 'N/A'}</td>
                <td style={thTdStyle}>{user.role}</td>
                <td style={thTdStyle}>
                  <select
                    disabled={updatingId === user.id}
                    defaultValue=""
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '5px',
                      border: '1px solid #ccc',
                      cursor: updatingId === user.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <option value="" disabled>
                      {updatingId === user.id ? 'Updating...' : 'Select Role'}
                    </option>
                    <option value="admin">Admin (Allow Demo)</option>
                    <option value="premium">Premium (Allow Premium)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const thTdStyle = {
  padding: '12px',
  fontSize: '14px',
};

export default RoleNotChangedUsers;
