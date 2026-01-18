import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, message, Space, Select, Input, Tag, Modal, List, Card } from "antd";
import { DeleteOutlined, EyeOutlined, SearchOutlined, ReloadOutlined, FilePdfOutlined } from "@ant-design/icons";
import { supabaseApi } from "../../config/supabase";

const { Option } = Select;

const ManageTopics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewFilesModal, setViewFilesModal] = useState({ visible: false, files: [], title: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch everything, ordered by newest first
      const topics = await supabaseApi.fetch('topics', 'select=*&order=created_at.desc');
      setData(topics || []);
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to sync current topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await supabaseApi.delete('topics', id);
      message.success("Content removed from library");
      setData(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete content");
      fetchData(); // Sync state on failure
    }
  };

  const columns = [
    {
      title: "Topic Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <b style={{ color: '#1890ff' }}>{text}</b>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text) => (
        <Tag color="geekblue">{text ? text.replace('_', ' ').toUpperCase() : 'N/A'}</Tag>
      ),
    },
    {
      title: "Level",
      dataIndex: "class_level",
      key: "class_level",
      render: (text) => <Tag color="cyan">{text || 'N/A'}</Tag>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Visibility",
      dataIndex: "is_premium",
      key: "is_premium",
      render: (isPremium) => (
        <Tag color={isPremium ? "gold" : "green"}>
          {isPremium ? "PREMIUM" : "FREE"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "actions",
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setViewFilesModal({
              visible: true,
              files: Array.isArray(record.file_urls) ? record.file_urls : [],
              title: record.title
            })}
          >
            Files ({Array.isArray(record.file_urls) ? record.file_urls.length : 0})
          </Button>
          <Popconfirm
            title="Delete permanently?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Keep"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Remove
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredData = data.filter(item => {
    const matchSearch = String(item.title || '').toLowerCase().includes(searchText.toLowerCase());
    const matchClass = filterClass === 'all' || item.class_level === filterClass;
    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchSearch && matchClass && matchCategory;
  });

  return (
    <div style={{ padding: "24px" }}>
      <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontWeight: 900, color: '#1d3557' }}>Content Library</h2>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
          >
            Refresh Library
          </Button>
        </div>

        <Space style={{ marginBottom: 24 }} wrap size="middle">
          <Input
            placeholder="Search resource..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 280 }}
          />
          <Select defaultValue="all" style={{ width: 140 }} onChange={setFilterClass}>
            <Option value="all">All Grades</Option>
            <Option value="9th">9th</Option>
            <Option value="10th">10th</Option>
            <Option value="11th">11th</Option>
            <Option value="12th">12th</Option>
            <Option value="ECAT">ECAT</Option>
            <Option value="Primary">Primary</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          bordered
        />
      </Card>

      <Modal
        title={`Topic Resources: ${viewFilesModal.title}`}
        open={viewFilesModal.visible}
        onCancel={() => setViewFilesModal({ ...viewFilesModal, visible: false })}
        footer={[
          <Button key="ok" type="primary" onClick={() => setViewFilesModal({ ...viewFilesModal, visible: false })}>
            Done
          </Button>
        ]}
      >
        <List
          itemLayout="horizontal"
          dataSource={viewFilesModal.files}
          renderItem={file => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => window.open(file.url, '_blank')}>View PDF</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<FilePdfOutlined style={{ fontSize: 24, color: '#f5222d' }} />}
                title={file.name}
                description={`${(file.size / 1024).toFixed(1)} KB`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default ManageTopics;
