import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../assets/css/cardsection.css";
import { FaBookOpen } from "react-icons/fa";

const categories = [
  { title: "Class 9" },
  { title: "Class 10" },
  { title: "Class 11" },
  { title: "Class 12" },
  {
    title: "ECAT Exam",
    subItems: [
      "NUST",
      "ECAT Unsolved Tests",
      "ECAT Solved Tests",
      "ECAT Solved Past Papers",
      "ECAT Home Assignments"
    ]
  }
];

const CardSection = () => {
  const { selectedClass } = useParams(); // Get selected class from URL
  const navigate = useNavigate();
  const [activeClass, setActiveClass] = useState(selectedClass || "");

  const handleSelectClass = (title) => {
    setActiveClass(title);
    navigate(`notes/${title.replace(/\s+/g, "").toLowerCase()}`); // Update URL
  };

  return (
    <div className="featured-container">
      <h2 className="section-heading text-center text-dark fw-bold mb-5">
        Featured Classes
      </h2>
      <div className="featured-section">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`category-card ${activeClass === category.title ? "active" : ""}`}
            onClick={() => handleSelectClass(category.title)}
          >
            <div className="icon-wrapper">
              <FaBookOpen className="category-icon" />
            </div>
            <h3>{category.title}</h3>
            <ul>
              {(category.subItems || [
                "Notes",
                "Past Papers",
                "Test Yourself",
                "Guess Papers"
              ]).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardSection;