import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fireStore } from "../../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../../assets/css/notes.css";

const subjects = [
  "urdu",
  "english",
  "math",
  "islamiyat",
  "biology",
  "physics",
  "chemistry",
  "computer",
  "tarjma tul Quran",
  "pak Studies",
];



// const contentTypes = [
//   { label: "📖 Book Lessons", value: "book-lessons" },
//   { label: "📝 MCQs", value: "mcqs" },
//   { label: "📜 Past Papers", value: "past-papers" },
//   { label: "📜 Kamiyab Series", value: "Kamiyab-Series" },
// ];

const Notes = () => {
  const { selectedClass, subject, contentType } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState({});
  const [loading, setLoading] = useState(false);
  const [openSubjectId, setOpenSubjectId] = useState(null);
  const [activeContentType, setActiveContentType] = useState(contentType);
  const [contentTypes, setContentTypes] = useState([]);

   useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  // Sync state with URL
  useEffect(() => {
    if (subject) {
      const subjectId = subjects.findIndex(
        (s) => s.toLowerCase() === subject.toLowerCase()
      );
      setOpenSubjectId(subjectId >= 0 ? subjectId : null);
    }
    if (contentType && subject) {
      setActiveContentType(contentType);
      fetchTopics(subject, contentType);
    }

    
  }, [subject, contentType, selectedClass]);

  useEffect(() => {
    const fetchContentTypes = async () => {
      try {
        const q = query(collection(fireStore, "contentTypes"));
        const snapshot = await getDocs(q);
        const types = snapshot.docs.map((doc) => doc.data());
        setContentTypes(types);
      } catch (error) {
        console.error("Error fetching content types:", error);
      }
    };

    fetchContentTypes();
  }
  , []);
  const fetchTopics = async (subject, contentType) => {
    setLoading(true);
    try {
      console.log(
        "Fetching topics for subject:",
        subject,
        "and contentType:",
        contentType
      );
      const q = query(
        collection(fireStore, "topics"),
        where("class", "==", selectedClass),
        where("subject", "==", subject.trim().toLowerCase()),
        where("contentType", "==", contentType.trim().toLowerCase())
      );

      console.log("Fetching topics with query:", q);
      console.log("Selected Class:", selectedClass);
      console.log("Subject (raw):", subject);
      console.log("Subject (trimmed):", subject.trim().toLowerCase());
      console.log("Content Type (raw):", contentType);
      console.log("Content Type (trimmed):", contentType.trim().toLowerCase());

      const snapshot = await getDocs(q);
      const topicData = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.topic) topicData[data.topic] = data.fileUrls || [];
      });
      console.log("Fetched topics:", topicData);
      setTopics(topicData);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
    setLoading(false);
  };

  const handleSubjectClick = (subjectName, index) => {
    console.log(
      "Current openSubjectId:",
      openSubjectId,
      "Clicked index:",
      index
    );
    const newOpenId = openSubjectId === index ? null : index;
    console.log("Setting new openSubjectId:", newOpenId);

    setOpenSubjectId(newOpenId);

    if (newOpenId !== null) {
      navigate(`/notes/${selectedClass}/${subjectName.toLowerCase()}`);
    } else {
      navigate(`/notes/${selectedClass}`);
    }

    if (openSubjectId !== index) {
      setActiveContentType(null);
      setTopics({});
    }
  };

  const handleContentTypeClick = (subjectName, type) => {
    setActiveContentType(type);
    navigate(`/notes/${selectedClass}/${subjectName.toLowerCase()}/${type}`);
    fetchTopics(subjectName, type);
  };

 
  
  const handleTopicClick = (topicName) => {
    const fileData = topics[topicName]?.[0];
  
    const fileUrl = typeof fileData === "string"
      ? fileData // case 1: raw URL string
      : fileData?.url; // case 2: object with a 'url' field
  
    if (fileUrl) {
      navigate(`/preview?url=${encodeURIComponent(fileUrl)}`);
    } else {
      console.warn("No valid file URL found for topic:", topicName);
    }
  };

  
  

  return (
    <div className="notes-container">
      <main>
        <h2>Welcome to Our Educational Portal</h2>
        <p className="intro-text text-center py-3 fw-bold">
          Our goal is to provide high-quality educational resources.
        </p>

        <div className="subjects-grid">
          {subjects.map((subjectName, index) => (
            <div
              key={index}
              className={`subject-card ${
                openSubjectId === index ? "active" : ""
              }`}
              data-testid={`subject-card-${index}`}
            >
              <div
                className="subject-header"
                onClick={() => handleSubjectClick(subjectName, index)}
              >
                <span>{subjectName}</span>
                <span>{openSubjectId === index ? "▼" : "►"}</span>
              </div>

              <div
                className={`dropdown-container ${
                  openSubjectId === index ? "visible" : ""
                }`}
              >
                <div className="dropdown-content">
                  {contentTypes.map(({ label, value }) => (
                    <div key={value}>
                      <div
                        className={`content-type ${
                          activeContentType === value ? "active" : ""
                        }`}
                        onClick={() =>
                          handleContentTypeClick(subjectName, value)
                        }
                      >
                        {label}
                      </div>

                      {activeContentType === value && (
                        <div className="topics-list">
                          {loading ? (
                            <div className="loading">Loading...</div>
                          ) : Object.keys(topics).length > 0 ? (
                            Object.keys(topics).map((topicName, i) => (
                              <div
                                key={i}
                                className="topic-item"
                                onClick={() => handleTopicClick(topicName)}
                              >
                                📌 {topicName}
                              </div>
                            ))
                          ) : (
                            <div className="no-topics">No topics available</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Notes;

