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
