import React from "react";
import "../assets/css/hero.css"; // Import CSS file
import heroImage from "../assets/images/heroImage.png"; // Replace with your image path
import { FaSearch } from "react-icons/fa";

const Hero = () => {
  return (
    <section className="hero mt-5 mb-5">
      <div className="hero-content ">
        <h1>The <span style={{color : "orange"}}>Smart</span> <span style={{color : "orange"}}>Choice</span> for Future</h1>
        <p>Ambitious is a valuable platform for students looking to learn effectively and perform well in their studies. </p>
        <div className="search-bar">
            <FaSearch />
          <input type="text" placeholder="Search for a topic..." />
          <button className="search-bton">
            Continue
          </button>
        </div>
      </div>
      <div className="hero-image">
        <img src={heroImage} alt="Hero Section" />
      </div>
    </section>
  );
};

export default Hero;