import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { message } from "antd";
import { FaBookOpen } from "react-icons/fa";
import {fireStore} from "../../config/firebase"

const PastPapers = ({ selectedClass, selectedCategory }) => {
  const [pastPapers, setPastPapers] = useState([]);

  useEffect(() => {
    const fetchPastPapers = async () => {
      if (!selectedClass || !selectedCategory) return;
      try {
        const q = query(
          collection(fireStore, "topics"),
          where("class", "==", selectedClass),
          where("category", "==", selectedCategory)
        );
        const querySnapshot = await getDocs(q);
        const papers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPastPapers(papers);
      } catch (error) {
        message.error("Failed to fetch past papers.");
        console.error(error);
      }
    };
    fetchPastPapers();
  }, [selectedClass, selectedCategory]);

  return (
    <div className="featured-container">
      <h2 className="section-heading text-center text-dark fw-bold mb-4">
        Past Papers
      </h2>
      <div className="featured-section">
        {pastPapers.length > 0 ? (
          pastPapers.map((paper) => (
            <div className="category-card" key={paper.id}>
              <div className="icon-wrapper">
                <FaBookOpen className="category-icon" />
              </div>
              <h3>{paper.title}</h3>
              <a href={paper.url} target="_blank" rel="noopener noreferrer">
                View Paper
              </a>
            </div>
          ))
        ) : (
          <p>No past papers available for the selected class and category.</p>
        )}
      </div>
    </div>
  );
};

export default PastPapers;
