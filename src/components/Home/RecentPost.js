import React, { useState, useEffect } from "react";
import { List, Card, Empty } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { supabaseApi } from "../../config/supabase";

const RecentPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRecentPosts();
    }, []);

    const fetchRecentPosts = async () => {
        setLoading(true);
        try {
            // Fetch top 5 recent topics with all necessary fields for navigation
            const data = await supabaseApi.fetch('topics', 'select=title,created_at,class_level,subject,category&order=created_at.desc&limit=5');
            setPosts(data || []);
        } catch (error) {
            console.error("Failed to fetch recent posts:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Recent Posts" bordered={false} style={{ margin: '20px 0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {posts.length > 0 ? (
                <List
                    loading={loading}
                    itemLayout="horizontal"
                    dataSource={posts}
                    renderItem={(item) => (
                        <List.Item
                            className="clickable-post-item"
                            onClick={() => window.location.href = `/notes/${item.class_level}/${item.subject}/${item.category}`}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1faee'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            style={{
                                cursor: 'pointer',
                                padding: '15px',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <List.Item.Meta
                                avatar={<FilePdfOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />}
                                title={
                                    <span style={{ color: '#1d3557', fontWeight: 600 }}>
                                        {item.title}
                                    </span>
                                }
                                description={
                                    <span>
                                        Uploaded on {new Date(item.created_at).toLocaleDateString()} •
                                        <span style={{ color: '#457b9d', marginLeft: 5 }}>{item.class_level?.replace('-', ' ').toUpperCase()}</span>
                                    </span>
                                }
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <Empty description="No recent posts available" />
            )}
        </Card>
    );
};

export default RecentPosts;
