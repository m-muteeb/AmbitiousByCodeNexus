import React, { useEffect, useState } from "react";
import { Card, Collapse, Spin, message } from "antd";
// import { supabase } from "../../config/supabase"; // Removed
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;

const PrimaryContentBrowser = () => {
  const [classes, setClasses] = useState(["KG", "Class 1", "Class 2", "Class 3", "Class 4"]);
  const [primaryTypes, setPrimaryTypes] = useState([
    { value: 'english', label: 'English' },
    { value: 'urdu', label: 'Urdu' },
    { value: 'math', label: 'Math' }
  ]);
  const [topicsMap, setTopicsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTopics = async (className, typeValue) => {
    const key = `${className}_${typeValue}`;
    if (topicsMap[key]) return;

    setLoading(true);
    // Mock Fetch
    setTimeout(() => {
      setTopicsMap((prev) => ({
        ...prev, [key]: [
          { id: 1, topic: `${className} ${typeValue} Chapter 1`, file_urls: [{ url: '#' }] }
        ]
      }));
      setLoading(false);
    }, 300);
  };

  const handleTopicClick = (topic) => {
    message.info("Opening topic (Mock)");
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Primary Content Browser (Mock)</h2>
      {loading && <Spin />}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(48%, 1fr))",
          gap: "20px",
        }}
      >
        {classes.map((className) => (
          <Card key={className} title={className} style={{ width: "100%" }}>
            <Collapse
              accordion
              onChange={(key) => {
                const typeKey = Array.isArray(key) ? key[0] : key;
                if (typeKey) fetchTopics(className, typeKey);
              }}
            >
              {primaryTypes.map((type) => {
                const topicKey = `${className}_${type.value}`;
                const topics = topicsMap[topicKey] || [];

                return (
                  <Panel header={type.label} key={type.value}>
                    {topics.length === 0 ? (
                      <p>No topics found.</p>
                    ) : (
                      topics.map((topic) => (
                        <Card
                          key={topic.id}
                          type="inner"
                          title={topic.topic}
                          hoverable
                          onClick={() => handleTopicClick(topic)}
                          style={{ marginBottom: 10, cursor: "pointer" }}
                        >
                        </Card>
                      ))
                    )}
                  </Panel>
                );
              })}
            </Collapse>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PrimaryContentBrowser;
