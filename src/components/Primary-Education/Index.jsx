// import React, { useEffect, useState } from "react";
// import { Card, Collapse, Spin, message } from "antd";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { fireStore } from "../../config/firebase";

// const { Panel } = Collapse;

// const PrimaryContentBrowser = () => {
//   const [classes, setClasses] = useState([]);
//   const [primaryTypes, setPrimaryTypes] = useState([]);
//   const [topicsMap, setTopicsMap] = useState({});
//   const [loading, setLoading] = useState(false);

//   const allowedClasses = ["KG", "Class 1", "Class 2", "Class 3", "Class 4"];

//   // Fetch allowed classes
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const snapshot = await getDocs(collection(fireStore, "classes"));
//         const classList = snapshot.docs
//           .map((doc) => doc.data().name)
//           .filter((name) => allowedClasses.includes(name));
//         setClasses(classList);
//       } catch (err) {
//         message.error("Failed to load classes");
//       }
//     };
//     fetchClasses();
//   }, []);

//   // Fetch primary content types
//   useEffect(() => {
//     const fetchPrimaryContentTypes = async () => {
//       try {
//         const snapshot = await getDocs(collection(fireStore, "primaryContentTypes"));
//         const types = snapshot.docs.map((doc) => ({
//           label: doc.data().label,
//           value: doc.data().value,
//         }));
//         setPrimaryTypes(types);
//       } catch (err) {
//         message.error("Failed to load content types");
//       }
//     };
//     fetchPrimaryContentTypes();
//   }, []);

//   const fetchTopics = async (className, typeValue) => {
//     const key = `${className}_${typeValue}`;
//     if (topicsMap[key]) return; // already loaded

//     setLoading(true);
//     try {
//       const q = query(
//         collection(fireStore, "topics"),
//         where("class", "==", className),
//         where("primaryContentType", "==", typeValue)
//       );
//       const snapshot = await getDocs(q);
//       const topics = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setTopicsMap((prev) => ({ ...prev, [key]: topics }));
//     } catch (err) {
//       message.error("Failed to load topics");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Primary Content Browser</h2>
//       {loading && <Spin />}
//       {classes.map((className) => (
//         <Card
//           key={className}
//           title={className}
//           style={{ marginBottom: 20 }}
//         >
//           <Collapse
//             accordion
//             onChange={(key) => {
//               if (key) fetchTopics(className, key);
//             }}
//           >
//             {primaryTypes.map((type) => {
//               const topicKey = `${className}_${type.value}`;
//               const topics = topicsMap[topicKey] || [];

//               return (
//                 <Panel header={type.label} key={type.value}>
//                   {topics.length === 0 ? (
//                     <p>No topics found.</p>
//                   ) : (
//                     topics.map((topic) => (
//                       <Card
//                         key={topic.id}
//                         type="inner"
//                         title={topic.topic}
//                         style={{ marginBottom: 10 }}
//                       >
//                         <p>{topic.description || "No description provided."}</p>
//                       </Card>
//                     ))
//                   )}
//                 </Panel>
//               );
//             })}
//           </Collapse>
//         </Card>
//       ))}
//     </div>
//   );
// };

// export default PrimaryContentBrowser;
import React, { useEffect, useState } from "react";
import { Card, Collapse, Spin, message } from "antd";
import { collection, getDocs, query, where } from "firebase/firestore";
import { fireStore } from "../../config/firebase";

const { Panel } = Collapse;

const PrimaryContentBrowser = () => {
  const [classes, setClasses] = useState([]);
  const [primaryTypes, setPrimaryTypes] = useState([]);
  const [topicsMap, setTopicsMap] = useState({});
  const [loading, setLoading] = useState(false);

  const allowedClasses = ["KG", "Class 1", "Class 2", "Class 3", "Class 4"];

  // Fetch allowed classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const snapshot = await getDocs(collection(fireStore, "classes"));
        const classList = snapshot.docs
          .map((doc) => doc.data().name)
          .filter((name) => allowedClasses.includes(name));

        // Sort according to our desired order
        const sorted = allowedClasses.filter((cls) => classList.includes(cls));
        setClasses(sorted);
      } catch (err) {
        message.error("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  // Fetch primary content types
  useEffect(() => {
    const fetchPrimaryContentTypes = async () => {
      try {
        const snapshot = await getDocs(collection(fireStore, "primaryContentTypes"));
        const types = snapshot.docs.map((doc) => ({
          label: doc.data().label,
          value: doc.data().value,
        }));
        setPrimaryTypes(types);
      } catch (err) {
        message.error("Failed to load content types");
      }
    };
    fetchPrimaryContentTypes();
  }, []);

  const fetchTopics = async (className, typeValue) => {
    const key = `${className}_${typeValue}`;
    if (topicsMap[key]) return;

    setLoading(true);
    try {
      const q = query(
        collection(fireStore, "topics"),
        where("class", "==", className),
        where("primaryContentType", "==", typeValue)
      );
      const snapshot = await getDocs(q);
      const topics = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTopicsMap((prev) => ({ ...prev, [key]: topics }));
    } catch (err) {
      message.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Primary Content Browser</h2>
      {loading && <Spin />}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(48%, 1fr))",
          gap: "20px",
        }}
      >
        {classes.map((className) => (
          <Card
            key={className}
            title={className}
            style={{ width: "100%" }}
          >
            <Collapse
              accordion
              onChange={(key) => {
                if (key) fetchTopics(className, key);
              }}
            >
              {primaryTypes.map((type) => {
                const topicKey = `${className}_${type.value}`;
                const topics = topicsMap[topicKey] || [];

                return (
                  <Panel header={type.label} key={type.value}>
                    {topics.length === 0 ? (
                      <p>No topics found.</p>
                    ) : (
                      topics.map((topic) => (
                        <Card
                          key={topic.id}
                          type="inner"
                          title={topic.topic}
                          style={{ marginBottom: 10 }}
                        >
                          <p>{topic.description || "No description provided."}</p>
                        </Card>
                      ))
                    )}
                  </Panel>
                );
              })}
            </Collapse>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PrimaryContentBrowser;
