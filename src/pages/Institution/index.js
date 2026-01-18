import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Spin, Button, message, Card, Row, Col, Empty, Typography, Space, Divider, Collapse } from "antd";
import {
    FileSearchOutlined,
    CrownOutlined,
    LockOutlined,
    DownloadOutlined,
    ArrowLeftOutlined,
    FilePdfOutlined,
    ReadOutlined
} from "@ant-design/icons";
import { supabase } from "../../config/supabase";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const InstitutionPortal = () => {
    const { profile, loading: authLoading } = useAuth();
    const [activeSection, setActiveSection] = useState(null); // "demo" | "premium"
    const [content, setContent] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Fetch tiered content from Supabase
    const fetchTieredContent = async (tier) => {
        setFetching(true);
        try {
            const { data, error } = await supabase
                .from('topics')
                .select('*')
                .eq('category', 'paid_test_series')
                .eq('paid_tier', tier)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContent(data || []);
            setActiveSection(tier);
        } catch (err) {
            console.error('Fetch error:', err);
            message.error(`Failed to load ${tier} resources`);
        } finally {
            setFetching(false);
        }
    };

    // Helper to group content by Class -> Subject
    const groupByClassAndSubject = (data) => {
        const grouped = {};

        data.forEach(item => {
            const classLevel = item.class_level || 'General';
            const subject = item.subject || 'General';

            if (!grouped[classLevel]) {
                grouped[classLevel] = {};
            }
            if (!grouped[classLevel][subject]) {
                grouped[classLevel][subject] = [];
            }
            grouped[classLevel][subject].push(item);
        });

        // Sort classes (9th, 10th, 11th, 12th)
        const sortedClasses = Object.keys(grouped).sort((a, b) => {
            const order = { '9th': 1, '10th': 2, '11th': 3, '12th': 4 };
            return (order[a] || 99) - (order[b] || 99);
        });

        return { groupedData: grouped, sortedClasses };
    };

    const handleDownload = async (topic) => {
        if (!topic.file_urls || topic.file_urls.length === 0) {
            message.error("No file found for this resource");
            return;
        }

        const fileInfo = topic.file_urls[0];
        setDownloading(true);
        const hide = message.loading(`Branding PDF for ${profile?.institution_name}...`, 0);

        try {
            const response = await fetch(fileInfo.url);
            const existingPdfBytes = await response.arrayBuffer();

            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const institutionalLogo = profile?.logo_url;

            let logoImage = null;
            if (institutionalLogo) {
                try {
                    const logoResponse = await fetch(institutionalLogo);
                    const logoBytes = await logoResponse.arrayBuffer();
                    if (institutionalLogo.toLowerCase().endsWith('.png')) {
                        logoImage = await pdfDoc.embedPng(logoBytes);
                    } else {
                        logoImage = await pdfDoc.embedJpg(logoBytes);
                    }
                } catch (e) {
                    console.warn("Could not embed logo image:", e);
                }
            }

            pages.forEach((page) => {
                const { width, height } = page.getSize();

                page.drawRectangle({
                    x: 0,
                    y: height - 60,
                    width: width,
                    height: 60,
                    color: rgb(0.95, 0.97, 1),
                });

                page.drawText(profile?.institution_name || 'Ambitious Academy', {
                    x: logoImage ? 110 : 50,
                    y: height - 40,
                    size: 24,
                    font: font,
                    color: rgb(0.11, 0.21, 0.34),
                });

                if (logoImage) {
                    page.drawImage(logoImage, {
                        x: 40,
                        y: height - 55,
                        width: 50,
                        height: 50,
                    });
                } else {
                    page.drawText('A', {
                        x: 40,
                        y: height - 45,
                        size: 30,
                        font: font,
                        color: rgb(0.27, 0.48, 0.62),
                    });
                }

                page.drawText(`Personalized Copy for: ${profile?.full_name} | ${new Date().toLocaleDateString()}`, {
                    x: 50,
                    y: 20,
                    size: 8,
                    color: rgb(0.6, 0.6, 0.6),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `[Branded] ${topic.title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.success("Branded PDF Generated Successfully!");
        } catch (err) {
            console.error('Watermarking error:', err);
            message.error("Could not brand PDF. Downloading original instead...");
            window.open(fileInfo.url, '_blank');
        } finally {
            setDownloading(false);
            hide();
        }
    };

    if (authLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: '#f8fafe' }}>
                <Spin size="large" tip="Verifying Institutional Identity..." />
            </div>
        );
    }

    const role = profile?.role || 'user';
    const isSuperAdmin = role === 'superadmin';
    const isStandardUser = role === 'user';
    const isPremium = role === 'premium' || isSuperAdmin;

    if (isStandardUser) {
        return (
            <div style={{ padding: '120px 24px', textAlign: 'center', background: '#f8fafe', minHeight: '100vh' }}>
                <Card style={{ maxWidth: 600, margin: '0 auto', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.06)', border: 'none' }}>
                    <LockOutlined style={{ fontSize: 64, color: '#ff4d4f', marginBottom: 24 }} />
                    <Title level={2}>Access Restricted</Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        The <b>Paid Test Series</b> portal is reserved for recognized Educational Institutions and Premium Members.
                    </Text>
                    <Divider />
                    <Button type="primary" size="large" icon={<ArrowLeftOutlined />} onClick={() => window.location.href = '/'}>
                        Back to Home
                    </Button>
                </Card>
            </div>
        );
    }

    const { groupedData, sortedClasses } = groupByClassAndSubject(content);

    return (
        <div style={{ padding: '120px 24px 60px', background: '#f8fafe', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ marginBottom: 40, textAlign: 'center' }}>
                    <Title level={2} style={{ margin: '0 0 10px', color: '#1d3557' }}>
                        Institutional Hub
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        Managed access for <span style={{ fontWeight: 700 }}>{profile?.institution_name || 'Associate'}</span>
                    </Text>
                </div>

                {!activeSection ? (
                    <Row gutter={[32, 32]} justify="center">
                        <Col xs={24} md={10}>
                            <Card
                                hoverable
                                className="tier-card"
                                onClick={() => fetchTieredContent('demo')}
                                style={{ borderRadius: 20, border: 'none', boxShadow: '0 15px 40px rgba(0,0,0,0.08)', height: '100%' }}
                            >
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ background: '#e6f7ff', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <FileSearchOutlined style={{ fontSize: 36, color: '#1890ff' }} />
                                    </div>
                                    <Title level={3} style={{ marginBottom: 16 }}>Demo Access</Title>
                                    <p style={{ color: '#6c757d', marginBottom: 24 }}>Explore sample test papers and resources for evaluation.</p>
                                    <Button type="primary" shape="round" size="large" style={{ width: '100%', background: '#1d3557', borderColor: '#1d3557' }}>
                                        View Demo Library
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={10}>
                            <Card
                                hoverable
                                className={`tier-card ${!isPremium ? 'locked' : ''}`}
                                onClick={() => isPremium ? fetchTieredContent('premium') : message.error("Premium access required")}
                                style={{ borderRadius: 20, border: 'none', boxShadow: '0 15px 40px rgba(0,0,0,0.08)', height: '100%' }}
                            >
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ background: '#fff7e6', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        {isPremium ? <CrownOutlined style={{ fontSize: 36, color: '#faad14' }} /> : <LockOutlined style={{ fontSize: 36, color: '#faad14' }} />}
                                    </div>
                                    <Title level={3} style={{ marginBottom: 16 }}>Premium Library</Title>
                                    <p style={{ color: '#6c757d', marginBottom: 24 }}>Full access to complete test series and exclusive content.</p>
                                    <Button
                                        type={isPremium ? "primary" : "default"}
                                        shape="round"
                                        size="large"
                                        style={{ width: '100%', ...(isPremium ? { background: '#cea60c', borderColor: '#cea60c' } : {}) }}
                                        icon={!isPremium && <LockOutlined />}
                                    >
                                        {isPremium ? 'View Premium Library' : 'Upgrade Plan'}
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                ) : (
                    <div style={{ animation: 'fadeIn 0.4s ease' }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => setActiveSection(null)}
                            style={{ marginBottom: 24, border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}
                        >
                            Back to Hub
                        </Button>

                        <div style={{ marginBottom: 30 }}>
                            <Title level={3}>
                                {activeSection === 'premium' ?
                                    <Space><CrownOutlined style={{ color: '#faad14' }} /> Premium Collection</Space> :
                                    <Space><FileSearchOutlined style={{ color: '#1890ff' }} /> Demo Collection</Space>
                                }
                            </Title>
                        </div>

                        {fetching ? (
                            <div style={{ textAlign: 'center', padding: '60px' }}><Spin size="large" /></div>
                        ) : content.length > 0 ? (
                            <Collapse defaultActiveKey={sortedClasses} ghost>
                                {sortedClasses.map(classLevel => (
                                    <Panel
                                        header={<Title level={4} style={{ margin: 0 }}>Class {classLevel}</Title>}
                                        key={classLevel}
                                        style={{ marginBottom: 24, background: '#fff', borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                                    >
                                        <div style={{ padding: '0 12px' }}>
                                            {Object.keys(groupedData[classLevel]).map(subject => (
                                                <div key={subject} style={{ marginBottom: 32 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                        <ReadOutlined style={{ color: '#1890ff' }} />
                                                        <Text strong style={{ fontSize: 16 }}>{subject.toUpperCase()}</Text>
                                                        <div style={{ flex: 1, height: 1, background: '#f0f0f0', marginLeft: 10 }}></div>
                                                    </div>

                                                    <Row gutter={[16, 16]}>
                                                        {groupedData[classLevel][subject].map(topic => (
                                                            <Col xs={24} md={12} lg={8} key={topic.id}>
                                                                <Card
                                                                    size="small"
                                                                    style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}
                                                                    hoverable
                                                                >
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 15 }}>
                                                                        <div>
                                                                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{topic.title}</div>
                                                                            <Text type="secondary" style={{ fontSize: 12 }}>{new Date(topic.created_at).toLocaleDateString()}</Text>
                                                                        </div>
                                                                        <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f', opacity: 0.8 }} />
                                                                    </div>
                                                                    <Button
                                                                        type="primary"
                                                                        block
                                                                        ghost
                                                                        icon={<DownloadOutlined />}
                                                                        onClick={() => handleDownload(topic)}
                                                                        loading={downloading}
                                                                        size="small"
                                                                    >
                                                                        Download PDF
                                                                    </Button>
                                                                </Card>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </div>
                                            ))}
                                        </div>
                                    </Panel>
                                ))}
                            </Collapse>
                        ) : (
                            <Empty description="No resources found for this tier." />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstitutionPortal;
