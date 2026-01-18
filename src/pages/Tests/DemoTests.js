import React, { useState, useEffect } from "react";
import { Table, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const DemoTests = () => {
    // Mock Data
    const [data] = useState([
        { id: 1, topic: 'Free Math Test 1', class: 'class-9', subject: 'math', file_urls: [{ url: '#', fileName: 'test.pdf' }] },
        { id: 2, topic: 'Free Physics Notes', class: 'class-10', subject: 'physics', file_urls: [{ url: '#', fileName: 'nots.pdf' }] }
    ]);
    const [loading] = useState(false);

    useEffect(() => {
        // Mock fetch if needed
    }, []);

    const columns = [
        { title: "Topic", dataIndex: "topic", key: "topic" },
        { title: "Class", dataIndex: "class", key: "class" },
        { title: "Subject", dataIndex: "subject", key: "subject" },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button icon={<DownloadOutlined />} href={record.file_urls[0]?.url} target="_blank">Download</Button>
            ),
        },
    ];

    return (
        <div>
            <h3>Free Content (Mock)</h3>
            <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
        </div>
    );
};

export default DemoTests;
