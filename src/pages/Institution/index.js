import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Spin, Button, message, Card, Row, Col, Empty, Typography, Space, Divider, Collapse, Badge, List, Tag } from "antd";
import {
    FileSearchOutlined,
    CrownOutlined,
    LockOutlined,
    DownloadOutlined,
    ArrowLeftOutlined,
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
                .order('created_at', { ascending: true }); // Chronological sequence as requested

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

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Helper to group content by Class
    const groupByClass = (data) => {
        const grouped = {};

        data.forEach(item => {
            const classLevel = item.class_level || 'General';

            if (!grouped[classLevel]) {
                grouped[classLevel] = [];
            }
            grouped[classLevel].push(item);
        });

        // Sort classes (9th, 10th, 11th, 12th)
        const sortedClasses = Object.keys(grouped).sort((a, b) => {
            const order = { '9th': 1, '10th': 2, '11th': 3, '12th': 4 };
            return (order[a] || 99) - (order[b] || 99);
        });

        return { groupedData: grouped, sortedClasses };
    };

    const applyBrandingToDocx = async (arrayBuffer, institutionName, address) => {
        const jszipLoaded = await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
        if (!jszipLoaded || !window.JSZip) throw new Error("JSZip failed to load");

        const zip = await new window.JSZip().loadAsync(arrayBuffer);
        const docXmlPath = "word/document.xml";
        let docXml = await zip.file(docXmlPath).async("string");

        // Professional Branding XML (Header style)
        const brandingXml = `
            <w:p>
                <w:pPr>
                    <w:jc w:val="center"/>
                    <w:pbdr>
                        <w:bottom w:val="double" w:sz="12" w:space="4" w:color="1d3557"/>
                    </w:pbdr>
                </w:pPr>
                <w:r>
                    <w:rPr>
                        <w:b/>
                        <w:sz w:val="52"/>
                        <w:szCs w:val="52"/>
                        <w:color w:val="1d3557"/>
                    </w:rPr>
                    <w:t>${institutionName}</w:t>
                </w:r>
            </w:p>
            <w:p>
                <w:pPr><w:jc w:val="center"/></w:pPr>
                <w:r>
                    <w:rPr>
                        <w:sz w:val="20"/>
                        <w:color w:val="457b9d"/>
                    </w:rPr>
                    <w:t>${address || 'Official Academic Series - Verified Institutional Copy'}</w:t>
                </w:r>
            </w:p>
            <w:p><w:r><w:t></w:t></w:r></w:p>
        `;

        if (docXml.includes("<w:body>")) {
            docXml = docXml.replace("<w:body>", `<w:body>${brandingXml}`);
        }

        zip.file(docXmlPath, docXml);
        return await zip.generateAsync({ type: "blob" });
    };

    const handleDownload = async (topic) => {
        if (!topic.file_urls || topic.file_urls.length === 0) {
            message.error("No file found for this resource");
            return;
        }

        const fileInfo = topic.file_urls[0];
        // Improved detection: Check extension from name or URL without query params
        const extension = (fileInfo.name || fileInfo.url.split('?')[0]).toLowerCase();
        const isPdf = extension.endsWith('.pdf');

        setDownloading(true);
        const hide = message.loading(`Preparing branded ${isPdf ? 'PDF' : 'DOCX'} for ${profile?.institution_name}...`, 0);

        try {
            const response = await fetch(fileInfo.url);
            const buffer = await response.arrayBuffer();

            if (isPdf) {
                // PDF Branding logic
                const pdfDoc = await PDFDocument.load(buffer);
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
                    } catch (e) { console.warn("Logo embed failed:", e); }
                }

                pages.forEach((page) => {
                    const { width, height } = page.getSize();
                    page.drawRectangle({ x: 0, y: height - 60, width, height: 60, color: rgb(0.95, 0.97, 1) });
                    page.drawText(profile?.institution_name || 'Ambitious Academy', {
                        x: logoImage ? 110 : 50, y: height - 40, size: 24, font, color: rgb(0.11, 0.21, 0.34)
                    });
                    if (logoImage) page.drawImage(logoImage, { x: 40, y: height - 55, width: 50, height: 50 });
                    page.drawText(`Copy for: ${profile?.full_name} | ${new Date().toLocaleDateString()}`, {
                        x: 50, y: 20, size: 8, color: rgb(0.6, 0.6, 0.6)
                    });
                });

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                saveAs(blob, `[Branded] ${topic.title}.pdf`);
            } else {
                // Branded DOCX Download
                const instName = profile?.institution_name || "Ambitious Educational System";
                const instAddr = profile?.address || "Official Portal Distribution";
                const brandedBlob = await applyBrandingToDocx(buffer, instName, instAddr);
                saveAs(brandedBlob, `[Branded] ${topic.title}.docx`);
            }

            message.success("Branded Document Downloaded!");
        } catch (err) {
            console.error('Download error:', err);
            message.error("Branding failed. Downloading original file...");
            window.open(fileInfo.url, '_blank');
        } finally {
            setDownloading(false);
            hide();
        }
    };

    const saveAs = (blob, fileName) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

    const { groupedData, sortedClasses } = groupByClass(content);

    return (
        <div className="institution-portal-root" style={{ background: '#f0f4f8', minHeight: '100vh', paddingBottom: 100 }}>
            {/* Premium Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)',
                padding: '80px 24px 120px',
                textAlign: 'center',
                color: '#fff',
                clipPath: 'ellipse(150% 100% at 50% 0%)'
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 2,
                        marginBottom: 20,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        {profile?.institution_name || 'Ambitious Associate'}
                    </div>
                    <Title level={1} style={{ color: '#fff', fontSize: '3.2rem', fontWeight: 900, marginBottom: 15 }}>
                        Institutional Hub
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', fontWeight: 400 }}>
                        Download branded test series and academic content in seconds.
                    </Text>
                </div>
            </div>

            <div style={{ maxWidth: 1100, margin: '-60px auto 0', padding: '0 24px' }}>
                {!activeSection ? (
                    <Row gutter={[24, 24]} justify="center">
                        <Col xs={24} md={12}>
                            <Card
                                hoverable
                                onClick={() => fetchTieredContent('demo')}
                                style={{
                                    borderRadius: 30,
                                    border: 'none',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                    overflow: 'hidden'
                                }}
                                bodyStyle={{ padding: 0 }}
                            >
                                <div style={{ padding: '50px 40px', textAlign: 'center' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        width: 90,
                                        height: 90,
                                        background: '#f1f5f9',
                                        borderRadius: '30%',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 30,
                                        color: '#1d3557',
                                        transform: 'rotate(-10deg)'
                                    }}>
                                        <FileSearchOutlined style={{ fontSize: 40 }} />
                                    </div>
                                    <Title level={2} style={{ marginBottom: 15 }}>Demo Access</Title>
                                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 30 }}>
                                        Evaluate our quality with sample test series.
                                    </Text>
                                    <Button type="primary" size="large" block style={{ height: 55, borderRadius: 15, background: '#1d3557', fontWeight: 700, fontSize: 16 }}>
                                        Enter Demo Library
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                        {isPremium && (
                            <Col xs={24} md={12}>
                                <Card
                                    hoverable
                                    onClick={() => fetchTieredContent('premium')}
                                    style={{
                                        borderRadius: 30,
                                        border: 'none',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                        overflow: 'hidden'
                                    }}
                                    bodyStyle={{ padding: 0 }}
                                >
                                    <div style={{ padding: '50px 40px', textAlign: 'center' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            width: 90,
                                            height: 90,
                                            background: '#fff7e6',
                                            borderRadius: '30%',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 30,
                                            color: '#faad14',
                                            transform: 'rotate(10deg)'
                                        }}>
                                            <CrownOutlined style={{ fontSize: 40 }} />
                                        </div>
                                        <Title level={2} style={{ marginBottom: 15 }}>Premium Library</Title>
                                        <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 30 }}>
                                            Full access to all exclusive test papers.
                                        </Text>
                                        <Button type="primary" size="large" block style={{ height: 55, borderRadius: 15, background: '#cea60c', borderColor: '#cea60c', fontWeight: 700, fontSize: 16 }}>
                                            Go Premium
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                        )}
                    </Row>
                ) : (
                    <div style={{ animation: 'slideUp 0.5s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => setActiveSection(null)}
                                style={{ borderRadius: 10, fontWeight: 600 }}
                            >
                                Back to Hub
                            </Button>
                            <Badge status="processing" text={<span style={{ fontWeight: 600, color: '#1d3557' }}>{activeSection.toUpperCase()} ACCESS</span>} />
                        </div>

                        {fetching ? (
                            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                <Spin size="large" tip="Syncing with Education Cloud..." />
                            </div>
                        ) : content.length > 0 ? (
                            <Collapse
                                expandIconPosition="end"
                                defaultActiveKey={sortedClasses}
                                ghost
                                collapseIcon={({ isActive }) => <ReadOutlined style={{ transform: isActive ? 'rotate(90deg)' : 'none', transition: 'all 0.3s' }} />}
                            >
                                {sortedClasses.map(classLevel => (
                                    <Panel
                                        header={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                                                <div style={{ width: 40, height: 40, background: '#1d3557', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 900 }}>
                                                    {classLevel.replace(/\D/g, '')}
                                                </div>
                                                <Title level={4} style={{ margin: 0 }}>Class {classLevel} Series</Title>
                                            </div>
                                        }
                                        key={classLevel}
                                        style={{ marginBottom: 20, background: '#fff', borderRadius: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}
                                    >
                                        <div style={{ padding: '10px 20px 30px' }}>
                                            <List
                                                itemLayout="horizontal"
                                                dataSource={groupedData[classLevel]}
                                                renderItem={(topic, index) => (
                                                    <List.Item
                                                        style={{
                                                            borderBottom: '1px solid #f0f0f0',
                                                            padding: '24px 0',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        actions={[
                                                            <Button
                                                                type="primary"
                                                                icon={<DownloadOutlined />}
                                                                loading={downloading}
                                                                onClick={() => handleDownload(topic)}
                                                                style={{
                                                                    height: 45,
                                                                    padding: '0 25px',
                                                                    borderRadius: 12,
                                                                    background: '#1d3557',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                Download Branded
                                                            </Button>
                                                        ]}
                                                    >
                                                        <List.Item.Meta
                                                            avatar={
                                                                <div style={{
                                                                    width: 45,
                                                                    height: 45,
                                                                    background: '#f8fafc',
                                                                    borderRadius: 12,
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    border: '1px solid #e2e8f0'
                                                                }}>
                                                                    <span style={{ fontSize: 10, color: '#64748b', fontWeight: 800, lineHeight: 1 }}>STEP</span>
                                                                    <span style={{ fontSize: 18, color: '#1d3557', fontWeight: 900, lineHeight: 1 }}>{index + 1}</span>
                                                                </div>
                                                            }
                                                            title={<span style={{ fontSize: 18, fontWeight: 800, color: '#1d3557' }}>{topic.title}</span>}
                                                            description={
                                                                <Space split={<Divider type="vertical" />}>
                                                                    <Text type="secondary">Added: {new Date(topic.created_at).toLocaleDateString()}</Text>
                                                                    <Tag color={topic.file_urls?.[0]?.url.toLowerCase().endsWith('.pdf') ? "red" : "blue"}>
                                                                        {topic.file_urls?.[0]?.url.toLowerCase().endsWith('.pdf') ? "SECURE PDF" : "WORD DOC"}
                                                                    </Tag>
                                                                </Space>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        </div>
                                    </Panel>
                                ))}
                            </Collapse>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No academic sequences found in this library yet."
                                style={{ background: '#fff', padding: '60px', borderRadius: 20 }}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstitutionPortal;
