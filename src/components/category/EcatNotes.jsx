// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { fireStore } from "../../config/firebase";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import "../../assets/css/notes.css";

// const EcatNotes = () => {
//   const { selectedClass, subject, ecatContentType } = useParams();
//   console.log("Selected Class:", selectedClass);
//   console.log("Subject:", subject); 
//   console.log("ECAT Content Type:", ecatContentType);
//   const navigate = useNavigate();

//   // Resolve subject: default to "entry-test" if selectedClass is "ecat"
//   const actualSubject = subject || (selectedClass === "ecat" ? "entry-test" : undefined);

//   const [topics, setTopics] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [activeContentType, setActiveContentType] = useState(ecatContentType);
//   const [ecatContentTypes, setEcatContentTypes] = useState([]);
//   const [isCardOpen, setIsCardOpen] = useState(true);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   // Redirect to /ecat/entry-test if user opens just /ecat
//   useEffect(() => {
//     if (selectedClass === "ecat" && !subject) {
//       navigate(`/ecat/entry-test`);
//     }
//   }, [selectedClass, subject, navigate]);

//   // Fetch topics when content type changes
//   useEffect(() => {
//     if (actualSubject !== "entry-test") return;

//     if (ecatContentType) {
//       setActiveContentType(ecatContentType);
//       fetchTopics(ecatContentType);
//     }
//   }, [actualSubject, ecatContentType, selectedClass]);

//   // Fetch content types from Firestore
//   useEffect(() => {
//     const fetchEcatContentTypes = async () => {
//       try {
//         const q = query(collection(fireStore, "ecatContentTypes"));
//         const snapshot = await getDocs(q);
//         const types = snapshot.docs.map((doc) => doc.data());
//         setEcatContentTypes(types);
//       } catch (error) {
//         console.error("Error fetching ECAT content types:", error);
//       }
//     };

//     if (actualSubject === "entry-test") {
//       fetchEcatContentTypes();
//     }
//   }, [actualSubject]);

//   const fetchTopics = async (type) => {
//     setLoading(true);
//     try {
//       const q = query(
//         collection(fireStore, "topics"),
//         where("class", "==", selectedClass),
//         where("subject", "==", "entry-test"),
//         where("ecatContentType", "==", type.trim().toLowerCase())
//       );
//       console.log("Fetching topics with query:", q);

//       const snapshot = await getDocs(q);
//       const topicData = {};
//       snapshot.forEach((doc) => {
//         const data = doc.data();
//         if (data.topic) topicData[data.topic] = data.fileUrls || [];
//       });

//       setTopics(topicData);
//     } catch (error) {
//       console.error("Error fetching ECAT topics:", error);
//     }
//     setLoading(false);
//   };

//   const handleContentTypeClick = (type) => {
//     setActiveContentType(type);
//     navigate(`/ecat/entry-test/${type}`);
//     fetchTopics(type);
//   };

//   const handleTopicClick = (topicName) => {
//     const fileData = topics[topicName]?.[0];
//     let fileUrl = "";

//     if (typeof fileData === "string") {
//       fileUrl = fileData;
//     } else if (fileData && typeof fileData === "object") {
//       fileUrl = fileData.url || fileData.fileUrl || "";
//     }

//     if (fileUrl) {
//       navigate(`/preview?url=${encodeURIComponent(fileUrl)}`);
//     } else {
//       console.warn("No valid file URL found for topic:", topicName);
//     }
//   };

//   if (actualSubject !== "entry-test") {
//     return <h2 className="text-center py-4">Subject not supported here</h2>;
//   }

//   return (
//     <div className="notes-container">
//       <main>
//         <h2 className="text-center">ECAT Preparation Resources</h2>
//         <p className="intro-text text-center py-3 fw-bold">
//           Select a content type to explore ECAT notes.
//         </p>

//         <div className="subjects-grid">
//           <div className={`subject-card ${isCardOpen ? "active" : ""}`}>
//             <div
//               className="subject-header"
//               onClick={() => setIsCardOpen(!isCardOpen)}
//             >
//               <span>entry-test</span>
//               <span>{isCardOpen ? "▼" : "►"}</span>
//             </div>

//             <div className={`dropdown-container ${isCardOpen ? "visible" : ""}`}>
//               <div className="dropdown-content">
//                 {ecatContentTypes.map(({ label, value }) => (
//                   <div key={value}>
//                     <div
//                       className={`content-type ${
//                         activeContentType === value ? "active" : ""
//                       }`}
//                       onClick={() => handleContentTypeClick(value)}
//                     >
//                       {label}
//                     </div>

