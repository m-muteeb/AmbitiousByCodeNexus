import React from "react";
import { FaBook, FaFilePdf, FaSchool } from "react-icons/fa";
import { Link } from "react-router-dom";
import learn from "../assets/images/learn.png"; // You can use a relevant image
import logo from "../assets/images/Ambitious logo .jpg"; // Your institution's logo
import "../assets/css/premium.css"; // Reuse the same styles or rename if needed

const PaidContent = () => {
  return (
    <section className="learning-section">
      <div className="learning-container">
        {/* Left Side - Image */}
        <div className="learning-image">
          <img src={learn} alt="Paid Resources" />
        </div>

        {/* Right Side - Content */}
        <div className="learning-content">
          {/* Institution logo and name */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
            <img src={logo} alt="Institution Logo" style={{ width: 50, marginRight: 10 }} />
            <h3 style={{ margin: 0 }}>Ambitious</h3>
          </div>

          <h1>
            Access <span className="highlight">Paid Notes & Series</span>
          </h1>
          <p style={{ marginBottom: "1.5rem", color: "#555" }}>
            Premium academic resources tailored just for you — curated, organized, and modified to boost your learning.
          </p>

          <div className="learning-feature">
            <div className="feature-icon">
              <FaBook />
            </div>
            <div>
              <h4>Exclusive Series</h4>
              <p>Special question series and guides designed for advanced practice.</p>
            </div>
          </div>

          <div className="learning-feature">
            <div className="feature-icon">
              <FaFilePdf />
            </div>
            <div>
              <h4>Modified PDFs</h4>
              <p>Download institution-approved PDFs with focused and simplified content.</p>
            </div>
          </div>

          <div className="learning-feature">
            <div className="feature-icon">
              <FaSchool />
            </div>
            <div>
              <h4>Institution Verified</h4>
              <p>All material is verified and distributed by Ambitious Team.</p>
            </div>
          </div>

          {/* Signup Button */}
          <div style={{ marginTop: "2rem" }}>
            <Link to="/auth/register">
              <button className="sign-in-btn" style={{ padding: "0.75rem 2rem" }}>
                Sign Up to Access
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaidContent;
