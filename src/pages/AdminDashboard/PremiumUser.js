import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const PremiumUsers = ({ goBack }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [premiumTests, setPremiumTests] = useState([]);
  const [accessMap, setAccessMap] = useState({});

  useEffect(() => {
    fetchPremiumTests();
    fetchUsers();
  }, []);

  const fetchPremiumTests = async () => {
    const snapshot = await getDocs(collection(db, 'premiumtests'));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPremiumTests(data);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const usersRef = collection(db, 'users');
    const premiumQuery = query(usersRef, where('role', '==', 'premium'));
    const snap = await getDocs(premiumQuery);
    const u = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setUsers(u);

    const roleMap = {}, access = {};
    u.forEach(user => {
      roleMap[user.id] = user.role;
      access[user.id] = new Set(user.allowedAccess || []);
    });
    setSelectedRoles(roleMap);
    setAccessMap(access);
    setLoadingUsers(false);
  };

  const toggleAccess = (userId, className, subject) => {
    setAccessMap(prev => {
      const setCopy = new Set(prev[userId] || []);
      const key = `${className}:${subject}`;
      if (setCopy.has(key)) setCopy.delete(key);
      else setCopy.add(key);
      return { ...prev, [userId]: setCopy };
    });
  };

  const updateRoleAndAccess = async (userId) => {
    setUpdatingId(userId);
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, {
        role: selectedRoles[userId],
        allowedAccess: Array.from(accessMap[userId] || []),
      });
      await fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loadingUsers) return <p>Loading users…</p>;
  if (users.length === 0) return <p>No premium users found.</p>;

  const testsByClassSubject = premiumTests.reduce((acc, test) => {
    const cls = test.class || 'Unknown';
    const subj = test.subject || 'Unknown';
    acc[cls] ||= new Set();
    acc[cls].add(subj);
    return acc;
  }, {});

  return (
    <div style={{ overflowX: 'auto' }}>
      <style>{`
        .access-cell {
          text-align: left;
          max-width: 350px;
          padding: 8px;
        }

        .access-group {
          background-color: #f3f6fa;
          border: 1px solid #cfd8dc;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .access-group-title {
          font-weight: 600;
          margin-bottom: 5px;
          color: #0d47a1;
        }

        .access-checkboxes {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .access-checkbox {
          font-size: 13px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      <button onClick={goBack} style={goBackBtnStyle}>
        ⬅ Back
      </button>
      <table style={tableStyle}>
        <thead>
          <tr style={theadStyle}>
            <th>#</th><th>Logo</th><th>Institution</th><th>Email</th>
            <th>Phone</th><th>Address</th><th>Role</th>
            <th>Allowed Access</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.id} style={trStyle}>
              <td>{idx + 1}</td>
              <td><img src={u.logoUrl || placeholder} style={imgStyle} /></td>
              <td>{u.institutionName || 'N/A'}</td>
              <td>{u.email}</td>
              <td>{u.phoneNumber || 'N/A'}</td>
              <td>{u.address || 'N/A'}</td>
              <td>
                <select
                  value={selectedRoles[u.id]}
                  onChange={e => setSelectedRoles(prev => ({
                    ...prev,
                    [u.id]: e.target.value
                  }))}
                >
                  <option value="premium">premium</option>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="access-cell">
                {Object.entries(testsByClassSubject).map(([cls, subjs]) => (
                  <div className="access-group" key={cls}>
                    <div className="access-group-title">{cls}</div>
                    <div className="access-checkboxes">
                      {[...subjs].map(subj => {
                        const key = `${cls}:${subj}`;
                        const checked = accessMap[u.id]?.has(key);
                        return (
                          <label key={key} className="access-checkbox">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAccess(u.id, cls, subj)}
                            />
                            {subj}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </td>
              <td>
                <button
                  onClick={() => updateRoleAndAccess(u.id)}
                  disabled={updatingId === u.id}
                  style={btnStyle}
                >
                  {updatingId === u.id ? 'Saving…' : 'Save'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Styles
const placeholder = 'https://via.placeholder.com/40';
const goBackBtnStyle = {
  marginBottom: 15,
  backgroundColor: '#1976d2',
  color: 'white',
  padding: '8px 16px',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
};
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: 'white',
  borderRadius: 8,
  boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
};
const theadStyle = {
  backgroundColor: '#1976d2',
  color: 'white',
  textAlign: 'center',
};
const trStyle = { textAlign: 'center', borderBottom: '1px solid #ddd' };
const imgStyle = { width: 40, height: 40, borderRadius: '50%' };
const btnStyle = {
  padding: '6px 12px',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
  fontSize: 13,
};

export default PremiumUsers;



