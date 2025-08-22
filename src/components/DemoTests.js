// // components/DemoTests.js
// import React, { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { Card, Checkbox, Button, Tag, Spin, message } from "antd";
// import { fireStore } from "../config/firebase";

// const DemoTests = ({ selectedFiles, setSelectedFiles }) => {
//   const [pdfs, setPdfs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPdfs = async () => {
//       try {
//         const snapshot = await getDocs(collection(fireStore, "institutionpdfs"));
//         const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
//         setPdfs(data);
//       } catch (err) {
//         console.error("Error fetching demo PDFs:", err);
//         message.error("Failed to fetch demo PDFs.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPdfs();
//   }, []);

//   const handleCheckboxChange = (checked, file) => {
//     if (checked) {
//       setSelectedFiles(prev => [...prev, file]);
//     } else {
//       setSelectedFiles(prev => prev.filter(f => f.url !== file.url));
//     }
//   };

//   const grouped = pdfs.reduce((acc, pdf) => {
//     const cls = pdf.class;
//     const subj = pdf.subject;
//     if (!acc[cls]) acc[cls] = {};
//     if (!acc[cls][subj]) acc[cls][subj] = [];

//     pdf.fileUrls.forEach(file => {
//       acc[cls][subj].push({
//         ...file,
//         subject: subj
//       });
//     });

//     return acc;
//   }, {});

//   if (loading) return <Spin size="large" tip="Loading Demo Tests..." />;

//   return (
//     <div>
//       {Object.entries(grouped).map(([cls, subjects]) => (
//         <div key={cls} style={{ marginBottom: 32 }}>
//           <h2 style={{ color: "black" }}>{cls}</h2>
//           {Object.entries(subjects).map(([subj, files]) => (
//             <Card key={subj} title={subj} style={{ marginBottom: 20 }}>
//               {files.map((file, idx) => {
//                 const isChecked = selectedFiles.some(f => f.url === file.url);
//                 return (
//                   <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
//                     <Checkbox
//                       checked={isChecked}
//                       onChange={(e) => handleCheckboxChange(e.target.checked, file)}
//                     />
//                     <span style={{ flex: 1, marginLeft: 8 }}>
//                       {idx + 1}. <strong>{file.fileName}</strong>{" "}
//                       {file.isPaid && <Tag color="red">Paid</Tag>}
//                     </span>
               

//                   </div>
//                 );
//               })}
//             </Card>
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default DemoTests;
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  Card,
  Checkbox,
  Tabs,
  Typography,
  Spin,
  Tag,
  message,
} from "antd";
import { fireStore } from "../config/firebase";
import "../assets/css/demotests.css"; // 💡 Import CSS for glassmorphism

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DemoTests = ({ selectedFiles, setSelectedFiles }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const snapshot = await getDocs(collection(fireStore, "institutionpdfs"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
        setPdfs(data);
      } catch (err) {
        console.error("Error fetching demo PDFs:", err);
        message.error("Failed to fetch demo PDFs.");
      } finally {
        setLoading(false);
      }
    };
    fetchPdfs();
  }, []);

  const handleCheckboxChange = (checked, file) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, file]);
    } else {
      setSelectedFiles(prev => prev.filter(f => f.url !== file.url));
    }
  };

  const grouped = pdfs.reduce((acc, pdf) => {
    const cls = pdf.class;
    const subj = pdf.subject;
    if (!acc[cls]) acc[cls] = {};
    if (!acc[cls][subj]) acc[cls][subj] = [];

    pdf.fileUrls.forEach(file => {
      acc[cls][subj].push({ ...file, subject: subj });
    });

    return acc;
  }, {});

  if (loading) return <Spin size="large" tip="Loading Demo Tests..." />;

  return (
    <div className="demo-tests-container">
      {Object.entries(grouped).map(([cls, subjects]) => (
        <div key={cls} className="class-section">
          <Title level={3} className="class-title">🎓{cls}</Title>

          <Tabs tabPosition="top" type="card" className="glass-tabs">
            {Object.entries(subjects).map(([subj, files]) => (
              <TabPane tab={subj} key={subj}>
                <Card className="glass-card" bordered={false}>
                  {files.map((file, idx) => {
                    const isChecked = selectedFiles.some(f => f.url === file.url);
                    return (
                      <div key={idx} className="file-item">
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(e.target.checked, file)}
                          className="custom-checkbox"
                        >
                          <Text className="file-name">
                            {idx + 1}. {file.fileName}
                          </Text>
                        </Checkbox>
                        {file.isPaid && <Tag color="red">Paid</Tag>}
                      </div>
                    );
                  })}
                </Card>
              </TabPane>
            ))}
          </Tabs>
        </div>
      ))}
    </div>
  );
};

export default DemoTests;
