import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Button, Space, Select, Row, Col, Statistic, message } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { supabaseApi } from '../../../config/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { Title } = Typography;
const { Option } = Select;

const ResultReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null); // Optional filter

  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    passCount: 0,
    failCount: 0,
    maxMarks: 0,
    minMarks: 0,
    avgPercentage: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [sessionData, classData, subjectData] = await Promise.all([
        supabaseApi.fetch('result_sessions', 'order=created_at.desc'),
        supabaseApi.fetch('result_classes', 'order=name'),
        supabaseApi.fetch('result_subjects', 'order=name')
      ]);
      setSessions(sessionData || []);
      setClasses(classData || []);
      setSubjects(subjectData || []);
    } catch (error) {
      message.error("Failed to load dropdown data");
    }
  };

  const generateReport = async () => {
    if (!selectedSession || !selectedClass) {
      message.warning("Please select at least Session and Class");
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch Students
      const students = await supabaseApi.fetch('result_students', `class_id=eq.${selectedClass}`);
      if (!students?.length) {
        setReportData([]);
        setLoading(false);
        message.info("No students found in this class");
        return;
      }

      // 2. Fetch Marks for these students in this session
      const studentIds = students.map(s => s.id).join(',');
      let marksQuery = `session_id=eq.${selectedSession}&student_id=in.(${studentIds})`;

      const allMarks = await supabaseApi.fetch('result_marks', marksQuery);

      // 3. Process Data
      let processed = students.map(student => {
        const studentMarks = allMarks.filter(m => m.student_id === student.id);

        // Calculate Totals
        let totalObtained = 0;
        let totalMax = 0;
        let passStatus = "PASS";
        let subjectDetails = [];

        studentMarks.forEach(m => {
          const subjectMeta = subjects.find(s => s.id === m.subject_id);
          const max = subjectMeta?.max_marks || 100; // Default or fetch
          const pass = subjectMeta?.passing_marks || 33;

          totalObtained += m.obtained_marks;
          totalMax += max;

          if (m.obtained_marks < pass) passStatus = "FAIL";

          subjectDetails.push({
            subject: subjectMeta?.name,
            obtained: m.obtained_marks,
            max: max,
            status: m.obtained_marks < pass ? "Fail" : "Pass"
          });
        });

        const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

        return {
          ...student,
          totalObtained,
          totalMax,
          percentage: parseFloat(percentage),
          grade: calculateGrade(parseFloat(percentage)),
          status: passStatus,
          details: subjectDetails
        };
      });

      // 4. Sort and Calculate Position (Handling Ties)
      // Sort descending by totalObtained
      processed.sort((a, b) => b.totalObtained - a.totalObtained);

      // Assign Rank
      for (let i = 0; i < processed.length; i++) {
        if (i > 0 && processed[i].totalObtained === processed[i - 1].totalObtained) {
          processed[i].position = processed[i - 1].position;
        } else {
          processed[i].position = i + 1;
        }
      }

      setReportData(processed);

      // Calculate Stats
      const passed = processed.filter(p => p.status === "PASS").length;
      const failed = processed.length - passed;
      const max = Math.max(...processed.map(p => p.percentage));
      const min = Math.min(...processed.map(p => p.percentage));
      const avg = processed.reduce((sum, p) => sum + p.percentage, 0) / processed.length;

      setStats({
        totalStudents: processed.length,
        passCount: passed,
        failCount: failed,
        maxMarks: isFinite(max) ? max : 0,
        minMarks: isFinite(min) ? min : 0,
        avgPercentage: isFinite(avg) ? avg.toFixed(2) : 0
      });

    } catch (error) {
      console.error("Report Gen Error:", error);
      message.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  const downloadPDF = (type) => {
    if (reportData.length === 0) return message.warning("No data to export");

    const doc = new jsPDF();
    const sessionName = sessions.find(s => s.id === selectedSession)?.name;
    const className = classes.find(c => c.id === selectedClass)?.name + ' - ' + classes.find(c => c.id === selectedClass)?.section;

    doc.setFontSize(18);
    doc.text("AMBITIOUS EDUCATIONAL SYSTEM", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Academic Result Report: ${sessionName}`, 105, 22, { align: "center" });
    doc.text(`Class: ${className}`, 105, 28, { align: "center" });

    if (type === 'subject') {
      if (!selectedSubject) return message.error("Please select a subject for Subject Result");
      const subjName = subjects.find(s => s.id === selectedSubject)?.name;

      doc.text(`Subject: ${subjName}`, 105, 34, { align: "center" });

      const tableBody = reportData.map(student => {
        const subjectData = student.details.find(d => d.subject === subjName);
        return [
          student.roll_number,
          student.full_name,
          subjectData ? subjectData.max : '-',
          subjectData ? subjectData.obtained : '-',
          subjectData ? ((subjectData.obtained / subjectData.max) * 100).toFixed(1) + '%' : '-',
          subjectData ? subjectData.status : '-'
        ];
      });

      doc.autoTable({
        startY: 40,
        head: [['Roll No', 'Name', 'Max', 'Obtained', '%', 'Status']],
        body: tableBody,
      });

    } else {
      // Overall Report
      doc.text(`Overall Class Performance`, 105, 34, { align: "center" });

      const tableBody = reportData.map(s => [
        s.position,
        s.roll_number,
        s.full_name,
        s.totalMax,
        s.totalObtained,
        s.percentage + '%',
        s.grade,
        s.status
      ]);

      doc.autoTable({
        startY: 40,
        head: [['Pos', 'Roll No', 'Name', 'Total', 'Obt', '%', 'Grade', 'Status']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [29, 53, 87] }
      });

      // Add Stats Footer
      let finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text(`Total Students: ${stats.totalStudents} | Passed: ${stats.passCount} | Failed: ${stats.failCount}`, 14, finalY);
      doc.text(`Highest %: ${stats.maxMarks}% | Lowest %: ${stats.minMarks}%`, 14, finalY + 6);
    }

    doc.save(`Result_${className}_${type}.pdf`);
  };

  const columns = [
    { title: 'Pos', dataIndex: 'position', key: 'position', width: 60, sorter: (a, b) => a.position - b.position },
    { title: 'Roll No', dataIndex: 'roll_number', key: 'roll_number', sorter: (a, b) => a.roll_number - b.roll_number },
    { title: 'Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Total', dataIndex: 'totalMax', key: 'totalMax' },
    { title: 'Obtained', dataIndex: 'totalObtained', key: 'totalObtained', sorter: (a, b) => a.totalObtained - b.totalObtained, render: val => <strong>{val}</strong> },
    { title: '%', dataIndex: 'percentage', key: 'percentage', sorter: (a, b) => a.percentage - b.percentage, render: val => `${val}%` },
    {
      title: 'Grade', dataIndex: 'grade', key: 'grade', render: (grade) => (
        <span style={{ color: grade === 'F' ? 'red' : 'green', fontWeight: 'bold' }}>{grade}</span>
      )
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', render: (status) => (
        <span style={{
          color: status === 'PASS' ? 'green' : 'red',
          padding: '2px 8px',
          border: `1px solid ${status === 'PASS' ? 'green' : 'red'}`,
          borderRadius: 4,
          fontSize: 10
        }}>{status}</span>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back to Hub</Button>
      </Space>

      <Card title={<Title level={3} style={{ margin: 0 }}>Advanced Result Reporting</Title>} bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={6}>
            <label>Select Session</label>
            <Select style={{ width: '100%' }} placeholder="Select Session" onChange={setSelectedSession} value={selectedSession}>
              {sessions.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <label>Select Class</label>
            <Select style={{ width: '100%' }} placeholder="Select Class" onChange={setSelectedClass} value={selectedClass}>
              {classes.map(c => <Option key={c.id} value={c.id}>{c.name} - {c.section}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <label>Select Subject (For PDF Only)</label>
            <Select style={{ width: '100%' }} placeholder="Optional" allowClear onChange={setSelectedSubject} value={selectedSubject}>
              {subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<ReloadOutlined />} onClick={generateReport} loading={loading} block style={{ background: '#1d3557' }}>
              Generate Report
            </Button>
          </Col>
        </Row>
      </Card>

      {reportData.length > 0 && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}><Card><Statistic title="Total Students" value={stats.totalStudents} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="Passed" value={stats.passCount} valueStyle={{ color: 'green' }} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="Failed" value={stats.failCount} valueStyle={{ color: 'red' }} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="Class Average" value={stats.avgPercentage} suffix="%" /></Card></Col>
          </Row>

          <Card
            title={`Result Sheet: ${classes.find(c => c.id === selectedClass)?.name}`}
            extra={
              <Space>
                <Button icon={<DownloadOutlined />} onClick={() => downloadPDF('overall')}>Class PDF</Button>
                <Button icon={<PrinterOutlined />} onClick={() => downloadPDF('subject')} disabled={!selectedSubject}>Subject PDF</Button>
              </Space>
            }
          >
            <Table
              dataSource={reportData}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 50 }}
              size="small"
              bordered
              scroll={{ x: 600 }}
            />
          </Card>
        </>
      )}

    </div>
  );
};

export default ResultReport;
