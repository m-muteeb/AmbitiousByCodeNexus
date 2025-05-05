import React, { useState, useEffect, memo } from 'react';
import { collection, getDocs, orderBy, query, limit, where } from 'firebase/firestore';
import { fireStore } from '../config/firebase';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Spinner, Container } from 'react-bootstrap';
import '../assets/css/recentpost.css';

const RecentPosts = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(fireStore, 'topics'),
            where('isPaid', '==', false),
            orderBy('timestamp', 'desc'),
            limit(9)
          )
        );

        const posts = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const topic = data?.topic || 'Untitled';
          const fileUrls = Array.isArray(data.fileUrls) ? data.fileUrls : [];
          const timestamp = data.timestamp?.seconds ? new Date(data.timestamp.seconds * 1000) : null;

          return {
            topic,
            fileUrls,
            timestamp,
            topicId: doc.id,
          };
        });

        setRecentPosts(posts);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  if (loading) {
    return (
      <div className="loading-container text-center mt-3">
        <Spinner animation="border" size="lg" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="px-3 px-md-5 recent-posts-wrapper">
      <Row className="text-center recent-posts-section">
        <Col>
          <h2 className="recent-posts-heading mt-4">Recent Posts</h2>
        </Col>
      </Row>

      <Row className="justify-content-center g-4">
        {recentPosts.length > 0 ? (
          recentPosts.map((post) => {
            const firstFileRaw = post.fileUrls.length > 0 ? post.fileUrls[0] : null;
            const firstFileUrl = typeof firstFileRaw === 'string' ? firstFileRaw : firstFileRaw?.url;

            return (
              <Col key={post.topicId} xs={12} sm={6} md={4}>
                {firstFileUrl ? (
                  <Link
                    to={`/preview?url=${encodeURIComponent(firstFileUrl)}&title=${encodeURIComponent(post.topic)}`}
                    className="recent-post-link"
                  >
                    <Card className="recent-post-card h-100">
                      <Card.Body>
                        <h5 className="recent-post-title">{post.topic}</h5>
                        <p className="recent-post-date">
                          {post.timestamp ? post.timestamp.toLocaleDateString() : 'No date available'}
                        </p>
                      </Card.Body>
                    </Card>
                  </Link>
                ) : (
                  <Card className="recent-post-card disabled-card h-100">
                    <Card.Body>
                      <h5 className="recent-post-title">{post.topic}</h5>
                      <p className="recent-post-date">
                        {post.timestamp ? post.timestamp.toLocaleDateString() : 'No date available'}
                      </p>
                      <p className="text-muted">No file available</p>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            );
          })
        ) : (
          <Col xs={12} className="text-center">
            <p className="text-muted">No recent posts available.</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default memo(RecentPosts);












