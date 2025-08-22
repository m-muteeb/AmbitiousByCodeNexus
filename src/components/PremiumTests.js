// import React, { useEffect, useState } from "react";
// import {
//   collection,
//   doc,
//   getDoc,
//   getDocs
// } from "firebase/firestore";
// import {
//   Card,
//   Checkbox,
//   Spin,
//   message,
//   Typography,
//   Tooltip,
//   Tag,
//   Divider,
//   Row,
//   Col
// } from "antd";
// import { fireStore } from "../config/firebase";
// import { getAuth } from "firebase/auth";

// const { Title } = Typography;

// const PremiumTests = ({ selectedFiles, setSelectedFiles }) => {
//   const [tests, setTests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [allowedAccess, setAllowedAccess] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const auth = getAuth();
//         const currentUser = auth.currentUser;

//         if (!currentUser) {
//           message.error("User not logged in.");
//           return;
//         }

//         const userDoc = await getDoc(doc(fireStore, "users", currentUser.uid));
//         const userData = userDoc.data();
//         const accessList = userData.allowedAccess || [];
//         setAllowedAccess(accessList);

//         const snapshot = await getDocs(collection(fireStore, "premiumtests"));
//         const allTests = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         allTests.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
//         setTests(allTests);
//       } catch (err) {
//         console.error("Error fetching premium tests:", err);
//         message.error("Failed to load tests.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const groupedData = tests.reduce((acc, test) => {
//     const classKey = test.class || "Unknown Class";
//     const subjectKey = test.subject || "Unknown Subject";

//     if (!acc[classKey]) acc[classKey] = {};
//     if (!acc[classKey][subjectKey]) acc[classKey][subjectKey] = [];
//     acc[classKey][subjectKey].push(test);

//     return acc;
//   }, {});

//   const handleCheckboxChange = (checked, file) => {
//     if (checked) {
//       setSelectedFiles((prev) => [...prev, file]);
//     } else {
//       setSelectedFiles((prev) => prev.filter((f) => f.url !== file.url));
//     }
//   };

//   if (loading) return <Spin size="large" tip="Loading Premium Tests..." />;

//   return (
//     <div style={{ padding: "20px" }}>
//       {Object.entries(groupedData).map(([className, subjects]) => (
//         <div key={className} style={{ marginBottom: 32 }}>
//           <Title level={3}>{className}</Title>
//           <Divider />
//           <Row gutter={[16, 16]}>
//             {Object.entries(subjects).map(([subjectName, subjectTests]) => {
//               const accessKey = `${className}:${subjectName}`;
//               const hasAccess = allowedAccess.includes(accessKey);

//               return (
//                 <Col key={subjectName} xs={24} sm={12} md={8} lg={6}>
//                   <Card
//                     title={
//                       <>
//                         <Tag color={hasAccess ? "blue" : "red"}>
//                           {hasAccess ? "Accessible" : "Restricted"}
//                         </Tag>{" "}
//                         <b>{subjectName}</b>
//                       </>
//                     }
//                     hoverable
//                     style={{
//                       minHeight: 200,
//                       border: hasAccess ? "1px solid #d9d9d9" : "1px dashed #aaa",
//                       backgroundColor: hasAccess ? "#fff" : "#f9f9f9",
//                       cursor: hasAccess ? "default" : "not-allowed"
//                     }}
//                     bodyStyle={{ padding: 12 }}
//                   >
//                     {subjectTests.map((test) =>
//                       test.fileUrls.map((file, idx) => {
//                         const isChecked = selectedFiles.some(
//                           (f) => f.url === file.url
//                         );
//                         const checkbox = (
//                           <Checkbox
//                             checked={isChecked}
//                             disabled={!hasAccess}
//                             onChange={(e) =>
//                               handleCheckboxChange(e.target.checked, {
//                                 ...file,
//                                 className,
//                                 subjectName,
//                                 testId: test.id
//                               })
//                             }
//                           />
//                         );

//                         return (
//                           <div
//                             key={`${test.id}-${idx}`}
//                             style={{
//                               display: "flex",
//                               alignItems: "center",
//                               marginBottom: 8,
//                               opacity: hasAccess ? 1 : 0.6
//                             }}
//                           >
//                             {hasAccess ? (
//                               checkbox
//                             ) : (
//                               <Tooltip title="You have no access to this test. If you think it's a mistake, contact admin.">
//                                 {checkbox}
//                               </Tooltip>
//                             )}
//                             <span style={{ marginLeft: 8 }}>{file.fileName}</span>
//                           </div>
//                         );
//                       })
//                     )}
//                   </Card>
//                 </Col>
//               );
//             })}
//           </Row>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default PremiumTests;

//the above code is done after the things finalized

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Card, Checkbox, Spin, message, Typography } from "antd";
import { fireStore } from "../config/firebase";

const { Title } = Typography;

const PremiumTests = ({ selectedFiles, setSelectedFiles }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const snapshot = await getDocs(collection(fireStore, "premiumtests"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
        setTests(data);
      } catch (err) {
        console.error("Error fetching premium tests:", err);
        message.error("Failed to fetch premium tests.");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  // Group tests by class then by subject
  const groupedData = tests.reduce((acc, test) => {
    const classKey = test.class || "Unknown Class";
    const subjectKey = test.subject || "Unknown Subject";

    if (!acc[classKey]) acc[classKey] = {};
    if (!acc[classKey][subjectKey]) acc[classKey][subjectKey] = [];
    acc[classKey][subjectKey].push(test);

    return acc;
  }, {});

  const handleCheckboxChange = (checked, file) => {
    if (checked) {
      setSelectedFiles((prev) => [...prev, file]);
    } else {
      setSelectedFiles((prev) => prev.filter((f) => f.url !== file.url));
    }
  };

  if (loading) return <Spin size="large" tip="Loading Premium Tests..." />;

  return (
    <div>
      {Object.entries(groupedData).map(([className, subjects]) => (
        <div key={className} style={{ marginBottom: 24 }}>
          <Title level={3}>{className}</Title>

          {Object.entries(subjects).map(([subjectName, tests]) => (
            <Card
              key={subjectName}
              size="small"
              title={subjectName}
              style={{ marginBottom: 16 }}
            >
              {tests.map((test) => {
                // You store fileUrls as an array, so map each file inside the test's fileUrls
                return test.fileUrls.map((file, idx) => {
                  const isChecked = selectedFiles.some(
                    (f) => f.url === file.url
                  );
                  return (
                    <div
                      key={`${test.id}-${idx}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) =>
                          handleCheckboxChange(e.target.checked, {
                            ...file,
                            className,
                            subjectName,
                            testId: test.id,
                          })
                        }
                      />
                      <span style={{ marginLeft: 8 }}>{file.fileName}</span>
                    </div>
                  );
                });
              })}
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PremiumTests;