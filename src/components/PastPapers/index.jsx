import React, { useState, useEffect } from "react";
import { message } from "antd";
import { FaBookOpen } from "react-icons/fa";
// import { supabase } from "../../config/supabase"; // Removed

const PastPapers = ({ selectedClass, selectedCategory }) => {
  const [pastPapers, setPastPapers] = useState([
    // Mock data
    { id: 1, title: '2024 Math Paper', url: '#' }
  ]);

  return (
    <div className="featured-container">
      <h2 className="section-heading text-center text-dark fw-bold mb-4">
        Past Papers (Mock)
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
