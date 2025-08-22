import React, { useState, useEffect } from 'react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../config/firebase';
import RoleNotChangedUsers from './RoleNotChangedUsers';
import RoleChangedUsers from './RoleChangedUsers';
import { FaUserCog, FaUserCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';  

const AdminUserList = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [counts, setCounts] = useState({ notChanged: 0, changed: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    // Scroll to top when component mounts or tab changes
    window.scrollTo(0, 0);
  }, [activeTab]); // This effect will run when `activeTab` changes

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
      <style>
        {`
          .admin-dashboard-container {
            padding: 40px;
            max-width: 1200px;
            margin: auto;
            text-align: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin-top: 75px;
          }

          .admin-title {
            font-size: 28px;
            color: #0d47a1;
            margin-bottom: 40px;
            font-weight: 600;
          }

          .card-container {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
          }

          .card {
            background: linear-gradient(135deg, #2196f3, #64b5f6);
            color: white;
            padding: 30px 20px;
            border-radius: 12px;
            width: 260px;
            height: 160px;
            cursor: pointer;
            transition: 0.3s ease;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .card:hover {
            transform: translateY(-6px);
            opacity: 0.9;
          }

          .card-icon {
            font-size: 40px;
            margin-bottom: 10px;
          }

          .sub-title {
            font-size: 22px;
            color: #0d47a1;
            margin-bottom: 20px;
          }

          .user-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
          }

          .user-table th,
          .user-table td {
            padding: 14px;
            border: 1px solid #ddd;
            text-align: center;
            font-size: 14px;
          }

          .user-table th {
            background-color: #1976d2;
            color: white;
            font-weight: 600;
          }

          .user-table td {
            background-color: #f9f9f9;
          }

          .make-admin-btn,
          .make-premium-btn,
          .back-btn {
            background-color: #1976d2;
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 6px;
            margin: 5px;
            cursor: pointer;
            font-size: 13px;
            transition: 0.3s ease;
          }

          .make-admin-btn:hover,
          .make-premium-btn:hover,
          .back-btn:hover {
            background-color: #6a92cf;
          }

          .back-btn {
            margin-bottom: 20px;
            display: inline-block;
          }

          .add-topic-btn {
            background-color: #1976d2;
            color: white;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
          }
        `}
      </style>

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
          >
            Add Topic
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;



//Thi code will be uncommited when the things will finalied
// import React, { useState, useEffect } from 'react';
// import { collection, query, where, getCountFromServer } from 'firebase/firestore';
// import { db } from '../../config/firebase';
// import RoleNotChangedUsers from './RoleNotChangedUsers';
// import RoleChangedUsers from './RoleChangedUsers';
// import PremiumUsers from './PremiumUser';
// import { FaUserCog, FaUserCheck, FaUserShield } from 'react-icons/fa';
// import { useNavigate } from 'react-router-dom';

// const AdminUserList = () => {
//   const [activeTab, setActiveTab] = useState(null);
//   const [counts, setCounts] = useState({ notChanged: 0, changed: 0, premium: 0 });
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [activeTab]);

//   useEffect(() => {
//     const fetchUserCounts = async () => {
//       setLoading(true);
//       try {
//         const usersRef = collection(db, 'users');

//         const notChangedQuery = query(usersRef, where('role', '==', 'user'));
//         const changedQuery = query(usersRef, where('role', 'in', ['admin']));
//         const premiumQuery = query(usersRef, where('role', '==', 'premium'));

//         const [notChangedSnapshot, changedSnapshot, premiumSnapshot] = await Promise.all([
//           getCountFromServer(notChangedQuery),
//           getCountFromServer(changedQuery),
//           getCountFromServer(premiumQuery),
//         ]);

//         setCounts({
//           notChanged: notChangedSnapshot.data().count,
//           changed: changedSnapshot.data().count,
//           premium: premiumSnapshot.data().count,
//         });
//       } catch (err) {
//         console.error('Error fetching user counts:', err);
//       }
//       setLoading(false);
//     };

//     fetchUserCounts();
//   }, []);

//   return (
//     <div className="admin-dashboard-container">
//       <style>{`
//         .admin-dashboard-container {
//           padding: 40px 20px;
//           max-width: 1200px;
//           margin: auto;
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//           margin-top: 40px;
//         }

//         .admin-title {
//           font-size: 32px;
//           color: #0d47a1;
//           font-weight: bold;
//           text-align: center;
//           margin-bottom: 40px;
//         }

//         .card-container {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
//           gap: 24px;
//         }

//         .card {
//           background: linear-gradient(145deg, #1976d2, #42a5f5);
//           color: white;
//           padding: 24px;
//           border-radius: 16px;
//           box-shadow: 0 10px 18px rgba(0, 0, 0, 0.15);
//           transition: all 0.3s ease-in-out;
//           cursor: pointer;
//           text-align: center;
//         }

//         .card:hover {
//           transform: scale(1.05);
//           background: linear-gradient(145deg, #1565c0, #1e88e5);
//         }

//         .card-icon {
//           font-size: 40px;
//           margin-bottom: 12px;
//         }

//         .card h3 {
//           margin: 8px 0;
//           font-size: 20px;
//         }

//         .user-count {
//           font-size: 24px;
//           font-weight: bold;
//         }

//         .add-topic-btn {
//           display: block;
//           margin: 30px auto 0;
//           background-color: #0d47a1;
//           color: #fff;
//           padding: 12px 28px;
//           border-radius: 8px;
//           border: none;
//           font-size: 16px;
//           transition: background 0.3s ease;
//         }

//         .add-topic-btn:hover {
//           background-color: #1565c0;
//         }

//         @media (max-width: 600px) {
//           .admin-title {
//             font-size: 24px;
//           }
//         }
//       `}</style>

//       <h2 className="admin-title">Registered Institutions</h2>

//       {!activeTab && (
//         <div className="card-container">
//           <div className="card" onClick={() => setActiveTab('notChanged')}>
//             <FaUserCog className="card-icon" />
//             <h3>Role Not Changed Users</h3>
//             <div className="user-count">{loading ? '...' : counts.notChanged}</div>
//           </div>

//           <div className="card" onClick={() => setActiveTab('changed')}>
//             <FaUserCheck className="card-icon" />
//             <h3>Role Changed Users</h3>
//             <div className="user-count">{loading ? '...' : counts.changed}</div>
//           </div>

//           <div className="card" onClick={() => setActiveTab('premium')}>
//             <FaUserShield className="card-icon" />
//             <h3>Premium Users</h3>
//             <div className="user-count">{loading ? '...' : counts.premium}</div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'notChanged' && <RoleNotChangedUsers goBack={() => setActiveTab(null)} />}
//       {activeTab === 'changed' && <RoleChangedUsers goBack={() => setActiveTab(null)} />}
//       {activeTab === 'premium' && <PremiumUsers goBack={() => setActiveTab(null)} />}

//       {!activeTab && (
//         <button
//           onClick={() => navigate('/dashboard/addcontent')}
//           className="add-topic-btn"
//         >
//           Add Topic
//         </button>
//       )}
//     </div>
//   );
// };

// export default AdminUserList;
