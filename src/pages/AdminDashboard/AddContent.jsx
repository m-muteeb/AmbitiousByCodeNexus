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
    Typography,
} from "antd";
import {
    CloudUploadOutlined,
    FilePdfOutlined,
    CheckCircleFilled,
    CrownOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import { supabase, supabaseApi } from "../../config/supabase";
import { STUDY_CLASSES, STUDY_SUBJECTS, STUDY_CATEGORIES } from "../../config/studyConstants";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const AddContent = () => {
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isPremium, setIsPremium] = useState(false);
    const [form] = Form.useForm();

    const uploadFileToStorage = async (file, currentClass) => {
        try {
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
        } catch (err) {
            console.error(`Upload failed for ${file.name}:`, err);
            throw new Error(`Failed to upload ${file.name}: ${err.message}`);
        }
    };

    const onFinish = async (values) => {
        if (fileList.length === 0) {
            message.warning("Please select at least one educational file (PDF)");
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        try {
            const uploadPromises = fileList.map(file => uploadFileToStorage(file.originFileObj, values.class_level));
            const uploadedFiles = await Promise.all(uploadPromises);

            setUploadProgress(70);

            const insertData = {
                title: values.topic,
                description: values.description || '',
                category: isPremium ? 'paid_test_series' : values.category,
                class_level: values.class_level,
                subject: values.subject,
                file_urls: uploadedFiles,
                is_premium: isPremium,
                paid_tier: isPremium ? values.paid_tier : 'none',
                created_at: new Date().toISOString()
            };

            await supabaseApi.insert('topics', insertData);

            setUploadProgress(100);
            message.success({
                content: "Resource Published Successfully!",
                key: 'upload_msg',
                duration: 5,
                icon: <CheckCircleFilled style={{ color: '#52c41a' }} />
            });

            form.resetFields();
            setFileList([]);
            setIsPremium(false);
            setTimeout(() => setUploadProgress(0), 1000);
        } catch (error) {
            console.error("Critical Upload Error:", error);
            message.error({
                content: "Sync Failed: " + (error.message || "Persistence error"),
                key: 'upload_msg',
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
            <Card
                title={
                    <Space>
                        <CloudUploadOutlined style={{ color: '#1890ff' }} />
                        <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>Resource Publishing Console</span>
                    </Space>
                }
                headStyle={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px' }}
                style={{ borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: 'none' }}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ category: 'notes', paid_tier: 'demo' }}>

                    <div style={{ background: '#f8fbff', padding: '20px', borderRadius: '15px', marginBottom: 24, border: '1px solid #e6f7ff' }}>
                        <Form.Item name="is_premium_check" label="Premium Protection Control" valuePropName="checked" noStyle>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#1d3557' }}>Mark as Protected Content</span>
                                    <Switch
                                        onChange={(val) => {
                                            setIsPremium(val);
                                            form.setFieldsValue({ category: val ? 'paid_test_series' : 'notes' });
                                        }}
                                        checked={isPremium}
                                    />
                                </div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {isPremium
                                        ? "This resource will be locked for the Paid Test Series section."
                                        : "This resource will be available in the public Student Portal."}
                                </Text>
                            </Space>
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', gap: '24px' }}>
                        <Form.Item
                            label="Target Class/Grade"
                            name="class_level"
                            rules={[{ required: true, message: 'Class level is mandatory' }]}
                        >
                            <Select placeholder="Select Class" size="large">
                                {STUDY_CLASSES.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
                            </Select>
                        </Form.Item>

                        {isPremium ? (
                            <Form.Item
                                label="Premium Access Tier"
                                name="paid_tier"
                                rules={[{ required: true, message: 'Tier is mandatory for Premium' }]}
                            >
                                <Select size="large" placeholder="Select Tier">
                                    <Option value="demo">
                                        <Space><InfoCircleOutlined style={{ color: '#1890ff' }} /> Demo Tier</Space>
                                    </Option>
                                    <Option value="premium">
                                        <Space><CrownOutlined style={{ color: '#faad14' }} /> Super Premium</Space>
                                    </Option>
                                </Select>
                            </Form.Item>
                        ) : (
                            <Form.Item
                                label="Content Classification"
                                name="category"
                                rules={[{ required: true, message: 'Category is mandatory' }]}
                            >
                                <Select placeholder="Select Type" size="large">
                                    {STUDY_CATEGORIES.map(c => <Option key={c.key} value={c.key}>{c.label}</Option>)}
                                </Select>
                            </Form.Item>
                        )}
                    </div>

                    <Form.Item
                        label="Academic Subject"
                        name="subject"
                        rules={[{ required: true, message: 'Subject is mandatory' }]}
                    >
                        <Select placeholder="Select Subject" size="large">
                            {STUDY_SUBJECTS.map(s => <Option key={s.key} value={s.key}>{s.label}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Resource Title"
                        name="topic"
                        rules={[{ required: true, message: 'Title is mandatory' }]}
                    >
                        <Input size="large" placeholder={isPremium ? "e.g. ECAT Full Term Test - 01" : "e.g. Unit 1 Numerical Problems"} />
                    </Form.Item>

                    {!isPremium && (
                        <Form.Item label="Contextual Description" name="description">
                            <TextArea rows={2} placeholder="Optional summary for students..." />
                        </Form.Item>
                    )}

                    <Form.Item label="Academic Resource Files (PDF)" required>
                        <Upload.Dragger
                            beforeUpload={() => false}
                            multiple
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            accept=".pdf"
                            style={{ borderRadius: '15px', border: '2px dashed #e9ecef', padding: '20px' }}
                        >
                            <p className="ant-upload-drag-icon">
                                <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                            </p>
                            <p className="ant-upload-text" style={{ fontWeight: 700 }}>Click or Drag PDF files here</p>
                            <p className="ant-upload-hint">Parallel processing enabled for high-speed uploads.</p>
                        </Upload.Dragger>
                    </Form.Item>

                    {uploading && <Progress percent={uploadProgress} status="active" style={{ marginBottom: 24 }} />}

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={uploading}
                        block
                        size="large"
                        style={{
                            height: '56px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            background: isPremium ? 'linear-gradient(135deg, #1d3557, #457b9d)' : '#1890ff',
                            border: 'none',
                            boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {uploading ? 'UPLOADING...' : 'PUBLISH RESOURCE'}
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default AddContent;
