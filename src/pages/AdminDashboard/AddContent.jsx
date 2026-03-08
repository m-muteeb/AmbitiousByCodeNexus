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
    const class_level = Form.useWatch('class_level', form);

    const uploadFileToStorage = async (file, currentClass) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `${currentClass || 'general'}/${fileName}`;

            const { error } = await supabase.storage
                .from('content-files')
                .upload(filePath, file, {
                    cacheControl: '31536000, public, immutable',
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
            message.warning("Please select at least one educational file (PDF or DOCX)");
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        try {
            const totalFiles = fileList.length;
            let completed = 0;
            const errors = [];

            for (const fileObj of fileList) {
                const file = fileObj.originFileObj;
                try {
                    const uploadedFile = await uploadFileToStorage(file, values.class_level);

                    const specificTitle = values.files?.[fileObj.uid]?.title;
                    const fileTitle = specificTitle || (totalFiles > 1 ? file.name.replace(/\.[^/.]+$/, "") : (values.topic || file.name.replace(/\.[^/.]+$/, "")));

                    const specificSubject = values.files?.[fileObj.uid]?.subject;
                    const fileSubject = isPremium ? 'General' : (specificSubject || values.subject || 'General');

                    const insertData = {
                        title: fileTitle,
                        description: values.description || '',
                        category: isPremium ? 'paid_test_series' : values.category,
                        class_level: values.class_level,
                        subject: fileSubject,
                        file_urls: [uploadedFile],
                        is_premium: isPremium,
                        paid_tier: isPremium ? values.paid_tier : 'none',
                        created_at: new Date().toISOString()
                    };

                    await supabaseApi.insert('topics', insertData);
                    completed++;
                    setUploadProgress(10 + Math.round((completed / totalFiles) * 90));
                } catch (err) {
                    console.error(`Error processing ${file.name}:`, err);
                    errors.push(`${file.name}: ${err.message || 'Unknown error'}`);
                }
            }

            if (errors.length > 0) {
                message.warning({
                    content: `Completed ${completed}/${totalFiles}. Errors: ${errors.join(', ')}`,
                    duration: 8
                });
            } else {
                message.success({
                    content: `${totalFiles} Resources Published Successfully!`,
                    key: 'upload_msg',
                    duration: 5,
                    icon: <CheckCircleFilled style={{ color: '#52c41a' }} />
                });
            }

            if (completed > 0) {
                form.resetFields();
                setFileList([]);
                setIsPremium(false);
            }
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
        <div style={{ padding: '8px 0', maxWidth: 1000, margin: '0 auto' }}>
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
                                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#1d3557' }}>Mark as Protected Content (Paid Test Series)</span>
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
                                        ? "This resource will be locked for the Paid Test Series section. Subject specification is optional."
                                        : "This resource will be available in the public Student Portal."}
                                </Text>
                            </Space>
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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
                                    {(class_level === '8th'
                                        ? STUDY_CATEGORIES.filter(c => c.key === 'guess_paper')
                                        : class_level === 'ecat'
                                            ? STUDY_CATEGORIES.filter(c => ['assignments', 'solutions', 'tests'].includes(c.key))
                                            : STUDY_CATEGORIES.filter(c => c.key !== 'paid_test_series')
                                    ).map(cat => (
                                        <Option key={cat.key} value={cat.key}>{cat.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                    </div>

                    {!isPremium && (
                        <Form.Item
                            label="Default Academic Subject"
                            name="subject"
                            rules={[{ required: fileList.length === 0, message: 'Default Subject is mandatory' }]}
                        >
                            <Select placeholder="Select Default Subject" size="large">
                                {(class_level === '8th'
                                    ? STUDY_SUBJECTS.filter(s => ['English', 'Urdu', 'Mathematics', 'Science'].includes(s.key))
                                    : class_level === 'ecat'
                                        ? STUDY_SUBJECTS.filter(s => ['English', 'Computer Science', 'Chemistry', 'Mathematics', 'Physics'].includes(s.key))
                                        : STUDY_SUBJECTS
                                ).map(s => <Option key={s.key} value={s.key}>{s.label}</Option>)}
                            </Select>
                        </Form.Item>
                    )}

                    {(fileList.length === 0 || fileList.length === 1) && (
                        <Form.Item
                            label={fileList.length > 1 ? "Shared Project Name (Optional)" : "Resource Title"}
                            name="topic"
                            rules={[{ required: fileList.length === 1, message: 'Title is mandatory' }]}
                            style={{ display: fileList.length === 1 ? 'block' : 'none' }}
                        >
                            <Input size="large" placeholder={isPremium ? "e.g. ECAT Test Series" : "e.g. Unit 1 Numerical Problems"} />
                        </Form.Item>
                    )}
                    {fileList.length > 1 && (
                        <div style={{ marginBottom: 24 }}>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                Multiple files detected. Please use the individual title fields below for each resource.
                            </Text>
                        </div>
                    )}

                    {!isPremium && (
                        <Form.Item label="Contextual Description" name="description">
                            <TextArea rows={2} placeholder="Optional summary for students..." />
                        </Form.Item>
                    )}

                    <Form.Item label="Academic Resource Files (PDF/DOCX)" required>
                        <Upload.Dragger
                            beforeUpload={() => false}
                            multiple
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            accept=".pdf,.docx"
                            style={{ borderRadius: '15px', border: '2px dashed #e9ecef', padding: '20px' }}
                        >
                            <p className="ant-upload-drag-icon">
                                <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                                <CrownOutlined style={{ color: '#1d3557', marginLeft: 8 }} />
                            </p>
                            <p className="ant-upload-text" style={{ fontWeight: 700 }}>Click or Drag files here</p>
                            <p className="ant-upload-hint">Supports PDF and DOCX. Parallel processing enabled.</p>
                        </Upload.Dragger>
                    </Form.Item>

                    {fileList.length > 0 && (
                        <div style={{ marginTop: 24, marginBottom: 24 }}>
                            <Text strong style={{ fontSize: '16px', marginBottom: 16, display: 'block', color: '#1d3557' }}>Customize Individual Files</Text>
                            {fileList.map((fileObj) => (
                                <Card key={fileObj.uid} size="small" style={{ marginBottom: 12, borderRadius: '8px', background: '#f8fbff', border: '1px solid #e6f7ff' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div style={{ flex: '1 1 200px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <FilePdfOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                                            <Text strong>{fileObj.name}</Text>
                                        </div>
                                        <div style={{ flex: '2 1 200px' }}>
                                            <Form.Item
                                                name={['files', fileObj.uid, 'title']}
                                                initialValue={fileObj.name.replace(/\.[^/.]+$/, "")}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Input placeholder="Resource Title" />
                                            </Form.Item>
                                        </div>
                                        {!isPremium && (
                                            <div style={{ flex: '2 1 200px' }}>
                                                <Form.Item
                                                    name={['files', fileObj.uid, 'subject']}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Select placeholder="Specific Subject (Overrides Default)" allowClear>
                                                        {(class_level === '8th'
                                                            ? STUDY_SUBJECTS.filter(s => ['English', 'Urdu', 'Mathematics', 'Science'].includes(s.key))
                                                            : class_level === 'ecat'
                                                                ? STUDY_SUBJECTS.filter(s => ['English', 'Computer Science', 'Chemistry', 'Mathematics', 'Physics'].includes(s.key))
                                                                : STUDY_SUBJECTS
                                                        ).map(s => <Option key={s.key} value={s.key}>{s.label}</Option>)}
                                                    </Select>
                                                </Form.Item>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

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
                        {uploading ? 'UPLOADING...' : 'PUBLISH RESOURCES'}
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default AddContent;