//                     {activeContentType === value && (
//                       <div className="topics-list">
//                         {loading ? (
//                           <div className="loading">Loading...</div>
//                         ) : Object.keys(topics).length > 0 ? (
//                           Object.keys(topics).map((topicName, i) => (
//                             <div
//                               key={i}
//                               className="topic-item"
//                               onClick={() => handleTopicClick(topicName)}
//                             >
//                               📌 {topicName}
//                             </div>
//                           ))
//                         ) : (
//                           <div className="no-topics">No topics available</div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default EcatNotes



import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fireStore } from "../../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../../assets/css/notes.css";

const EcatNotes = () => {
  const { selectedClass, subject, ecatContentType } = useParams();
  const navigate = useNavigate();

  const [topics, setTopics] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeContentType, setActiveContentType] = useState(ecatContentType);
  const [ecatContentTypes, setEcatContentTypes] = useState([]);
  const [isCardOpen, setIsCardOpen] = useState(true);

  useEffect(() => {
    console.log("Selected Class:", selectedClass);
    console.log("Subject:", subject);
    console.log("ECAT Content Type:", ecatContentType);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
  // Set default subject and content type if not provided
  if (!subject) {
    navigate(`/${selectedClass}/entry-test`);
    return;
  }

  if (subject === "entry-test" && ecatContentType) {
    setActiveContentType(ecatContentType);
    fetchTopics(ecatContentType);
  }
}, [subject, ecatContentType, selectedClass]);

  useEffect(() => {
    const fetchEcatContentTypes = async () => {
      try {
        const q = query(collection(fireStore, "ecatContentTypes"));
        const snapshot = await getDocs(q);
        const types = snapshot.docs.map((doc) => doc.data());
        setEcatContentTypes(types);
      } catch (error) {
        console.error("Error fetching ECAT content types:", error);
      }
    };

    if (subject === "entry-test") {
      fetchEcatContentTypes();
    }
  }, [subject]);

  const fetchTopics = async (type) => {
    setLoading(true);
    try {
      const q = query(
        collection(fireStore, "topics"),
        where("class", "==", selectedClass),
        where("subject", "==", "entry-test"),
        where("ecatcontentType", "==", type.trim().toLowerCase())
      );

      console.log("Fetching topics with query:", q);

      const snapshot = await getDocs(q);
      const topicData = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.topic) topicData[data.topic] = data.fileUrls || [];
      });

      setTopics(topicData);
    } catch (error) {
      console.error("Error fetching ECAT topics:", error);
    }
    setLoading(false);
  };

  const handleContentTypeClick = (type) => {
    setActiveContentType(type);
    navigate(`/${selectedClass}/entry-test/${type}`);
    fetchTopics(type);
  };

  const handleTopicClick = (topicName) => {
    const fileData = topics[topicName]?.[0];
    let fileUrl = "";

    if (typeof fileData === "string") {
      fileUrl = fileData;
    } else if (fileData && typeof fileData === "object") {
      fileUrl = fileData.url || fileData.fileUrl || "";
    }

    if (fileUrl) {
      navigate(`/preview?url=${encodeURIComponent(fileUrl)}`);
    } else {
      console.warn("No valid file URL found for topic:", topicName);
    }
  };

  // Show error if subject is not "entry-test"
  if (subject !== "entry-test") {
    return (
      <div className="notes-container">
        <h2 className="text-center py-4">Subject not supported here</h2>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <main>
        <h2 className="text-center">ECAT Preparation Resources</h2>
        <p className="intro-text text-center py-3 fw-bold">
          Select a content type to explore ECAT notes.
        </p>

        <div className="subjects-grid">
          <div className={`subject-card ${isCardOpen ? "active" : ""}`}>
            <div
              className="subject-header"
              onClick={() => setIsCardOpen(!isCardOpen)}
            >
              <span>entry-test</span>
              <span>{isCardOpen ? "▼" : "►"}</span>
            </div>

            <div
              className={`dropdown-container ${isCardOpen ? "visible" : ""}`}
            >
              <div className="dropdown-content">
                {ecatContentTypes.map(({ label, value }) => (
                  <div key={value}>
                    <div
                      className={`content-type ${
                        activeContentType === value ? "active" : ""
                      }`}
                      onClick={() => handleContentTypeClick(value)}
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
        </div>
      </main>
    </div>
  );
};

export default EcatNotes;
