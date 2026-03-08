import React, { useState, useEffect } from "react";
import { List, Card, Button, Select, Space, Typography, Row, Col, Badge, Modal, Empty, message, Alert } from "antd";
import {
    BookOutlined,
    FilePdfOutlined,
    DoubleRightOutlined,
    EyeOutlined,
    DownloadOutlined,
    CloseOutlined,
    FullscreenOutlined,
    InfoCircleOutlined,
    ExperimentOutlined,
    FunctionOutlined,
    TranslationOutlined,
    GlobalOutlined,
    ReadOutlined,
    BulbOutlined,
    CompassOutlined,
    LaptopOutlined
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { supabase, supabaseApi } from "../../config/supabase";
import { STUDY_SUBJECTS, STUDY_CATEGORIES, getCategoryLabel, getSubjectLabel } from "../../config/studyConstants";
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

const SUBJECT_ICONS = {
    'Urdu': <TranslationOutlined />,
    'English': <ReadOutlined />,
    'Mathematics': <FunctionOutlined />,
    'Islamiat': <CompassOutlined />,
    'Biology': <ExperimentOutlined />,
    'Physics': <BulbOutlined />,
    'Chemistry': <ExperimentOutlined />,
    'Computer Science': <LaptopOutlined />,
    'Tarjma-tul-Quran': <ReadOutlined />,
    'Pak Studies': <GlobalOutlined />,
    'Science': <ExperimentOutlined />,
    'Scheme-of-Study': <BookOutlined />
};

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
    const [availableMapping, setAvailableMapping] = useState({});

    // Performance: Local cache to avoid re-fetching same data
    const [cache, setCache] = useState({});

    useEffect(() => {
        const syncAvailability = async () => {
            if (!selectedClass) return;
            try {
                // Try to get from session storage first for instant load
                const cachedMap = sessionStorage.getItem(`avail_${selectedClass}`);
                if (cachedMap) {
                    setAvailableMapping(JSON.parse(cachedMap));
                }

                const { data: topics, error } = await supabase
                    .from('topics')
                    .select('subject, category')
                    .eq('class_level', selectedClass)
                    .eq('is_premium', false)
                    .setHeader('Cache-Control', 'public, max-age=3600');

                if (error) throw error;

                const map = {};
                topics.forEach(item => {
                    const subj = item.subject || 'General';
                    if (!map[subj]) map[subj] = new Set();
                    map[subj].add(item.category);
                });

                const finalMap = {};
                Object.keys(map).forEach(k => finalMap[k] = Array.from(map[k]));
                setAvailableMapping(finalMap);
                sessionStorage.setItem(`avail_${selectedClass}`, JSON.stringify(finalMap));
            } catch (err) {
                console.error("Availability sync failed:", err);
            }
        };

        syncAvailability();
    }, [selectedClass]);

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
        if (name.toLowerCase() === 'ecat') return 'ECAT';
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
    };

    const fetchData = async (subject, cat) => {
        if (!selectedClass || !subject || !cat) return;

        const cacheKey = `p_${selectedClass}_${subject}_${cat}`;

        // FUTURE PROOF: Persistent Browser Cache
        // Checks if we fetched this in the last 24 hours to avoid API calls entirely
        const persistentData = localStorage.getItem(cacheKey);
        if (persistentData) {
            const parsed = JSON.parse(persistentData);
            const isFresh = (Date.now() - parsed.timestamp) < 86400000; // 24 Hours
            if (isFresh) {
                setData(parsed.files);
                setOverlayVisible(true);
                return;
            }
        }

        if (cache[cacheKey]) {
            setData(cache[cacheKey]);
            setOverlayVisible(true);
            return;
        }

        setLoading(true);
        try {
            // Optimization: Only select necessary columns to reduce JSON egress size
            const query = `select=id,title,file_urls&class_level=eq.${selectedClass}&subject=eq.${subject}&category=eq.${cat}&is_premium=eq.false&order=created_at.desc`;
            const results = await supabaseApi.fetch('topics', query);

            const flatFiles = [];
            (results || []).forEach(topic => {
                if (topic.file_urls) {
                    const files = Array.isArray(topic.file_urls) ? topic.file_urls : [topic.file_urls];
                    files.forEach(file => {
                        flatFiles.push({
                            ...file,
                            topicTitle: topic.title,
                            originalTopic: topic
                        });
                    });
                }
            });

            setData(flatFiles);
            setCache(prev => ({ ...prev, [cacheKey]: flatFiles }));

            // Save to persistent storage for 24 hours
            localStorage.setItem(cacheKey, JSON.stringify({
                files: flatFiles,
                timestamp: Date.now()
            }));

            setOverlayVisible(true);
        } catch (error) {
            console.error("Portal Fetch Error:", error);
            message.error("Unable to sync academic resources");
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async (file) => {
        const hide = message.loading(`Preparing ${file.name} for download...`, 0);
        try {
            const response = await fetch(file.url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            message.success(`${file.name} downloaded successfully!`);
        } catch (err) {
            console.error("Download failed:", err);
            window.open(file.url, '_blank');
        } finally {
            hide();
        }
    };

    const handleCategoryChange = (val, subjectKey) => {
        setSelectedSubject(subjectKey);
        setSelectedCategory(val);
        fetchData(subjectKey, val);
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
            <div className="subjects-premium-container">
                <Row gutter={[24, 24]}>
                    {STUDY_SUBJECTS.filter((subj) => {
                        // For Class 8, only English, Urdu, Math, Science
                        if (selectedClass === '8th') {
                            return ['English', 'Urdu', 'Mathematics', 'Science'].includes(subj.key);
                        }
                        if (selectedClass === 'ecat') {
                            return ['English', 'Computer Science', 'Chemistry', 'Mathematics', 'Physics'].includes(subj.key);
                        }
                        // For others, only show what has data
                        return availableMapping[subj.key] && availableMapping[subj.key].length > 0;
                    }).length > 0 ? (
                        STUDY_SUBJECTS.filter((subj) => {
                            if (selectedClass === '8th') {
                                return ['English', 'Urdu', 'Mathematics', 'Science'].includes(subj.key);
                            }
                            if (selectedClass === 'ecat') {
                                return ['English', 'Computer Science', 'Chemistry', 'Mathematics', 'Physics'].includes(subj.key);
                            }
                            return availableMapping[subj.key] && availableMapping[subj.key].length > 0;
                        }).map((subj) => (
                            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={subj.key}>
                                <Card
                                    hoverable
                                    className={`premium-subject-card ${selectedSubject === subj.key ? 'active' : ''}`}
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <div className="card-decoration"></div>
                                    <div className="subject-icon-box">
                                        {SUBJECT_ICONS[subj.key] || <BookOutlined />}
                                    </div>
                                    <div className="subject-info">
                                        <Title level={4} className="subject-title">{subj.label}</Title>
                                        <Text type="secondary" className="subject-meta">
                                            {availableMapping[subj.key]?.length || 0} Categories Available
                                        </Text>
                                    </div>

                                    <div className="subject-action-zone">
                                        <Select
                                            placeholder="Choose specialized material"
                                            className="premium-category-select"
                                            onChange={(val) => handleCategoryChange(val, subj.key)}
                                            value={selectedSubject === subj.key ? selectedCategory : undefined}
                                            dropdownStyle={{ borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                            loading={loading && selectedSubject === subj.key}
                                            suffixIcon={<DoubleRightOutlined />}
                                        >
                                            {STUDY_CATEGORIES.filter(c => {
                                                if (c.key === 'paid_test_series') return false;
                                                if (selectedClass === '8th') return c.key === 'guess_paper';
                                                return availableMapping[subj.key]?.includes(c.key);
                                            }).map(cat => (
                                                <Option key={cat.key} value={cat.key}>{cat.label}</Option>
                                            ))}
                                        </Select>
                                    </div>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col span={24}>
                            <div className="empty-state-centered" style={{ marginTop: '40px' }}>
                                <div className="uploading-text-big">We are uploading content</div>
                                <div className="uploading-subtext">Our academic team is currently preparing specialized material for this class level. Please check back shortly!</div>
                            </div>
                        </Col>
                    )}
                </Row>
            </div>

            {/* Combined Resource File Overlay - Reduced Clicks */}
            <Modal
                title={
                    <div className="modal-premium-header">
                        <Badge color="#1d3557" status="processing" style={{ marginRight: 10 }} />
                        <span className="modal-title-text">
                            Available Materials: {getSubjectLabel(selectedSubject)} — {getCategoryLabel(selectedCategory)}
                        </span>
                    </div>
                }
                open={overlayVisible}
                onCancel={() => setOverlayVisible(false)}
                footer={null}
                width={750}
                centered
                className="results-overlay-modal"
                bodyStyle={{ padding: '24px 32px', minHeight: '300px' }}
                destroyOnClose
            >
                {data.length > 0 ? (
                    <List
                        dataSource={data}
                        renderItem={file => (
                            <List.Item className="resource-file-row">
                                <Card className="premium-file-card" hoverable>
                                    <div className="file-card-inner">
                                        <div className="file-type-icon">
                                            <FilePdfOutlined />
                                        </div>
                                        <div className="file-info-main">
                                            <div className="file-display-name">{file.name}</div>
                                            <div className="file-topic-tag">Ref: {file.topicTitle}</div>
                                        </div>
                                        <div className="file-actions">
                                            <Space>
                                                <Button
                                                    type="primary"
                                                    icon={<EyeOutlined />}
                                                    onClick={() => openViewer(file)}
                                                    className="btn-view"
                                                >
                                                    READ
                                                </Button>
                                                <Button
                                                    icon={<DownloadOutlined />}
                                                    onClick={() => downloadFile(file)}
                                                    className="btn-download"
                                                >
                                                    SAVE
                                                </Button>
                                            </Space>
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className="empty-state-centered">
                        <div className="uploading-text-big">We are uploading content</div>
                        <div className="uploading-subtext">Our academic team is currently preparing specialized material for this section. Please check back shortly!</div>
                    </div>
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
