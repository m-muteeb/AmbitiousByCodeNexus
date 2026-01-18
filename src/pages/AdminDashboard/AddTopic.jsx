import React, { useState } from "react";
import {
  Form,
  Input,
  Upload,
  Button,
  Select,
  message,
  Card,
  Switch,
  Progress,
  Space,
} from "antd";
import {
  UploadOutlined,
  FilePdfOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { supabase, supabaseApi } from "../../config/supabase";
import "../../assets/css/addtopic.css";

const { Option } = Select;
const { TextArea } = Input;

const AddContent = () => {
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [form] = Form.useForm();

  const classes = [
    { value: '9th', label: 'Class 9' },
    { value: '10th', label: 'Class 10' },
    { value: '11th', label: 'Class 11' },
    { value: '12th', label: 'Class 12' },
    { value: 'ECAT', label: 'ECAT' },
    { value: 'Primary', label: 'Primary Education' }
  ];

  const categories = [
    { value: 'notes', label: 'Notes' },
    { value: 'past_papers', label: 'Past Papers' },
    { value: 'mcqs', label: 'MCQs' },
    { value: 'ecat', label: 'ECAT Content' },
    { value: 'primary', label: 'Primary Education' }
  ];

  const subjects = [
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Biology', label: 'Biology' },
    { value: 'English', label: 'English' },
    { value: 'Urdu', label: 'Urdu' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Islamiat', label: 'Islamiat' },
    { value: 'Pak Studies', label: 'Pak Studies' }
  ];

  const uploadFileToStorage = async (file, currentClass) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${currentClass || 'general'}/${fileName}`;

    const { error } = await supabase.storage
      .from('content-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('content-files')
      .getPublicUrl(filePath);

    return {
      name: file.name,
      url: urlData.publicUrl,
      type: file.type,
      size: file.size,
      path: filePath
    };
  };

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      message.warning("Please select at least one educational file (PDF)");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const hide = message.loading("Initiating secure upload...", 0);

    try {
      const uploadedFiles = [];
      const totalFiles = fileList.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = fileList[i];
        message.loading({ content: `Uploading file ${i + 1} of ${totalFiles}...`, key: 'up' });

        const uploadedFile = await uploadFileToStorage(file.originFileObj, values.class_level);
        uploadedFiles.push(uploadedFile);

        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      const insertData = {
        title: values.topic,
        description: values.description || '',
        category: values.category,
        class_level: values.class_level,
        subject: values.subject,
        file_urls: uploadedFiles,
        is_premium: isPremium,
      };

      await supabaseApi.insert('topics', insertData);

      message.destroy(hide);
      message.success({ content: "Academic content published successfully!", icon: <CheckCircleFilled style={{ color: '#52c41a' }} /> });

      form.resetFields();
      setFileList([]);
      setIsPremium(false);
      setUploadProgress(0);
    } catch (error) {
      message.destroy(hide);
      console.error("Upload error:", error);
      message.error("Publishing Failed: " + (error.message || "Network Error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="add-topic-container" style={{ padding: '24px' }}>
      <Card
        title={<span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Publish Academic Content</span>}
        className="add-topic-card"
        style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: 'none' }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Form.Item
              label="Classification"
              name="category"
              rules={[{ required: true, message: 'Select content type' }]}
            >
              <Select placeholder="Type (e.g. Notes)">
                {categories.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
              </Select>
            </Form.Item>

            <Form.Item
              label="Target Level"
              name="class_level"
              rules={[{ required: true, message: 'Select class level' }]}
            >
              <Select placeholder="Class / Exam">
                {classes.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Academic Subject"
            name="subject"
            rules={[{ required: true, message: 'Select subject' }]}
          >
            <Select placeholder="Subject Name">
              {subjects.map(s => <Option key={s.value} value={s.value}>{s.label}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item
            label="Topic/Chapter Title"
            name="topic"
            rules={[{ required: true, message: 'Enter a descriptive title' }]}
          >
            <Input placeholder="e.g. Physics Chapter 1: Measurements" />
          </Form.Item>

          <Form.Item label="Brief Description" name="description">
            <TextArea rows={2} placeholder="Summary of what this content covers..." />
          </Form.Item>

          <Form.Item name="isPremium" label="Access Control" valuePropName="checked">
            <Space>
              <Switch onChange={setIsPremium} checked={isPremium} />
              <span style={{ fontWeight: 600, color: isPremium ? '#faad14' : '#52c41a' }}>
                {isPremium ? 'PREMIUM (PAID ACCESS)' : 'PUBLIC (FREE ACCESS)'}
              </span>
            </Space>
          </Form.Item>

          <Form.Item
            label="Select Educational Files (PDF Only)"
            required
          >
            <Upload.Dragger
              beforeUpload={() => false}
              multiple
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept=".pdf"
              style={{ borderRadius: '12px' }}
            >
              <p className="ant-upload-drag-icon">
                <FilePdfOutlined style={{ color: '#ff4d4f' }} />
              </p>
              <p className="ant-upload-text">Click or drag PDF files to this area to upload</p>
              <p className="ant-upload-hint">Support for single or bulk upload. Maximum file size: 50MB</p>
            </Upload.Dragger>
          </Form.Item>

          {uploading && (
            <div style={{ marginBottom: '20px' }}>
              <Progress percent={uploadProgress} status="active" strokeColor="#1890ff" />
            </div>
          )}

          <Button
            type="primary"
            htmlType="submit"
            loading={uploading}
            block
            size="large"
            style={{ height: '50px', borderRadius: '8px', fontWeight: 700, fontSize: '1.1rem' }}
          >
            {uploading ? 'PROCESSING UPLOAD...' : 'PUBLISH TO PORTAL'}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AddContent;
