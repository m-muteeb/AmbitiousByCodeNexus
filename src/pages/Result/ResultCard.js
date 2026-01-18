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
    // Add safety check for data
    if (!data) return <div style={{ textAlign: 'center', marginTop: 50 }}>No result data available.</div>;

    const { student, session, summary, marks } = data;

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        const hide = message.loading("Generating Official PDF...", 0);
        try {
            const element = officialReportRef.current;
            const canvas = await html2canvas(element, {
                scale: 4,
                useCORS: true,
                backgroundColor: "#ffffff",
                windowWidth: 500,
                logging: false,
            });

            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            const pdf = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: "a4",
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);

            // Tight margins (15mm sides, 5mm top)
            const marginSide = 15;
            const marginTop = 5;
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
                        {isDownloading ? "DOWNLOADING..." : "DOWNLOAD OFFICIAL PDF"}
                    </Button>
                </div>

                <div className="web-portal-header">
                    <h1 className="web-portal-title">STUDENT PERFORMANCE RESULT</h1>
                    <div style={{ marginTop: '5px', fontWeight: 700, color: '#666' }}>{session.name.toUpperCase()}</div>
                </div>

                <div className="web-info-grid">
                    <div className="web-info-item">
                        <div className="web-info-label">Student Name</div>
                        <div className="web-info-value">{student.full_name.toUpperCase()}</div>
                    </div>
                    <div className="web-info-item">
                        <div className="web-info-label">Father's Name</div>
                        <div className="web-info-value">{student.father_name.toUpperCase()}</div>
                    </div>
                    <div className="web-info-item">
                        <div className="web-info-label">Roll Number</div>
                        <div className="web-info-value">{student.roll_number}</div>
                    </div>
                    <div className="web-info-item">
                        <div className="web-info-label">Class & Section</div>
                        <div className="web-info-value">{student.result_classes.name} - {student.result_classes.section}</div>
                    </div>
                </div>

                <table className="web-table">
                    <thead>
                        <tr>
                            <th className="subject-name">SUBJECT NAME</th>
                            <th>TOTAL MARKS</th>
                            <th>OBTAINED MARKS</th>
                            <th>PERCENTAGE</th>
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
                            <td className="subject-name">OVERALL RESULT</td>
                            <td>{summary.total_max}</td>
                            <td>{summary.total_obtained}</td>
                            <td>{summary.percentage}%</td>
                            <td style={{ fontWeight: 900 }}>{overallGrade}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="web-stats-footer">
                    <div>CLASS POSITION: {summary.position || "N/A"}</div>
                </div>
            </div>

            {/* 2. ELITE OFFICIAL REPORT UI (Hidden, Minimalist for PDF) */}
            <div className="hidden-for-pdf">
                <div className="official-report-card" ref={officialReportRef}>
                    <div className="official-header-container">
                        <img src={logo} alt="Logo" className="official-logo" />
                        <div className="official-header-text">
                            <h1 className="official-title">AMBITIOUS EDUCATION SYSTEM</h1>
                            <p className="official-subtitle">Main shop Jia Musa Shahdara Lahore | 0333-4082706</p>
                            <p className="official-subtitle">Web: ambitious-pk.netlify.app | Academic Report Card</p>
                            <p className="official-subtitle" style={{ fontWeight: 700, marginTop: '2px' }}>{session.name.toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="official-info-grid">
                        <div className="official-info-cell"><span>S.Name:</span> <strong>{student.full_name.toUpperCase()}</strong></div>
                        <div className="official-info-cell"><span>F.Name:</span> <strong>{student.father_name.toUpperCase()}</strong></div>
                        <div className="official-info-cell"><span>Roll No:</span> <strong>{student.roll_number}</strong></div>
                        <div className="official-info-cell"><span>Class:</span> <strong>{student.result_classes.name}-{student.result_classes.section}</strong></div>
                    </div>

                    <div className="official-table-wrapper">
                        <table className="official-table">
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', paddingLeft: '8px' }}>Subject</th>
                                    <th>Max</th>
                                    <th>Obtain</th>
                                    <th>%</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marks.map((m) => {
                                    const p = ((m.obtained_marks / m.result_subjects.max_marks) * 100).toFixed(1);
                                    return (
                                        <tr key={m.id}>
                                            <td className="subject-name" style={{ paddingLeft: '8px' }}>{m.result_subjects.name.toUpperCase()}</td>
                                            <td>{m.result_subjects.max_marks}</td>
                                            <td>{m.obtained_marks}</td>
                                            <td>{p}%</td>
                                            <td>{getGrade(parseFloat(p))}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="official-summary-stats">
                        <span>TOTAL: {summary.total_obtained}/{summary.total_max}</span>
                        <span>PERCENTAGE: {summary.percentage}%</span>
                        <span>GRADE: {overallGrade}</span>
                        <span>POSITION: {summary.position || "-"}</span>
                    </div>

                    <div className="official-signatures">
                        <div className="official-sig-col">Class Teacher</div>
                        <div className="official-sig-col">Principal</div>
                        <div className="official-sig-col">Managing Director</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
