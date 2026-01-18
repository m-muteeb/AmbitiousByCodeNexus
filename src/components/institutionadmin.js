import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Spin, Button, message, Card, Row, Col, Alert, Tooltip } from "antd";
import { FileSearchOutlined, CrownOutlined } from "@ant-design/icons";
import DemoTests from "./DemoTests";
import PremiumTests from "./PremiumTests";
import { addHeaderToPdf } from "../utils/pdfUtils";

const PdfList = () => {
  const { user, profile: institution, loading } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState(null); // "demo" | "premium" | null
  const [accessDenied, setAccessDenied] = useState(false);

  const handleDownloadSelected = async () => {
    if (!selectedFiles.length) return message.info("No PDFs selected.");
    setDownloading(true);
    try {
      for (const file of selectedFiles) {
        await addHeaderToPdf(file.url, institution, file.fileName);
      }
      message.success("All selected PDFs downloaded.");
    } catch (err) {
      console.error(err);
      message.error("Error downloading PDFs.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !user || !institution) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin size="large" tip="Loading user and institution..." />
      </div>
    );
  }

  const role = institution.role;

  const onSelectSection = (section) => {
    setSelectedFiles([]);
    setAccessDenied(false);

    if (section === "premium" && role === "admin") {
      setAccessDenied(true);
      setActiveSection(null);
      message.error("You don't have access to Premium Tests.");
    } else {
      setActiveSection(section);
    }
  };

  return (
    <div className="pdf-list-container" style={{ padding: 24 }}>
      <h1 style={{ marginTop: 78 }}>
        Welcome back, <span style={{ color: "#1890ff" }}>{institution?.institutionName}</span>!
      </h1>

      <p style={{ fontSize: 16, marginBottom: 24 }}>
        We're glad to have you here. Please select a test type below to view and download your resources.
      </p>

      {/* 🎉 Premium Member Congratulations */}
      {role === "premium" && (
        <Alert
          message="🎉 Congratulations!"
          description="You are a Premium Member for the decided term. Enjoy exclusive access to high-quality test resources curated just for you. We're honored to support your educational journey!"
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Admin Notice */}
      {role === "admin" && (
        <Alert
          message="Notice"
          description="You have only access to the Demo Tests. To gain access to the Premium version, please contact us at +923334082706"
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Section Select */}
      {!activeSection && (
        <>
          <h2 className="title" style={{ marginTop: 16 }}>Select Test Type</h2>

          <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
            {(role === "admin" || role === "premium" || role === "superadmin") && (
              <Col xs={24} sm={12}>
                <Card
                  hoverable
                  onClick={() => onSelectSection("demo")}
                  style={{ textAlign: "center" }}
                >
                  <FileSearchOutlined style={{ fontSize: 40, color: "#1890ff" }} />
                  <h3>Demo Tests</h3>
                </Card>
              </Col>
            )}

            {(role === "premium" || role === "superadmin" || role === "admin") && (
              <Col xs={24} sm={12}>
                {role === "admin" ? (
                  <Tooltip title="You have no access to Premium Tests. Please contact us to upgrade.">
                    <Card
                      hoverable
                      style={{ textAlign: "center", cursor: "not-allowed" }}
                      onClick={() => message.error("You don't have access to Premium Tests.")}
                    >
                      <CrownOutlined style={{ fontSize: 40, color: "#fadb14" }} />
                      <h3 style={{ color: "rgba(0,0,0,0.25)" }}>Premium Tests</h3>
                    </Card>
                  </Tooltip>
                ) : (
                  <Card
                    hoverable
                    onClick={() => onSelectSection("premium")}
                    style={{ textAlign: "center" }}
                  >
                    <CrownOutlined style={{ fontSize: 40, color: "#fadb14" }} />
                    <h3>Premium Tests</h3>
                  </Card>
                )}
              </Col>
            )}
          </Row>
        </>
      )}

      {/* Access Denied */}
      {accessDenied && (
        <Alert
          message="Access Denied"
          description="You don't have access to this section."
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Buttons */}
      {activeSection && (
        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <Button onClick={() => {
            setActiveSection(null);
            setSelectedFiles([]);
            setAccessDenied(false);
          }}>
            Back to Selection
          </Button>
          <Button
            type="primary"
            style={{ marginLeft: 8 }}
            loading={downloading}
            onClick={handleDownloadSelected}
            disabled={selectedFiles.length === 0}
          >
            Download Selected
          </Button>
          <Button
            onClick={() => setSelectedFiles([])}
            style={{ marginLeft: 8, marginTop: 2 }}
            disabled={selectedFiles.length === 0}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Tests */}
      {activeSection === "demo" && (
        <Card title="📘 Demo Tests" style={{ marginTop: 16 }}>
          <DemoTests selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
        </Card>
      )}

      {activeSection === "premium" && (
        <Card title="👑 Premium Tests" style={{ marginTop: 16 }}>
          <PremiumTests selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
        </Card>
      )}
    </div>
  );
};

export default PdfList;
