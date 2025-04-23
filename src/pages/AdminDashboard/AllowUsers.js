import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import '../../assets/css/allowuser.css';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.seconds
              ? new Date(data.timestamp.seconds * 1000)
              : new Date(0),
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp); // Sort by latest
      setUsers(userList);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
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

  return (
    <div className="admin-user-list">
      <h2 className="page-title">Registered Institutions</h2>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="no-users">No users found.</div>
      ) : (
        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Logo</th>
                <th>Institution</th>
                <th>Email</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>
                    {user.logoUrl ? (
                      <img
                        src={user.logoUrl}
                        alt="Logo"
                        className="institution-logo"
                      />
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{user.institutionName || 'N/A'}</td>
                  <td>{user.email}</td>
                  <td>{user.address || 'N/A'}</td>
                  <td>{user.phoneNumber || 'N/A'}</td>
                  <td className={`role-tag ${user.role}`}>{user.role}</td>
                  <td>
                    {user.timestamp
                      ? user.timestamp.toLocaleString()
                      : 'Unknown'}
                  </td>
                  <td>
                    <button
                      className="make-admin-btn"
                      disabled={updatingId === user.id}
                      onClick={() => toggleRole(user.id, user.role)}
                    >
                      {updatingId === user.id
                        ? 'Updating...'
                        : user.role === 'admin'
                        ? 'Demote to User'
                        : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;
