import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Spin, Alert, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
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

    const handleSearch = async () => {
        if (!selectedSession || !selectedClass || !rollNumber.trim()) {
            message.warning('Please complete all selection fields');
            return;
        }

        setSearching(true);
        setError(null);
        setResultData(null);

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
            // Fetch ALL students in this class for this session to rank them
            let position = "N/A";
            try {
                // A. Get all students in this class
                const classStudents = await supabaseApi.fetch('result_students', `class_id=eq.${selectedClass}`);
                const classStudentIds = classStudents.map(s => s.id);

                if (classStudentIds.length > 0) {
                    // B. Get all marks for these students in this session
                    // Note: URL length limit might be hit if too many students. 
                    // Ideally use RPC, but for now client-side is okay for small schools.
                    // Optimization: Fetch marks filtering only by session_id, then filter by student_ids in JS if needed,
                    // OR assuming session_id filter is strong enough.
                    const allSessionMarks = await supabaseApi.fetch('result_marks', `session_id=eq.${selectedSession}`);

                    // Filter for only this class's students
                    const validMarks = allSessionMarks.filter(m => classStudentIds.includes(m.student_id));

                    // C. Aggregate Totals
                    const studentTotals = {};
                    validMarks.forEach(m => {
                        if (!studentTotals[m.student_id]) studentTotals[m.student_id] = 0;
                        studentTotals[m.student_id] += (m.obtained_marks || 0);
                    });

                    // D. Sort and Rank
                    const sortedTotals = Object.entries(studentTotals)
                        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA); // Descending

                    const myRankIndex = sortedTotals.findIndex(([id]) => id === student.id);
                    if (myRankIndex !== -1) {
                        const rank = myRankIndex + 1;
                        // Add ordinal suffix
                        const j = rank % 10,
                            k = rank % 100;
                        if (j == 1 && k != 11) {
                            position = rank + "st";
                        } else if (j == 2 && k != 12) {
                            position = rank + "nd";
                        } else if (j == 3 && k != 13) {
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

            // Scroll to top when result is displayed
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Search failure:', err);
            setError('System error while fetching results. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const handleReset = () => {
        setRollNumber('');
        setResultData(null);
        setError(null);
    };

    return (
        <div className="result-portal-container" style={{ width: '100%', padding: '20px 40px' }}>
            <div className="result-search-wrapper" style={{ width: '100%', margin: '0 auto' }}>

                {/* Minimalist Search Container - No Card, Just Clean Layout */}
                <div className="minimal-search-container">
                    <div className="result-portal-header" style={{ textAlign: 'center', marginBottom: 40 }}>
                        <h1 className="result-portal-title" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1d3557', marginBottom: 10, letterSpacing: '-0.5px' }}>
                            STUDENT RESULT PORTAL
                        </h1>
                        <p className="result-portal-subtitle" style={{ fontSize: '1rem', color: '#6c757d' }}>
                            Enter your details below to verify your academic performance
                        </p>
                    </div>

                    <div className="search-form">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginBottom: 30 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 10, fontWeight: 700, color: '#495057', fontSize: '0.9rem' }}>ACADEMIC SESSION</label>
                                <Select
                                    placeholder="Select Session"
                                    value={selectedSession}
                                    onChange={setSelectedSession}
                                    loading={loading}
                                    style={{ width: '100%', height: '50px' }}
                                    size="large"
                                    className="minimal-select"
                                >
                                    {sessions.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                </Select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 10, fontWeight: 700, color: '#495057', fontSize: '0.9rem' }}>CLASS & SECTION</label>
                                <Select
                                    placeholder="Select Class"
                                    value={selectedClass}
                                    onChange={setSelectedClass}
                                    loading={loading}
                                    style={{ width: '100%', height: '50px' }}
                                    size="large"
                                    className="minimal-select"
                                >
                                    {allClasses.map(c => <Option key={c.id} value={c.id}>{c.name} - {c.section}</Option>)}
                                </Select>
                            </div>
                        </div>

                        <div style={{ marginBottom: 40 }}>
                            <label style={{ display: 'block', marginBottom: 10, fontWeight: 700, color: '#495057', fontSize: '0.9rem' }}>ROLL NUMBER</label>
                            <Input
                                placeholder="Enter Roll Number"
                                value={rollNumber}
                                onChange={e => setRollNumber(e.target.value)}
                                size="large"
                                onPressEnter={handleSearch}
                                style={{ height: '50px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '1.1rem' }}
                            />
                        </div>

                        <div className="button-group" style={{ display: 'flex', gap: 15 }}>
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleSearch}
                                loading={searching}
                                size="large"
                                style={{ flex: 2, height: 55, borderRadius: 8, fontWeight: 700, background: '#1d3557', fontSize: '1rem' }}
                            >
                                VIEW RESULT
                            </Button>
                            <Button
                                onClick={handleReset}
                                size="large"
                                style={{ flex: 1, height: 55, borderRadius: 8, fontWeight: 600, color: '#6c757d', borderColor: '#ced4da' }}
                            >
                                CLEAR
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={loadInitialData}
                                size="large"
                                style={{ height: 55, borderRadius: 8, borderColor: '#ced4da' }}
                            />
                        </div>
                    </div>

                    {error && (
                        <Alert
                            message="Search Result"
                            description={error}
                            type="warning"
                            showIcon
                            style={{ marginTop: 30, borderRadius: 8 }}
                        />
                    )}
                </div>

                {searching && (
                    <div className="loading-container" style={{ textAlign: 'center', marginTop: 40 }}>
                        <Spin size="large" tip="Verifying credentials..." />
                    </div>
                )}

                {resultData && (
                    <div style={{ marginTop: 60 }}>
                        <ResultCard data={resultData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultSearch;
