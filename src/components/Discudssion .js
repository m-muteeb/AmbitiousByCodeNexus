import React, { useState, useEffect } from 'react';
import { Card, Button, Avatar, Input, List, Tooltip, message, Popconfirm, Tag, Dropdown, Menu } from 'antd';
import { UserOutlined, LikeOutlined, LikeFilled, MessageOutlined, EllipsisOutlined, SendOutlined } from '@ant-design/icons';
// import { portalSupabase } from '../config/portal_supabase/portal_supabase_client'; // Removed
import moment from 'moment';
import CustomAuth from './DiscussionAuth';

const { TextArea } = Input;

const Discussion = () => {
  const [user, setUser] = useState({ id: 'mock-id', user_metadata: { full_name: 'Mock User' } }); // Mock User
  const [questions, setQuestions] = useState([
    {
      id: 1,
      content: 'How do I solve this physics problem?',
      user_name: 'Student A',
      created_at: new Date().toISOString(),
      likes: [],
      replies: [
        { id: 101, content: 'Use Newton\'s second law.', user_name: 'Teacher B', created_at: new Date().toISOString(), likes: [] }
      ]
    }
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Mock Handlers
  const handlePostQuestion = () => {
    if (!newQuestion.trim()) return;
    const newQ = {
      id: Date.now(),
      content: newQuestion,
      user_name: 'Mock User',
      created_at: new Date().toISOString(),
      likes: [],
      replies: []
    };
    setQuestions([newQ, ...questions]);
    setNewQuestion("");
    message.success("Question posted (Mock)");
  };

  const toggleLike = (id) => message.success("Liked (Mock)");

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      {/* Input Area */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Avatar icon={<UserOutlined />} src={null} />
          <div style={{ flex: 1 }}>
            <TextArea
              rows={2}
              placeholder="Ask a question..."
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
            />
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<SendOutlined />} onClick={handlePostQuestion}>Post</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Questions List */}
      <List
        itemLayout="vertical"
        dataSource={questions}
        renderItem={item => (
          <Card style={{ marginBottom: 16 }} className="question-card">
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{item.user_name[0]}</Avatar>}
                title={<b>{item.user_name}</b>}
                description={moment(item.created_at).fromNow()}
              />
              <p>{item.content}</p>

              <div style={{ display: 'flex', gap: 16, color: '#666' }}>
                <span onClick={() => toggleLike(item.id)} style={{ cursor: 'pointer' }}>
                  <LikeOutlined /> {item.likes.length} Likes
                </span>
                <span><MessageOutlined /> {item.replies.length} Replies</span>
              </div>

              {/* Replies Section (Simplified) */}
              {item.replies.length > 0 && (
                <div style={{ marginTop: 16, background: '#f5f5f5', padding: 10, borderRadius: 8 }}>
                  {item.replies.map(reply => (
                    <div key={reply.id} style={{ marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 'bold' }}>{reply.user_name}</div>
                      <div>{reply.content}</div>
                    </div>
                  ))}
                </div>
              )}

            </List.Item>
          </Card>
        )}
      />

      <CustomAuth visible={isAuthModalVisible} onClose={() => setIsAuthModalVisible(false)} mode={authMode} />
    </div>
  );
};

export default Discussion;