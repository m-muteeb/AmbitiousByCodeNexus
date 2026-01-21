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

    // Filter valid marks (Ignore subjects with 0 or missing max_marks)
    // Filter valid marks (Ignore subjects with 0, missing, or non-numeric max_marks)
    const validMarks = marks.filter(m => {
        const maxRaw = m.result_subjects?.max_marks;
        if (!maxRaw) return false;

        // Ensure it contains only digits/numbers (allows decimals)
        // If it's a string like "100", it works. If "-", it fails.
        const max = Number(maxRaw);
        return !isNaN(max) && max > 0;
    });

    // Recalculate totals for display based on filtered marks
    const displayedTotalMax = validMarks.reduce((sum, m) => sum + (m.result_subjects.max_marks || 0), 0);
    const displayedTotalObtained = validMarks.reduce((sum, m) => sum + (m.obtained_marks || 0), 0);
    const displayedPercentage = displayedTotalMax > 0 ? ((displayedTotalObtained / displayedTotalMax) * 100).toFixed(2) : "0.00";

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        const hide = message.loading("Generating Official PDF...", 0);
        try {
            const element = officialReportRef.current;
            const canvas = await html2canvas(element, {
                scale: 2, // High quality
                useCORS: true,
                backgroundColor: "#ffffff",
                windowWidth: 794, // A4 width in px at 96dpi approx
                logging: false,
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.98);
            const pdf = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: "a4",
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 0;

            pdf.addImage(imgData, "JPEG", margin, margin, pdfWidth, pdfHeight, undefined, 'FAST');
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

    const overallGrade = getGrade(displayedPercentage);

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
                        {validMarks.map((m) => {
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
                            <td>{displayedTotalMax}</td>
                            <td>{displayedTotalObtained}</td>
                            <td>{displayedPercentage}%</td>
                            <td style={{ fontWeight: 900 }}>{overallGrade}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="web-stats-footer" style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <div>POSITION: <span style={{ color: '#1d3557' }}>{summary.position || "N/A"}</span></div>
                </div>
            </div>

            {/* 2. SIMPLE PROFESSIONAL RESULT CARD (Hidden for PDF Generation) */}
            <div className="hidden-for-pdf">
                <div className="official-report-card simple-pro-a4" ref={officialReportRef}>

                    {/* Header: Logo Left (Large), School Info Right */}
                    <div className="simple-header">
                        <img src={logo} alt="Logo" className="simple-logo-large" />
                        <div className="simple-school-info">
                            <h1>THE AMBITIOUS EDUCATIONAL SYSTEM</h1>
                            <p>Jia Musa Shahdara Lahore</p>
                            <p>Phone: 0333-4082706</p>
                            <div className="simple-session-text">{session.name.toUpperCase()}</div>
                        </div>
                    </div>

                    <div className="simple-divider"></div>

                    {/* Student Info Table (Simple Bordered) */}
                    <table className="simple-student-table">
                        <tbody>
                            <tr>
                                <td className="label-cell">Student Name</td>
                                <td className="value-cell">{student.full_name.toUpperCase()}</td>
                                <td className="label-cell">Roll No</td>
                                <td className="value-cell">{student.roll_number}</td>
                            </tr>
                            <tr>
                                <td className="label-cell">Father Name</td>
                                <td className="value-cell">{student.father_name.toUpperCase()}</td>
                                <td className="label-cell">Class</td>
                                <td className="value-cell">{student.result_classes.name} ({student.result_classes.section})</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Marks Table (Simple Bordered, No Colors) */}
                    <table className="simple-marks-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', paddingLeft: '10px' }}>SUBJECT</th>
                                <th>MAX</th>
                                <th>OBTAINED</th>
                                <th>%</th>
                                <th>GRADE</th>
                                <th>REMARKS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {validMarks.map((m) => {
                                const p = ((m.obtained_marks / m.result_subjects.max_marks) * 100).toFixed(1);
                                const grade = getGrade(parseFloat(p));
                                const remarks = grade === 'F' ? 'Fail' : (grade === 'A+' ? 'Excellent' : 'Pass');
                                return (
                                    <tr key={m.id}>
                                        <td style={{ textAlign: 'left', paddingLeft: '10px', fontWeight: 'bold' }}>{m.result_subjects.name.toUpperCase()}</td>
                                        <td>{m.result_subjects.max_marks}</td>
                                        <td>{m.obtained_marks}</td>
                                        <td>{p}%</td>
                                        <td style={{ fontWeight: 'bold' }}>{grade}</td>
                                        <td style={{ fontStyle: 'italic' }}>{remarks}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Summary Table (Narrow, Centered, Simple Bordered) */}
                    <table className="simple-summary-table">
                        <tbody>
                            <tr>
                                <td className="sum-label">GRAND TOTAL</td>
                                <td className="sum-value">{displayedTotalObtained} / {displayedTotalMax}</td>
                            </tr>
                            <tr>
                                <td className="sum-label">PERCENTAGE</td>
                                <td className="sum-value">{displayedPercentage}%</td>
                            </tr>
                            <tr>
                                <td className="sum-label">POSITION</td>
                                <td className="sum-value">{summary.position || "-"}</td>
                            </tr>
                            <tr>
                                <td className="sum-label">OVERALL GRADE</td>
                                <td className="sum-value">{overallGrade}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Signatures */}
                    <div className="simple-signatures">
                        <div className="sig-block">
                            <div className="sig-line"></div>
                            <span>Class Teacher</span>
                        </div>
                        <div className="sig-block">
                            <div className="sig-line"></div>
                            <span>Principal</span>
                        </div>
                    </div>

                    <div className="simple-footer-meta">
                        Generated by Ambitious Portal | {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
