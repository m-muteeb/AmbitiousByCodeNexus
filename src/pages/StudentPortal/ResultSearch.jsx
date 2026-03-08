import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Select, Spin, Alert, message, Card } from 'antd';
import { SearchOutlined, ArrowLeftOutlined, TrophyOutlined, ReadOutlined } from '@ant-design/icons';
import { supabaseApi } from '../../config/supabase';
import ResultCard from './ResultCard';
import './ResultPortal.css';

const { Option } = Select;

const ResultSearch = () => {
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [allClasses, setAllClasses] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [rollNumber, setRollNumber] = useState('');
    const [resultData, setResultData] = useState(null);
    const [error, setError] = useState(null);

    // Ref for scrolling to result
    const resultRef = useRef(null);
    // Ref for scrolling back to available results / top manually
    const topRef = useRef(null);

    // Initial load of sessions and classes
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Fetch all active sessions and all classes
            const [sessionData, classData] = await Promise.all([
                supabaseApi.fetch('result_sessions', 'is_active=eq.true&order=created_at.desc'),
                supabaseApi.fetch('result_classes', 'order=name')
            ]);

            setSessions(sessionData || []);
            setAllClasses(classData || []);

            if (sessionData?.length > 0) setSelectedSession(sessionData[0].id);
        } catch (err) {
            console.error('Error loading data:', err);
            message.error('Failed to load sessions/classes');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        // Prevent form submission defaults if triggered by form
        if (e && e.preventDefault) e.preventDefault();

        if (!selectedSession || !selectedClass || !rollNumber.trim()) {
            message.warning('Please complete all selection fields');
            return;
        }

        setSearching(true);
        setError(null);
        setResultData(null); // Clear previous result to force re-render

        try {
            // 1. Find Student in this class
            const students = await supabaseApi.fetch('result_students', `class_id=eq.${selectedClass}&roll_number=eq.${rollNumber.trim()}`);
            const student = students?.[0];

            if (!student) {
                setError('Student not found. Please verify the Class and Roll Number.');
                return;
            }

            // 2. Fetch Marks for this student in the selected Session
            const marks = await supabaseApi.fetch('result_marks', `student_id=eq.${student.id}&session_id=eq.${selectedSession}`);

            if (!marks || marks.length === 0) {
                setError('No marks found for this session yet.');
                return;
            }

            // 3. Fetch Subject metadata for these marks
            const subjectIds = marks.map(m => m.subject_id);
            const subjects = await supabaseApi.fetch('result_subjects', `id=in.(${subjectIds.join(',')})`);

            // 4. Combine and Format
            const enrichedMarks = marks.map(m => ({
                ...m,
                result_subjects: subjects.find(s => s.id === m.subject_id)
            }));

            const totalMax = enrichedMarks.reduce((sum, m) => sum + (m.result_subjects?.max_marks || 0), 0);
            const totalObtained = enrichedMarks.reduce((sum, m) => sum + (m.obtained_marks || 0), 0);
            const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

            // 5. CALCULATE POSITION (Rank)
            let position = "N/A";
            try {
                const classStudents = await supabaseApi.fetch('result_students', `class_id=eq.${selectedClass}`);
                const classStudentIds = classStudents.map(s => s.id);

                if (classStudentIds.length > 0) {
                    const allSessionMarks = await supabaseApi.fetch('result_marks', `session_id=eq.${selectedSession}`);
                    const validMarks = allSessionMarks.filter(m => classStudentIds.includes(m.student_id));
                    const studentTotals = {};
                    validMarks.forEach(m => {
                        if (!studentTotals[m.student_id]) studentTotals[m.student_id] = 0;
                        studentTotals[m.student_id] += (m.obtained_marks || 0);
                    });

                    const sortedTotals = Object.entries(studentTotals)
                        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

                    const myRankIndex = sortedTotals.findIndex(([id]) => id === student.id);
                    if (myRankIndex !== -1) {
                        const rank = myRankIndex + 1;
                        const j = rank % 10,
                            k = rank % 100;
                        if (j === 1 && k !== 11) {
                            position = rank + "st";
                        } else if (j === 2 && k !== 12) {
                            position = rank + "nd";
                        } else if (j === 3 && k !== 13) {
                            position = rank + "rd";
                        } else {
                            position = rank + "th";
                        }
                    }
                }
            } catch (rankErr) {
                console.error("Rank calculation error:", rankErr);
            }

            const sessionObj = sessions.find(s => s.id === selectedSession);
            const classObj = allClasses.find(c => c.id === selectedClass);

            const formattedData = {
                student: {
                    ...student,
                    result_classes: classObj
                },
                session: sessionObj || { name: 'Active Session' },
                marks: enrichedMarks,
                summary: {
                    total_max: totalMax,
                    total_obtained: totalObtained,
                    percentage: parseFloat(percentage),
                    position: position
                },
            };

            setResultData(formattedData);

            // MANUAL SCROLL Calculation for Mobile Reliability
            setTimeout(() => {
                if (resultRef.current) {
                    // Mobile fix: Scroll explicitly to the Y-coordinate with offset
                    // Offset handles sticky headers or padding
                    const yCoordinate = resultRef.current.getBoundingClientRect().top + window.scrollY - 100;

                    window.scrollTo({
                        top: yCoordinate,
                        behavior: 'smooth'
                    });
                }
            }, 300); // 300ms delay to ensure DOM paint

        } catch (err) {
            console.error('Search failure:', err);
            setError('System error while fetching results. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const handleReset = () => {
        setResultData(null);
        setError(null);
        setRollNumber('');

        // Manual scroll back to top
        setTimeout(() => {
            if (topRef.current) {
                const yCoordinate = topRef.current.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({
                    top: yCoordinate,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    const handleSessionSelect = (sessionId) => {
        setSelectedSession(sessionId);
        if (resultData) {
            setResultData(null);
            setError(null);
        }
    };

    return (
        <div className="result-portal-container" ref={topRef}>
            <div className="portal-grid">

                {/* --- SIDEBAR COLUMN --- */}
                <div className="side-results-card">
                    <div className="side-title">
                        <ReadOutlined /> AVAILABLE RESULTS
                    </div>

                    <div className="results-list">
                        {sessions.map((session, index) => (
                            <div
                                key={session.id}
                                onClick={() => handleSessionSelect(session.id)}
                                className={`result-list-item ${selectedSession === session.id ? 'active' : ''}`}
                            >
                                <div>
                                    <div className="result-item-title">{session.name}</div>
                                    <div className="result-item-meta">Click to Select</div>
                                </div>
                                {index === 0 && <span className="new-badge">NEW</span>}
                            </div>
                        ))}
                        {sessions.length === 0 && !loading && (
                            <div style={{ padding: '10px', color: '#999', fontSize: '0.9rem' }}>
                                No results published yet.
                            </div>
                        )}
                        {loading && (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <Spin size="small" />
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MAIN CONTENT COLUMN --- */}
                <div className="main-content-area">
                    <div className="main-header">
                        <div className="welcome-text">
                            <h1>STUDENT DASHBOARD</h1>
                            <p>Select a session and enter your details to view results.</p>
                        </div>
                    </div>

                    {/* ERROR ALERT */}
                    {error && (
                        <Alert
                            message="Search Failed"
                            description={error}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setError(null)}
                            style={{ marginBottom: 25, borderRadius: 8 }}
                        />
                    )}

                    {/* SEARCH FORM (ALWAYS VISIBLE) */}
                    <div className="search-card">
                        <div className="search-card-header">
                            <h2><TrophyOutlined style={{ marginRight: 8, color: '#e63946' }} />Find Your Result</h2>
                            <p>Please enter your Class and Roll number below</p>
                        </div>

                        <div className="search-grid">
                            <div className="search-full-width">
                                <label className="form-label">Selected Session</label>
                                <Select
                                    placeholder="Select Results Session"
                                    value={selectedSession}
                                    onChange={handleSessionSelect}
                                    loading={loading}
                                    style={{ width: '100%' }}
                                    className="custom-select"
                                >
                                    {sessions.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                </Select>
                            </div>

                            <div>
                                <label className="form-label">Class</label>
                                <Select
                                    placeholder="Select Class"
                                    value={selectedClass}
                                    onChange={setSelectedClass}
                                    loading={loading}
                                    style={{ width: '100%' }}
                                >
                                    {allClasses.map(c => <Option key={c.id} value={c.id}>{c.name} - {c.section}</Option>)}
                                </Select>
                            </div>

                            <div>
                                <label className="form-label">Roll Number</label>
                                <Input
                                    placeholder="Roll #"
                                    value={rollNumber}
                                    onChange={e => setRollNumber(e.target.value)}
                                    onPressEnter={handleSearch}
                                />
                            </div>
                        </div>

                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            loading={searching}
                            block
                            size="large"
                        >
                            VIEW RESULT
                        </Button>
                    </div>

                    {/* RESULT DISPLAY AREA (BELOW FORM) */}
                    {searching && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '40px 0' }}>
                            <Spin size="large" tip="Processing Result..." />
                        </div>
                    )}

                    {resultData && !searching && (
                        <div className="result-display-area" ref={resultRef} style={{ marginTop: 40, borderTop: '1px solid #eee', paddingTop: 40 }}>
                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <h2 style={{ color: '#1d3557', marginBottom: 5 }}>Result For {resultData.student.name}</h2>
                                <p style={{ color: '#666' }}>{resultData.session.name}</p>
                            </div>
                            <ResultCard data={resultData} />

                            <div style={{ textAlign: 'center', marginTop: 30 }}>
                                <Button onClick={handleReset} size="large" danger>Clear & Search Again</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultSearch;
