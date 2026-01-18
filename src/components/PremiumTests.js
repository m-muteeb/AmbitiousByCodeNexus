import React, { useState, useEffect } from "react";
// import { supabase } from "../config/supabase"; // Removed
import { Table, Button, message, Space, Alert } from "antd";
import { DownloadOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const PremiumTests = () => {
  const { profile } = useAuth();
  const [data, setData] = useState([
    { id: 101, topic: 'Premium Math Test 1', class: 'class-12', subject: 'math', file_urls: [{ url: '#', fileName: 'prem_test.pdf' }] }
  ]);
  const [loading, setLoading] = useState(false);

  const isPremiumOrAdmin = profile?.role === 'premium' || profile?.role === 'admin' || profile?.role === 'superadmin';

  const columns = [
    { title: "Topic", dataIndex: "topic", key: "topic" },
    { title: "Class", dataIndex: "class", key: "class" },
    { title: "Subject", dataIndex: "subject", key: "subject" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        isPremiumOrAdmin ?
          <Button icon={<DownloadOutlined />} href={record.file_urls[0]?.url} target="_blank">Download</Button> :
          <Button icon={<LockOutlined />} disabled>Locked</Button>
      ),
    },
  ];

  return (
    <div>
      <h3>Premium Content (Mock)</h3>
      {!isPremiumOrAdmin && <Alert message="Upgrade to Premium to access these tests" type="warning" showIcon style={{ marginBottom: 16 }} />}
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
    </div>
  );
};

export default PremiumTests;
