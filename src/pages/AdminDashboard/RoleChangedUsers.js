import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const RoleChangedUsers = ({ goBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({}); // Store selected role for each user

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const filteredUsers = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'admin' || user.role === 'premium');

      // Initialize role selection
      const roleMap = {};
      filteredUsers.forEach(user => {
        roleMap[user.id] = user.role;
      });

      setSelectedRoles(roleMap);
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId) => {
    const newRole = selectedRoles[userId];
    setUpdatingId(userId);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      await fetchUsers();
    } catch (err) {
      console.error('Failed to update role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  if (loading) return <p>Loading users...</p>;
  if (!users.length) return <p>No users with roles "admin" or "premium" found.</p>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <button
        onClick={goBack}
        style={{
          marginBottom: '15px',
          backgroundColor: '#1976d2',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ⬅ Back
      </button>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      }}>
        <thead>
          <tr style={{
            backgroundColor: '#1976d2',
            color: 'white',
            textAlign: 'center'
          }}>
            <th style={cellStyle}>#</th>
            <th style={cellStyle}>Logo</th>
            <th style={cellStyle}>Institution</th>
            <th style={cellStyle}>Email</th>
            <th style={cellStyle}>Phone</th>
            <th style={cellStyle}>Address</th>
            <th style={cellStyle}>Role</th>
            <th style={cellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id} style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>
              <td style={cellStyle}>{idx + 1}</td>
              <td style={cellStyle}>
                <img
                  src={user.logoUrl || 'https://via.placeholder.com/40'}
                  alt="logo"
                  style={{ width: 40, height: 40, borderRadius: '50%' }}
                />
              </td>
              <td style={cellStyle}>{user.institutionName || 'N/A'}</td>
              <td style={cellStyle}>{user.email}</td>
              <td style={cellStyle}>{user.phoneNumber || 'N/A'}</td>
              <td style={cellStyle}>{user.address || 'N/A'}</td>
              <td style={cellStyle}>
                <select
                  value={selectedRoles[user.id]}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    fontSize: '13px'
                  }}
                >
                  <option value="admin">Demo</option>
                  <option value="premium">Premium</option>
                </select>
              </td>
              <td style={cellStyle}>
                <button
                  onClick={() => updateRole(user.id)}
                  disabled={updatingId === user.id}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {updatingId === user.id ? 'Updating...' : 'Save Role'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const cellStyle = {
  padding: '10px',
  fontSize: '14px'
};

export default RoleChangedUsers;
