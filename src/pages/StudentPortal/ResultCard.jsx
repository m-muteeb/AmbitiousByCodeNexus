import React, { useRef, useState } from "react";
import { Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import logo from "../../assets/images/Ambitious logo .jpg";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ResultPortal.css";

const ResultCard = ({ data }) => {
    const officialReportRef = useRef();
    const [isDownloading, setIsDownloading] = useState(false);
    const { student, session, summary, marks } = data;

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        const hide = message.loading("Generating Official PDF...", 0);
        try {
            const element = officialReportRef.current;
            const canvas = await html2canvas(element, {
                scale: 3, // slightly lower scale for better performance on full page
                useCORS: true,
                backgroundColor: "#ffffff",
                windowWidth: 500,
                logging: false,
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.95);
            const pdf = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: "a4",
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);

            // Tight margins (10mm sides, 10mm top)
            const marginSide = 10;
            const marginTop = 10;
            const contentWidth = pdfWidth - (marginSide * 2);
            const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

            pdf.addImage(imgData, "JPEG", marginSide, marginTop, contentWidth, contentHeight, undefined, 'FAST');
            pdf.save(`${student.full_name}_Official_Result.pdf`);

            message.destroy(hide);
            message.success("Successfully Downloaded!");
        } catch (error) {
            console.error(error);
            message.destroy(hide);
            message.error("PDF Export Failed.");
        } finally {
            setIsDownloading(false);
        }
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B";
        if (percentage >= 60) return "C";
        if (percentage >= 50) return "D";
        return "F";
    };

    const overallGrade = getGrade(summary.percentage);

    return (
        <div className="dual-ui-wrapper">
            {/* 1. WEB DISPLAY UI (Simple Student Version) */}
            <div className="portal-web-display">
                <div className="no-print" style={{ textAlign: "right", marginBottom: "30px" }}>
                    <Button
                        type="primary"
                        danger
                        size="large"
                        loading={isDownloading}
                        icon={!isDownloading && <DownloadOutlined />}
                        onClick={handleDownloadPDF}
                        style={{ fontWeight: 800, borderRadius: '4px', height: '45px' }}
                    >
                        {isDownloading ? "DOWNLOADING..." : "DOWNLOAD OFFICIAL CARD"}
                    </Button>
                </div>

                <div className="web-portal-header">
                    <h1 className="web-portal-title">STUDENT PERFORMANCE RESULT</h1>
                    <div style={{ marginTop: '5px', fontWeight: 700, color: '#666' }}>{session.name.toUpperCase()}</div>
                </div>

                <div className="web-info-grid">
                    <div className="web-info-item">
                        <div className="web-info-label">Name</div>
                        <div className="web-info-value">{student.full_name.toUpperCase()}</div>
                    </div>
                    <div className="web-info-item">
                        <div className="web-info-label">Father's Name</div>
                        <div className="web-info-value">{student.father_name.toUpperCase()}</div>
                    </div>
                    <div className="web-info-item">
                        <div className="web-info-label">Roll #</div>
                        <div className="web-info-value">{student.roll_number}</div>
                    </div>
                    <div className="web-info-item">
                        <div className="web-info-label">Class</div>
                        <div className="web-info-value">{student.result_classes.name} - {student.result_classes.section}</div>
                    </div>
                </div>

                <table className="web-table">
                    <thead>
                        <tr>
                            <th className="subject-name">SUBJECT</th>
                            <th>TOTAL</th>
                            <th>OBT</th>
                            <th>%</th>
                            <th>GRADE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marks.map((m) => {
                            const p = ((m.obtained_marks / m.result_subjects.max_marks) * 100).toFixed(1);
                            return (
                                <tr key={m.id}>
                                    <td className="subject-name">{m.result_subjects.name.toUpperCase()}</td>
                                    <td>{m.result_subjects.max_marks}</td>
                                    <td>{m.obtained_marks}</td>
                                    <td>{p}%</td>
                                    <td style={{ fontWeight: 800 }}>{getGrade(parseFloat(p))}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="web-summary-row">
                            <td className="subject-name">TOTAL</td>
                            <td>{summary.total_max}</td>
                            <td>{summary.total_obtained}</td>
                            <td>{summary.percentage}%</td>
                            <td style={{ fontWeight: 900 }}>{overallGrade}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="web-stats-footer">
                    <div>POSITION: {summary.position || "N/A"}</div>
                </div>
            </div>

            {/* 2. COMPACT OFFICIAL REPORT FOR PDF */}
            <div className="hidden-for-pdf">
                <div className="official-report-card compact" ref={officialReportRef}>
                    <div className="compact-header">
                        <img src={logo} alt="Logo" className="compact-logo" />
                        <div className="compact-titles">
                            <h1 className="compact-main-title">THE AMBITIOUS EDUCATIONAL SYSTEM</h1>
                            <p className="compact-subtitle">Jia Musa Shahdara Lahore | 0333-4082706 | ambitious-pk.netlify.app</p>
                            <div className="compact-session-box">{session.name.toUpperCase()}</div>
                        </div>
                    </div>

                    <div className="compact-student-grid">
                        <div className="compact-field">
                            <span className="label">Student Name:</span>
                            <span className="value">{student.full_name.toUpperCase()}</span>
                        </div>
                        <div className="compact-field">
                            <span className="label">Father Name:</span>
                            <span className="value">{student.father_name.toUpperCase()}</span>
                        </div>
                        <div className="compact-field small">
                            <span className="label">Roll No:</span>
                            <span className="value">{student.roll_number}</span>
                        </div>
                        <div className="compact-field small">
                            <span className="label">Class/Sec:</span>
                            <span className="value">{student.result_classes.name} ({student.result_classes.section})</span>
                        </div>
                    </div>

                    <div className="compact-table-wrapper">
                        <table className="compact-table">
                            <thead>
                                <tr>
                                    <th className="t-left">Subject</th>
                                    <th>Max</th>
                                    <th>Obt</th>
                                    <th>%</th>
                                    <th>Grd</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marks.map((m) => {
                                    const p = ((m.obtained_marks / m.result_subjects.max_marks) * 100).toFixed(1);
                                    return (
                                        <tr key={m.id}>
                                            <td className="t-left">{m.result_subjects.name.toUpperCase()}</td>
                                            <td>{m.result_subjects.max_marks}</td>
                                            <td>{m.obtained_marks}</td>
                                            <td>{p}%</td>
                                            <td>{getGrade(parseFloat(p))}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="compact-total-row">
                                    <td className="t-left">OVERALL RESULT</td>
                                    <td>{summary.total_max}</td>
                                    <td>{summary.total_obtained}</td>
                                    <td>{summary.percentage}%</td>
                                    <td>{overallGrade}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="compact-footer-stats">
                        <div className="stat-box">POSITION: <span>{summary.position || "-"}</span></div>
                        <div className="sign-area">
                            <span>Principal Signature: _________________</span>
                        </div>
                    </div>

                    <div className="compact-print-date">Generated on: {new Date().toLocaleDateString()}</div>
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
