import React, { useState, useEffect } from "react";
import { List, Card, Button, Select, Space, Spin, Typography, Row, Col, Badge, Modal, Empty, message, Alert } from "antd";
import {
    BookOutlined,
    FilePdfOutlined,
    DoubleRightOutlined,
    EyeOutlined,
    DownloadOutlined,
    CloseOutlined,
    FullscreenOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { supabaseApi } from "../../config/supabase";
import { STUDY_SUBJECTS, STUDY_CATEGORIES, getCategoryLabel } from "../../config/studyConstants";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import * as pdfjs from "pdfjs-dist/build/pdf";
import "../../assets/css/notes.css";

// Set worker version dynamically
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const { Title, Text } = Typography;
const { Option } = Select;

const EducationalPortal = () => {
    const { selectedClass, category, subCategory } = useParams();
    const [selectedSubject, setSelectedSubject] = useState(category || null);
    const [selectedCategory, setSelectedCategory] = useState(subCategory || null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // UI Navigation States
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [previewModal, setPreviewModal] = useState({ visible: false, files: [], title: '' });
    const [viewerModal, setViewerModal] = useState({ visible: false, url: '', title: '' });

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    // Sync deep links from URL
    useEffect(() => {
        if (category && subCategory) {
            setSelectedSubject(category);
            setSelectedCategory(subCategory);
            fetchData(category, subCategory);
        }
    }, [category, subCategory, selectedClass]);

    const formatClassName = (name) => {
        if (!name) return "Selected Class";
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
    };

    const fetchData = async (subject, cat) => {
        if (!selectedClass || !subject || !cat) return;

        setLoading(true);
        try {
            const query = `select=*&class_level=eq.${selectedClass}&subject=eq.${subject}&category=eq.${cat}&order=created_at.desc`;
            const results = await supabaseApi.fetch('topics', query);
            setData(results || []);

            // Open result overlay immediately
            setOverlayVisible(true);
        } catch (error) {
            console.error("Portal Fetch Error:", error);
            message.error("Unable to sync academic resources at this moment");
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (val, subjectKey) => {
        setSelectedSubject(subjectKey);
        setSelectedCategory(val);
        fetchData(subjectKey, val);
    };

    const openFileList = (record) => {
        setPreviewModal({
            visible: true,
            files: Array.isArray(record.file_urls) ? record.file_urls : [],
            title: record.title
        });
    };

    const openViewer = (file) => {
        setViewerModal({
            visible: true,
            url: file.url,
            title: file.name
        });
    };

    return (
        <div className="edu-portal-container" style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
                <Badge count={formatClassName(selectedClass)} color="#1d3557" style={{ marginBottom: 15 }} />
                <Title level={1} style={{ color: '#1d3557', fontWeight: 900, marginBottom: 10 }}>Academic Resource Hub</Title>
                <Text type="secondary" style={{ fontSize: '1.1rem' }}>Find your notes and study material in just 2 clicks.</Text>
            </div>

            {/* Subject Grid - The Primary Interaction Layer */}
            <Row gutter={[20, 20]}>
                {STUDY_SUBJECTS.map((subj) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={subj.key}>
                        <Card
                            hoverable
                            className={`subject-card ${selectedSubject === subj.key ? 'active' : ''}`}
                            style={{ borderRadius: '15px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                <Text strong style={{ fontSize: '1.15rem', color: '#1d3557' }}>{subj.label}</Text>
                                <DoubleRightOutlined style={{ color: '#457b9d' }} />
                            </div>

                            <Select
                                placeholder="Select Category"
                                style={{ width: '100%' }}
                                onChange={(val) => handleCategoryChange(val, subj.key)}
                                value={selectedSubject === subj.key ? selectedCategory : undefined}
                                dropdownStyle={{ borderRadius: '10px' }}
                                loading={loading && selectedSubject === subj.key}
                            >
                                {STUDY_CATEGORIES.map(cat => (
                                    <Option key={cat.key} value={cat.key}>{cat.label}</Option>
                                ))}
                            </Select>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Instant Content Overlay Modal - Click #2 Destination */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 4, height: 24, background: '#1d3557', borderRadius: 2 }}></div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                            {selectedSubject} — {getCategoryLabel(selectedCategory)}
                        </span>
                    </div>
                }
                open={overlayVisible}
                onCancel={() => setOverlayVisible(false)}
                footer={null}
                width={850}
                centered
                className="results-overlay-modal"
                bodyStyle={{ padding: '24px', backgroundColor: '#fdfdfd' }}
                destroyOnClose
            >
                {data.length > 0 ? (
                    <>
                        <div style={{ marginBottom: 20 }}>
                            <Alert
                                message={`${data.length} Resources Found`}
                                description="Select a topic below to preview or download the study material."
                                type="info"
                                showIcon
                                icon={<InfoCircleOutlined />}
                                style={{ borderRadius: '8px' }}
                            />
                        </div>
                        <List
                            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2 }}
                            dataSource={data}
                            renderItem={item => (
                                <List.Item>
                                    <Card
                                        className="resource-item-card-lite"
                                        hoverable
                                        style={{ borderRadius: '10px', transition: 'all 0.2s ease', border: '1px solid #f0f0f0' }}
                                        onClick={() => openFileList(item)}
                                    >
                                        <Card.Meta
                                            avatar={<BookOutlined style={{ fontSize: 24, color: '#1d3557' }} />}
                                            title={<span style={{ fontWeight: 700 }}>{item.title}</span>}
                                            description={<Text type="secondary" ellipsis>{item.description || "Comprehensive notes for preparation."}</Text>}
                                        />
                                        <div style={{ marginTop: 15, textAlign: 'right' }}>
                                            <Button type="primary" size="small" icon={<EyeOutlined />}>Open</Button>
                                        </div>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </>
                ) : (
                    <Empty description={`No ${getCategoryLabel(selectedCategory)} found for this subject.`} />
                )}
            </Modal>

            {/* Chapter/File Detail Modal */}
            <Modal
                title={<span style={{ fontWeight: 800 }}>Available Documents</span>}
                open={previewModal.visible}
                onCancel={() => setPreviewModal({ ...previewModal, visible: false })}
                footer={[
                    <Button key="close" onClick={() => setPreviewModal({ ...previewModal, visible: false })}>
                        Close
                    </Button>
                ]}
                width={650}
                centered
            >
                <List
                    dataSource={previewModal.files}
                    renderItem={file => (
                        <List.Item
                            style={{ padding: '15px', borderRadius: '8px', border: '1px solid #f0f0f0', marginBottom: 10, cursor: 'pointer' }}
                            onClick={() => openViewer(file)}
                            className="file-list-item-hover"
                        >
                            <List.Item.Meta
                                avatar={<FilePdfOutlined style={{ fontSize: 28, color: '#f5222d' }} />}
                                title={file.name}
                                description="Click to read online instantly"
                            />
                            <Space>
                                <Button type="primary" icon={<FullscreenOutlined />} shape="circle" />
                                <Button icon={<DownloadOutlined />} onClick={(e) => { e.stopPropagation(); window.open(file.url, '_blank'); }} shape="circle" />
                            </Space>
                        </List.Item>
                    )}
                />
            </Modal>

            {/* In-Site PDF Viewer */}
            <Modal
                title={
                    <Space>
                        <FilePdfOutlined style={{ color: '#f5222d' }} />
                        <span style={{ fontWeight: 800 }}>{viewerModal.title}</span>
                    </Space>
                }
                open={viewerModal.visible}
                onCancel={() => setViewerModal({ ...viewerModal, visible: false })}
                width="98%"
                style={{ top: 10 }}
                footer={null}
                closeIcon={<CloseOutlined style={{ fontSize: '20px', color: '#1d3557' }} />}
                bodyStyle={{ height: '90vh', padding: 0, overflow: 'hidden' }}
                destroyOnClose
            >
                <div style={{ height: '100%', width: '100%' }}>
                    <Worker workerUrl={pdfjs.GlobalWorkerOptions.workerSrc}>
                        <Viewer
                            fileUrl={viewerModal.url}
                            plugins={[defaultLayoutPluginInstance]}
                        />
                    </Worker>
                </div>
            </Modal>
        </div>
    );
};

export default EducationalPortal;
