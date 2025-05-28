import React, { useState, useEffect } from 'react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../config/firebase';
import RoleNotChangedUsers from './RoleNotChangedUsers';
import RoleChangedUsers from './RoleChangedUsers';
import { FaUserCog, FaUserCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';  // <-- import this
import '../../assets/css/allowuser.css';

const AdminUserList = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [counts, setCounts] = useState({ notChanged: 0, changed: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // <-- initialize

  useEffect(() => {
    const fetchUserCounts = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');

        const notChangedQuery = query(usersRef, where('role', '==', 'user'));
        const notChangedSnapshot = await getCountFromServer(notChangedQuery);

        const changedQuery = query(usersRef, where('role', 'in', ['admin', 'premium']));
        const changedSnapshot = await getCountFromServer(changedQuery);

        setCounts({
          notChanged: notChangedSnapshot.data().count,
          changed: changedSnapshot.data().count,
        });
      } catch (err) {
        console.error('Error fetching user counts:', err);
      }
      setLoading(false);
    };

    fetchUserCounts();
  }, []);

  return (
    <div className="admin-dashboard-container">
      <h2 className="admin-title">Registered Institutions</h2>

      {!activeTab && (
        <div className="card-container">
          <div className="card" onClick={() => setActiveTab('notChanged')}>
            <FaUserCog className="card-icon" />
            <h3>Role Not Changed Users</h3>
            <p className="user-count">{loading ? '...' : counts.notChanged}</p>
          </div>
          <div className="card" onClick={() => setActiveTab('changed')}>
            <FaUserCheck className="card-icon" />
            <h3>Role Changed Users</h3>
            <p className="user-count">{loading ? '...' : counts.changed}</p>
          </div>
        </div>
      )}

      {activeTab === 'notChanged' && (
        <RoleNotChangedUsers goBack={() => setActiveTab(null)} />
      )}
      {activeTab === 'changed' && (
        <RoleChangedUsers goBack={() => setActiveTab(null)} />
      )}

      {/* Add Topic Button */}
      {!activeTab && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/dashboard/addcontent')}
            className="add-topic-btn"
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              padding: '10px 20px',
              fontSize: '16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Add Topic
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;
