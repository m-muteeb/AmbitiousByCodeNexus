import React, { useState, useEffect } from "react";
// import { supabase } from "../../config/supabase"; // Removed
import { Card, List, Button, Spin, Empty, Alert } from "antd";
import { DownloadOutlined, BookOutlined } from "@ant-design/icons";

const EcatNotes = () => {
  // Mock Data
  const [data, setData] = useState([
    { id: 1, topic: 'ECAT Biology Notes - Chapter 1', subject: 'biology', content_type: 'notes', file_urls: [{ url: '#' }] },
    { id: 2, topic: 'ECAT Physics Formulas', subject: 'physics', content_type: 'notes', file_urls: [{ url: '#' }] }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock fetch
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Alert message="ECAT Preparation Material (Mock Data)" type="info" showIcon style={{ marginBottom: 20 }} />
      {loading ? (
        <Spin tip="Loading ECAT notes..." />
      ) : data.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <Card
                title={<><BookOutlined /> {item.topic}</>}
                extra={<Button type="primary" icon={<DownloadOutlined />} href={item.file_urls[0]?.url}>Download</Button>}
              >
                <p>Subject: {item.subject?.toUpperCase()}</p>
                <p>Type: {item.content_type?.toUpperCase()}</p>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No ECAT notes found" />
      )}
    </div>
  );
};

export default EcatNotes;
