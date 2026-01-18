// Direct API test - bypassing supabase-js library
import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Space, Typography, Table, Input, message } from 'antd';

const { Title, Text } = Typography;

const SUPABASE_URL = 'https://cjzxfilklerlhyysrgye.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqenhmaWxrbGVybGh5eXNyZ3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTE4ODgsImV4cCI6MjA4NDE2Nzg4OH0.j0Iq1Lnv6HUg1P-Xvtsvu0sZ0APCGSw17ABdHWu3JGU';

const TestSupabase = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [testName, setTestName] = useState('Direct Test ' + Date.now());
    const [fetchResult, setFetchResult] = useState(null);
    const [insertResult, setInsertResult] = useState(null);

    // Test 1: Direct fetch to get sessions
    const testFetchSessions = async () => {
        setLoading(true);
        setFetchResult(null);
        console.log('=== DIRECT FETCH TEST ===');

        try {
            const url = `${SUPABASE_URL}/rest/v1/result_sessions?select=*&order=created_at.desc`;
            console.log('Fetching from:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const data = await response.json();
            console.log('Response data:', data);

            setFetchResult({ status: response.status, data });
            setSessions(data);
            message.success('Fetch successful!');
        } catch (error) {
            console.error('Fetch error:', error);
            setFetchResult({ error: error.message });
            message.error('Fetch failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Test 2: Direct fetch to insert session
    const testInsertSession = async () => {
        setLoading(true);
        setInsertResult(null);
        console.log('=== DIRECT INSERT TEST ===');

        try {
            const url = `${SUPABASE_URL}/rest/v1/result_sessions`;
            const body = JSON.stringify({
                name: testName,
                is_active: true,
            });

            console.log('Posting to:', url);
            console.log('Body:', body);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation',
                },
                body: body,
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const text = await response.text();
            console.log('Response text:', text);

            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

            setInsertResult({ status: response.status, data });

            if (response.ok) {
                message.success('Insert successful!');
                testFetchSessions(); // Refresh list
            } else {
                message.error('Insert failed: ' + response.status);
            }
        } catch (error) {
            console.error('Insert error:', error);
            setInsertResult({ error: error.message });
            message.error('Insert failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', ellipsis: true, width: 280 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Active', dataIndex: 'is_active', key: 'is_active', render: v => v ? 'Yes' : 'No' },
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2}>🧪 Direct API Test (bypassing supabase-js)</Title>
            <Text type="secondary">This tests the Supabase REST API directly using fetch()</Text>

            <Card title="Test 1: Fetch Sessions" style={{ marginTop: 16, marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                        type="primary"
                        onClick={testFetchSessions}
                        loading={loading}
                    >
                        Fetch Sessions (Direct API)
                    </Button>
                    {fetchResult && (
                        <Alert
                            type={fetchResult.error ? 'error' : 'success'}
                            message={fetchResult.error ? 'Error' : `Status: ${fetchResult.status}`}
                            description={
                                <pre style={{ fontSize: 11, maxHeight: 200, overflow: 'auto', margin: 0 }}>
                                    {JSON.stringify(fetchResult, null, 2)}
                                </pre>
                            }
                        />
                    )}
                    <Table
                        dataSource={sessions}
                        columns={columns}
                        rowKey="id"
                        size="small"
                        pagination={false}
                    />
                </Space>
            </Card>

            <Card title="Test 2: Insert Session" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                        value={testName}
                        onChange={e => setTestName(e.target.value)}
                        placeholder="Session name"
                        style={{ width: 300 }}
                    />
                    <Button
                        type="primary"
                        onClick={testInsertSession}
                        loading={loading}
                    >
                        Insert Session (Direct API)
                    </Button>
                    {insertResult && (
                        <Alert
                            type={insertResult.error ? 'error' : (insertResult.status < 300 ? 'success' : 'warning')}
                            message={insertResult.error ? 'Error' : `Status: ${insertResult.status}`}
                            description={
                                <pre style={{ fontSize: 11, maxHeight: 200, overflow: 'auto', margin: 0 }}>
                                    {JSON.stringify(insertResult, null, 2)}
                                </pre>
                            }
                        />
                    )}
                </Space>
            </Card>

            <Card title="Debug Info">
                <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 16, overflow: 'auto' }}>
                    {`Supabase URL: ${SUPABASE_URL}
API Key (first 50 chars): ${SUPABASE_ANON_KEY.substring(0, 50)}...

Check browser console (F12) for detailed logs!
Check Network tab to see if requests are being made.`}
                </pre>
            </Card>
        </div>
    );
};

export default TestSupabase;
