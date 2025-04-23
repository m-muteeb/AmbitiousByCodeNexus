import React, { useEffect, useState } from "react";
import { fireStore } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Button, Card, Select, Spin } from "antd";
import "../assets/css/pdflist.css";

const { Option } = Select;

const PdfList = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredPdfs, setFilteredPdfs] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [classOptions, setClassOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);

  // Fetch all PDFs on load
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const snapshot = await getDocs(collection(fireStore, "institutionpdfs"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds); // Sort newest first
        setPdfs(data);
        setFilteredPdfs(data);

        // Extract unique classes
        const uniqueClasses = [...new Set(data.map(item => item.class))];
        setClassOptions(uniqueClasses);
      } catch (err) {
        console.error("Error fetching PDFs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, []);

  // Handle class change
  const handleClassChange = (value) => {
    setSelectedClass(value);
    setSelectedCategory(null);
    setSelectedTopic(null);

    const filtered = pdfs.filter(pdf => pdf.class === value);
    setCategoryOptions([...new Set(filtered.map(pdf => pdf.category))]);
    setFilteredPdfs(filtered);
  };

  // Handle category change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedTopic(null);

    const filtered = pdfs.filter(
      pdf => pdf.class === selectedClass && pdf.category === value
    );
    setTopicOptions([...new Set(filtered.map(pdf => pdf.topic))]);
    setFilteredPdfs(filtered);
  };

  // Handle topic change
  const handleTopicChange = (value) => {
    setSelectedTopic(value);
    const filtered = pdfs.filter(
      pdf => pdf.class === selectedClass &&
        pdf.category === selectedCategory &&
        pdf.topic === value
    );
    setFilteredPdfs(filtered);
  };

  return (
    <div className="pdf-list-container">
      <h1 className="title">PDF Library</h1>

      <div className="filters">
        <Select
          placeholder="Select Class"
          onChange={handleClassChange}
          value={selectedClass}
          style={{ width: 200, marginRight: 16 }}
        >
          {classOptions.map(cls => (
            <Option key={cls} value={cls}>{cls}</Option>
          ))}
        </Select>

        <Select
          placeholder="Select Category"
          onChange={handleCategoryChange}
          value={selectedCategory}
          disabled={!selectedClass}
          style={{ width: 200, marginRight: 16 }}
        >
          {categoryOptions.map(cat => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>

        <Select
          placeholder="Select Topic"
          onChange={handleTopicChange}
          value={selectedTopic}
          disabled={!selectedCategory}
          style={{ width: 200 }}
        >
          {topicOptions.map(topic => (
            <Option key={topic} value={topic}>{topic}</Option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spin size="large" />
      ) : (
        <div className="pdf-list">
          {filteredPdfs.map(pdf => (
            <Card key={pdf.id} className="pdf-card" bordered>
              <h3>{pdf.topic}</h3>
              <p><strong>Category:</strong> {pdf.category}</p>
              <p><strong>Description:</strong> {pdf.description}</p>
              <p><strong>Uploaded:</strong> {new Date(pdf.timestamp.seconds * 1000).toLocaleString()}</p>
              {pdf.fileUrls?.map((url, index) => (
                <div key={index} className="pdf-actions">
                  <Button type="link" onClick={() => window.open(url, "_blank")}>View</Button>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PdfList;
