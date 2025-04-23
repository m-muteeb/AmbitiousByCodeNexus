import React from "react";
import { useParams } from "react-router-dom";
import "../../assets/css/subnotes.css";

const SubNotes = () => {
  const { subject } = useParams();

  return (
    <div className="notes-detail-container">
      
      <main>
        <h2 className="text-center">{subject} Notes</h2>
        <div className="notes-sections">
          <div className="notes-card">📖 Book Lessons</div>
          <div className="notes-card">❓ Short Questions</div>
          <div className="notes-card">✅ MCQs</div>
        </div>
      </main>

      
    </div>
  );
};

export default SubNotes;
