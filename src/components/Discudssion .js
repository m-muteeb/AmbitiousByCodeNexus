import React, { useState, useEffect } from 'react';
import { FaImage, FaReply, FaTimes, FaThumbsUp, FaEye, FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { message, Modal, Input, Button, Card, Avatar, Dropdown, Menu, Popconfirm, Spin } from 'antd';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  query,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { discussionDb, discussionAuth } from '../config/discussionfirebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../assets/css/discussionfourm.css';

const { TextArea } = Input;

const DiscussionForum = () => {
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('');
  const [image, setImage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [user, setUser] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [editingItem, setEditingItem] = useState({ id: null, type: null, content: '' });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const navigate = useNavigate();

  // 🔐 Protect route
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(discussionAuth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/discussionlogin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Real-time fetch questions with likes
  useEffect(() => {
    setLoadingQuestions(true);
    const q = query(
      collection(discussionDb, 'questions'),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const questionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestions(questionsData);
        setLoadingQuestions(false);
      },
      (error) => {
        console.error("Error fetching questions:", error);
        message.error('Error loading questions');
        setLoadingQuestions(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Submit new question
  const submitQuestion = async () => {
    if (!user) {
      message.error('You must be logged in to post a question');
      return;
    }
    if (!question || !topic) {
      message.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const newQuestion = {
        question,
        name: user.displayName || user.email,
        email: user.email,
        userId: user.uid,
        topic,
        replies: [],
        likes: [],
        image: image || null,
        timestamp: new Date(),
      };

      await addDoc(collection(discussionDb, 'questions'), newQuestion);
      setQuestion('');
      setTopic('');
      setImage(null);
      message.success('Your question has been posted!');
    } catch (e) {
      console.error(e);
      message.error('Error posting question');
    } finally {
      setLoading(false);
    }
  };

  // Submit reply
  const submitReply = async () => {
    if (!user) {
      message.error('You must be logged in to reply');
      return;
    }
    if (!replyText) {
      message.error('Please write a reply before submitting.');
      return;
    }
    setLoadingReply(true);
    try {
      const newReply = {
        reply: replyText,
        name: user.displayName || user.email,
        email: user.email,
        userId: user.uid,
        likes: [],
        image: image || null,
        timestamp: new Date(),
      };

      const questionRef = doc(discussionDb, 'questions', currentQuestionId);
      const questionToUpdate = questions.find((q) => q.id === currentQuestionId);

      await updateDoc(questionRef, {
        replies: [...(questionToUpdate.replies || []), newReply],
      });

      setModalVisible(false);
      setReplyText('');
      setImage(null);
      message.success('Reply posted!');
    } catch (e) {
      console.error(e);
      message.error('Error posting reply');
    } finally {
      setLoadingReply(false);
    }
  };

  // Like / Unlike Question
  const toggleLikeQuestion = async (questionId) => {
    if (!user) {
      message.error('You must be logged in to like');
      return;
    }
    try {
      const questionRef = doc(discussionDb, 'questions', questionId);
      const qToUpdate = questions.find((q) => q.id === questionId);
      const hasLiked = qToUpdate.likes.includes(user.uid);

      const updatedLikes = hasLiked
        ? qToUpdate.likes.filter((uid) => uid !== user.uid)
        : [...qToUpdate.likes, user.uid];

      await updateDoc(questionRef, { likes: updatedLikes });
    } catch (e) {
      console.error(e);
      message.error('Error updating like');
    }
  };

  // Like / Unlike Reply
  const toggleLikeReply = async (questionId, replyIndex) => {
    if (!user) {
      message.error('You must be logged in to like');
      return;
    }
    try {
      const questionRef = doc(discussionDb, 'questions', questionId);
      const qToUpdate = questions.find((q) => q.id === questionId);

      const repliesCopy = [...(qToUpdate.replies || [])];
      const reply = repliesCopy[replyIndex];
      const hasLiked = reply.likes.includes(user.uid);

      repliesCopy[replyIndex] = {
        ...reply,
        likes: hasLiked
          ? reply.likes.filter((uid) => uid !== user.uid)
          : [...reply.likes, user.uid],
      };

      await updateDoc(questionRef, { replies: repliesCopy });
    } catch (e) {
      console.error(e);
      message.error('Error updating like');
    }
  };

  // Delete question
  const deleteQuestion = async (questionId) => {
    try {
      await deleteDoc(doc(discussionDb, 'questions', questionId));
      message.success('Question deleted successfully');
    } catch (e) {
      console.error(e);
      message.error('Error deleting question');
    }
  };

  // Delete reply
  const deleteReply = async (questionId, replyIndex) => {
    try {
      const questionRef = doc(discussionDb, 'questions', questionId);
      const qToUpdate = questions.find((q) => q.id === questionId);
      
      const updatedReplies = [...qToUpdate.replies];
      updatedReplies.splice(replyIndex, 1);
      
      await updateDoc(questionRef, { replies: updatedReplies });
      message.success('Reply deleted successfully');
    } catch (e) {
      console.error(e);
      message.error('Error deleting reply');
    }
  };

  // Edit question or reply
  const startEditing = (id, type, content, questionId = null) => {
    setEditingItem({ id, type, content, questionId });
    setEditModalVisible(true);
  };

  const submitEdit = async () => {
    try {
      if (editingItem.type === 'question') {
        const questionRef = doc(discussionDb, 'questions', editingItem.id);
        await updateDoc(questionRef, { question: editingItem.content });
        message.success('Question updated successfully');
      } else if (editingItem.type === 'reply') {
        const questionRef = doc(discussionDb, 'questions', editingItem.questionId);
        const qToUpdate = questions.find((q) => q.id === editingItem.questionId);
        
        const updatedReplies = qToUpdate.replies.map((reply, index) => 
          index === editingItem.id ? { ...reply, reply: editingItem.content } : reply
        );
        
        await updateDoc(questionRef, { replies: updatedReplies });
        message.success('Reply updated successfully');
      }
      
      setEditModalVisible(false);
      setEditingItem({ id: null, type: null, content: '' });
    } catch (e) {
      console.error(e);
      message.error('Error updating content');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        message.error('File size must be less than 5MB');
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = () => setImage(null);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    try {
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const filteredQuestions =
    activeTab === 'all'
      ? questions
      : questions.filter(
          (q) => q.topic && q.topic.toLowerCase() === activeTab.toLowerCase()
        );

  const uniqueTopics = [...new Set(questions.map((q) => q.topic).filter(Boolean))];

  return (
    <div className="discussion-forum-container mt-5">
      <div className="forum-content">
        <div className="forum-header">
          <h1 className="forum-title mt-4">Ambitious Discussion Forum</h1>
          <p className="forum-description">
            Ask questions, share knowledge, and grow together with our community!
          </p>
          <div className="auth-section">
            {user && (
              <>
                <span>Welcome, {user.displayName || user.email}</span>
                <Button
                  type="link"
                  onClick={() => {
                    signOut(discussionAuth);
                    message.success('Logged out successfully');
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="forum-layout">
          <div className="forum-main">
            {/* Ask Question */}
            <Card className="ask-question-card" id="ask-question">
              <h2>Ask a New Question</h2>
              <Input
                placeholder="Topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="form-input"
              />
              <TextArea
                placeholder="Write your question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="form-textarea"
                rows={4}
              />
              <div className="upload-section">
                <label htmlFor="question-image" className="upload-btn">
                  <FaImage /> {image ? 'Change Image' : 'Upload Image'}
                </label>
                <input
                  type="file"
                  id="question-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                {image && (
                  <div className="image-preview">
                    <img
                      src={image}
                      alt="Preview"
                      style={{ width: 200, height: 200, objectFit: 'cover' }}
                    />
                    <div className="preview-actions">
                      <Button
                        type="link"
                        icon={<FaEye />}
                        onClick={() => setViewImage(image)}
                      >
                        View
                      </Button>
                      <button onClick={removeImage} className="remove-image">
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                )}
                <Button
                  type="primary"
                  onClick={submitQuestion}
                  loading={loading}
                  className="submit-button"
                  size="large"
                >
                  Post Question
                </Button>
              </div>
            </Card>

            {/* Filter Tabs */}
            <div className="questions-filter">
              <Button
                type={activeTab === 'all' ? 'primary' : 'default'}
                onClick={() => setActiveTab('all')}
              >
                All Questions
              </Button>
              {uniqueTopics.map((topic) => (
                <Button
                  key={topic}
                  type={activeTab === topic ? 'primary' : 'default'}
                  onClick={() => setActiveTab(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>

            {/* Questions List with Loading State */}
            <div className="questions-list">
              {loadingQuestions ? (
                <div className="loading-container">
                  <Spin size="large" />
                  <p>Loading questions...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="empty-state">
                  <h3>No questions yet</h3>
                  <p>Be the first to ask a question!</p>
                </div>
              ) : (
                filteredQuestions.map((item) => (
                  <Card key={item.id} className="question-card">
                    <div className="question-header">
                      <div className="user-info">
                        <Avatar>{item.name ? item.name[0].toUpperCase() : 'U'}</Avatar>
                        <div className="user-details">
                          <h3>{item.name || 'Unknown User'}</h3>
                          <span className="post-time">{formatDate(item.timestamp)}</span>
                        </div>
                      </div>
                      
                      <div className="question-actions-header">
                        {item.topic && <span className="topic-tag">{item.topic}</span>}
                        
                        {user && user.uid === item.userId && (
                          <Dropdown
                            overlay={
                              <Menu>
                                <Menu.Item 
                                  key="edit" 
                                  onClick={() => startEditing(item.id, 'question', item.question)}
                                >
                                  <FaEdit /> Edit
                                </Menu.Item>
                                <Menu.Item key="delete">
                                  <Popconfirm
                                    title="Are you sure you want to delete this question?"
                                    onConfirm={() => deleteQuestion(item.id)}
                                    okText="Yes"
                                    cancelText="No"
                                  >
                                    <span><FaTrash /> Delete</span>
                                  </Popconfirm>
                                </Menu.Item>
                              </Menu>
                            }
                            trigger={['click']}
                          >
                            <Button type="text" icon={<FaEllipsisV />} />
                          </Dropdown>
                        )}
                      </div>
                    </div>

                    <p className="question-text">{item.question}</p>

                    {item.image && (
                      <div className="question-image">
                        <img
                          src={item.image}
                          alt="question attachment"
                          style={{ width: 200, height: 200, objectFit: 'cover' }}
                        />
                        <Button
                          type="link"
                          icon={<FaEye />}
                          onClick={() => setViewImage(item.image)}
                        >
                          View
                        </Button>
                      </div>
                    )}

                    <div className="question-actions">
                      <Button
                        type="text"
                        icon={<FaThumbsUp 
                          color={item.likes?.includes(user?.uid) ? '#1890ff' : undefined} 
                        />}
                        onClick={() => toggleLikeQuestion(item.id)}
                      >
                        {item.likes?.length || 0} Likes
                      </Button>
                      <Button
                        type="text"
                        onClick={() =>
                          setExpandedQuestion(
                            expandedQuestion === item.id ? null : item.id
                          )
                        }
                      >
                        {expandedQuestion === item.id
                          ? 'Hide Replies'
                          : `Show Replies (${item.replies?.length || 0})`}
                      </Button>
                      <Button
                        type="text"
                        icon={<FaReply />}
                        onClick={() => {
                          setCurrentQuestionId(item.id);
                          setModalVisible(true);
                        }}
                      >
                        Reply
                      </Button>
                    </div>

                    {/* Replies */}
                    {expandedQuestion === item.id && item.replies?.length > 0 && (
                      <div className="replies-container">
                        <h4>Replies:</h4>
                        {item.replies.map((reply, idx) => (
                          <div key={idx} className="reply-card">
                            <div className="reply-header">
                              <div className="user-info">
                                <Avatar>{reply.name ? reply.name[0].toUpperCase() : 'U'}</Avatar>
                                <div className="user-details">
                                  <strong>{reply.name}</strong>
                                  <span>{formatDate(reply.timestamp)}</span>
                                </div>
                              </div>
                              
                              {user && user.uid === reply.userId && (
                                <Dropdown
                                  overlay={
                                    <Menu>
                                      <Menu.Item 
                                        key="edit" 
                                        onClick={() => startEditing(idx, 'reply', reply.reply, item.id)}
                                      >
                                        <FaEdit /> Edit
                                      </Menu.Item>
                                      <Menu.Item key="delete">
                                        <Popconfirm
                                          title="Are you sure you want to delete this reply?"
                                          onConfirm={() => deleteReply(item.id, idx)}
                                          okText="Yes"
                                          cancelText="No"
                                        >
                                          <span><FaTrash /> Delete</span>
                                        </Popconfirm>
                                      </Menu.Item>
                                    </Menu>
                                  }
                                  trigger={['click']}
                                >
                                  <Button type="text" icon={<FaEllipsisV />} size="small" />
                                </Dropdown>
                              )}
                            </div>
                            
                            <p className="reply-text">{reply.reply}</p>
                            
                            <div className="reply-actions">
                              <Button
                                type="text"
                                icon={<FaThumbsUp 
                                  color={reply.likes?.includes(user?.uid) ? '#1890ff' : undefined} 
                                />}
                                onClick={() => toggleLikeReply(item.id, idx)}
                              >
                                {reply.likes?.length || 0} Likes
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Reply Modal */}
        <Modal
          title="Post a Reply"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <TextArea
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={4}
          />
          <Button
            type="primary"
            onClick={submitReply}
            loading={loadingReply}
            className="submit-button"
            size="large"
            style={{ marginTop: '16px' }}
          >
            Post Reply
          </Button>
        </Modal>

        {/* Edit Modal */}
        <Modal
          title={`Edit ${editingItem.type}`}
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setEditModalVisible(false)}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={submitEdit}>
              Save Changes
            </Button>,
          ]}
        >
          <TextArea
            value={editingItem.content}
            onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
            rows={6}
          />
        </Modal>

        {/* View Full Image Modal */}
        <Modal
          open={!!viewImage}
          onCancel={() => setViewImage(null)}
          footer={null}
          centered
        >
          {viewImage && (
            <img
              src={viewImage}
              alt="Full view"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default DiscussionForum;