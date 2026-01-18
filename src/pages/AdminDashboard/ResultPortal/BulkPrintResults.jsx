import React, { useState, useEffect } from "react";
import { Form, Select, Button, Card, Spin, Space, Divider, Typography } from "antd";
import { PrinterOutlined, ArrowLeftOutlined, LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { supabase as portalSupabase } from "../../../config/supabase";
import logo from "../../../assets/images/Ambitious logo .jpg";

const { Title, Text } = Typography;
const { Option } = Select;

const BulkPrintResults = () => {
    const [loading, setLoading] = useState(false);
    const [metaLoading, setMetaLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [resultsData, setResultsData] = useState([]);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    useEffect(() => {
        fetchMetaData();
    }, []);

    const fetchMetaData = async () => {
        try {
            const { data: cls } = await portalSupabase.from("result_classes").select("*").order("name");
            const { data: ses } = await portalSupabase.from("result_sessions").select("*").order("created_at", { ascending: false });
            setClasses(cls || []);
            setSessions(ses || []);
        } catch (error) {
            console.error(error);
        } finally {
            setMetaLoading(false);
        }
    };

    const loadAllResults = async (values) => {
        setLoading(true);
        const { class_id, session_id } = values;
        try {
            // 1. Fetch Students in Class
            const { data: students } = await portalSupabase
                .from("result_students")
                .select("*, result_classes(*)")
                .eq("class_id", class_id)
                .order("roll_number");

            // 2. Fetch Summaries for this session
            const { data: summaries } = await portalSupabase
                .from("result_summaries")
                .select("*")
                .eq("session_id", session_id)
                .in("student_id", students.map(s => s.id));

            // 3. Fetch All Marks for these students
            const { data: allMarks } = await portalSupabase
                .from("result_marks")
                .select("*, result_subjects(*)")
                .eq("session_id", session_id)
                .in("student_id", students.map(s => s.id));

            const { data: session } = await portalSupabase
                .from("result_sessions")
                .select("*")
                .eq("id", session_id)
                .single();

            // Compile data
            const compiled = students.map(s => ({
                student: s,
                summary: summaries.find(sum => sum.student_id === s.id),
                marks: allMarks.filter(m => m.student_id === s.id),
                session
            })).filter(item => item.summary); // Only include students with results

            setResultsData(compiled);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (metaLoading) return <Spin size="large" className="m-5" />;

    return (
        <div className="bulk-print-container p-4">
            <div className="no-print mb-4">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/dashboard/addContent")}>Back to Dashboard</Button>
                <Card title="Bulk Print Result Cards" className="mt-3">
                    <Form form={form} layout="inline" onFinish={loadAllResults}>
                        <Form.Item name="session_id" label="Result Name" rules={[{ required: true }]}>
                            <Select placeholder="Select Session" style={{ width: 200 }}>
                                {sessions.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="class_id" label="Class" rules={[{ required: true }]}>
                            <Select placeholder="Select Class" style={{ width: 150 }}>
                                {classes.map(c => <Option key={c.id} value={c.id}>{c.name} - {c.section}</Option>)}
                            </Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>Load Results</Button>
                        {resultsData.length > 0 && (
                            <Button danger icon={<PrinterOutlined />} onClick={() => window.print()} style={{ marginLeft: 10 }}>Print All ({resultsData.length})</Button>
                        )}
                    </Form>
                </Card>
            </div>

            <div className="bulk-print-output">
                {resultsData.map((data, index) => (
                    <div key={data.student.id} className="print-page-break">
                        <div className="result-card-static">
                            {/* Header */}
                            <div className="header-section text-center">
                                <div className="header-flex">
                                    <img src={logo} alt="Logo" className="print-logo" />
                                    <div className="header-content">
                                        <h1>AMBITIOUS EDUCATION SYSTEM</h1>
                                        <p className="address">Main shop Jia Musa Shahdara Lahore, Pakistan, 54950</p>
                                    </div>
                                </div>
                                <div className="session-banner mt-2">
                                    <span>{data.session.name.toUpperCase()}</span>
                                </div>
                            </div>

                            {/* Student Info */}
                            <div className="student-info mt-3">
                                <div className="info-row">
                                    <div className="info-cell"><strong>Student Name:</strong> {data.student.full_name}</div>
                                    <div className="info-cell"><strong>Roll Number:</strong> {data.student.roll_number}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-cell"><strong>Father's Name:</strong> {data.student.father_name}</div>
                                    <div className="info-cell"><strong>Class & Section:</strong> {data.student.result_classes.name} - {data.student.result_classes.section}</div>
                                </div>
                            </div>

                            {/* Marks Table */}
                            <table className="marks-table mt-3">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Max Marks</th>
                                        <th>Obtained Marks</th>
                                        <th>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.marks.map(m => (
                                        <tr key={m.id}>
                                            <td>{m.result_subjects.name}</td>
                                            <td>{m.result_subjects.max_marks}</td>
                                            <td>{m.obtained_marks}</td>
                                            <td>{((m.obtained_marks / m.result_subjects.max_marks) * 100).toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                    <tr className="grand-total-row">
                                        <td><strong>GRAND TOTAL</strong></td>
                                        <td><strong>{data.summary.total_max}</strong></td>
                                        <td><strong>{data.summary.total_obtained}</strong></td>
                                        <td><strong>{data.summary.percentage}%</strong></td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Footer Statistics */}
                            <div className="footer-stats mt-3">
                                <div className="stat-pill">POSITION: <span>{data.summary.position}</span></div>
                                <div className="stat-pill">OVERALL %: <span>{data.summary.percentage}%</span></div>
                            </div>

                            {/* Signatures */}
                            <div className="signatures mt-5">
                                <div className="sig-line">Class Teacher</div>
                                <div className="sig-line">Parent</div>
                                <div className="sig-line">Principal</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .bulk-print-container { margin-top: 100px; }
        .result-card-static { border: 2px solid #000; padding: 20px; background: #fff; max-width: 800px; margin: 0 auto; }
        .header-flex { display: flex; align-items: center; justify-content: center; gap: 20px; }
        .print-logo { width: 80px; height: 80px; border-radius: 50%; }
        .header-content h1 { font-size: 2rem; margin: 0; font-weight: 800; }
        .session-banner { background: #000; color: #fff; padding: 5px; font-weight: bold; }
        
        .student-info { display: grid; gap: 10px; }
        .info-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding-bottom: 5px; }
        .info-cell { font-size: 0.95rem; }
        
        .marks-table { width: 100%; border-collapse: collapse; }
        .marks-table th, .marks-table td { border: 1px solid #000; padding: 8px; text-align: left; }
        .marks-table th { background: #f0f0f0; }
        .grand-total-row { background: #eee; }
        
        .footer-stats { display: flex; gap: 20px; justify-content: center; }
        .stat-pill { background: #000; color: #fff; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        .stat-pill span { color: gold; }
        
        .signatures { display: flex; justify-content: space-between; gap: 50px; }
        .sig-line { border-top: 2px solid #000; flex: 1; text-align: center; padding-top: 10px; }
        
        .print-page-break { page-break-after: always; margin-bottom: 50px; }
        .text-center { text-align: center; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-3 { margin-top: 1rem; }
        .mt-5 { margin-top: 3rem; }
        
        @media print {
          .no-print { display: none !important; }
          .bulk-print-container { margin: 0; padding: 0; }
          .print-page-break { margin: 0; padding: 20px; }
          .result-card-static { border-width: 2px !important; box-shadow: none !important; margin: 0; width: 100%; }
        }
      `}} />
        </div>
    );
};

export default BulkPrintResults;
