import React, { useState, useEffect } from "react";
import { List, Card, Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";

const RecentPosts = () => {
  const [posts, setPosts] = useState([
    { id: 1, topic: 'Latest Physics Notes Class 9', created_at: new Date().toISOString() },
    { id: 2, topic: 'Chemistry Guess Paper 2025', created_at: new Date().toISOString() },
    { id: 3, topic: 'Math Formulas Sheet', created_at: new Date().toISOString() }
  ]);
  const [loading, setLoading] = useState(false);

  return (
    <Card title="Recent Posts (Mock)" bordered={false}>
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={posts}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<FilePdfOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />}
              title={<a href="#">{item.topic}</a>}
              description={`Uploaded on ${new Date(item.created_at).toLocaleDateString()}`}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default RecentPosts;