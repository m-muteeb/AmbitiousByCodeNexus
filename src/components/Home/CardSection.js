import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/css/cardsection.css";
import {
    FaGraduationCap,
    FaBook,
    FaUserGraduate,
    FaMicroscope,
    FaLaptopCode
} from "react-icons/fa";

const categories = [
    {
        title: "8th",
        displayTitle: "Class 8",
        icon: <FaGraduationCap />,
        color: "#457b9d"
    },
    {
        title: "9th",
        displayTitle: "Class 9",
        icon: <FaBook />,
        color: "#1d3557"
    },
    {
        title: "10th",
        displayTitle: "Class 10",
        icon: <FaUserGraduate />,
        color: "#457b9d"
    },
    {
        title: "11th",
        displayTitle: "Class 11",
        icon: <FaMicroscope />,
        color: "#1d3557"
    },
    {
        title: "12th",
        displayTitle: "Class 12",
        icon: <FaLaptopCode />,
        color: "#457b9d"
    },
    {
        title: "ecat",
        displayTitle: "ECAT",
        icon: <FaGraduationCap />,
        color: "#1d3557"
    }
];

const CardSection = () => {
    const { selectedClass } = useParams();
    const navigate = useNavigate();
    const [activeClass, setActiveClass] = useState(selectedClass || "");

    const handleSelectClass = (title) => {
        setActiveClass(title);
        navigate(`notes/${title.toLowerCase()}`);
    };

    return (
        <div className="featured-container">
            <div className="section-header-wrapper">
                <h2 className="section-heading">
                    Explore Our Academic Levels
                </h2>
                <p className="section-subheading">Choose your grade to access premium notes, past papers, and study resources.</p>
            </div>

            <div className="featured-grid">
                {categories.map((category, index) => (
                    <div
                        key={index}
                        className={`category-premium-card ${activeClass === category.title ? "active" : ""}`}
                        onClick={() => handleSelectClass(category.title)}
                        style={{ "--accent-color": category.color }}
                    >
                        <div className="card-top-accent"></div>
                        <div className="card-content">
                            <div className="premium-icon-wrapper">
                                {category.icon}
                            </div>
                            <h3 className="card-class-title">{category.displayTitle}</h3>
                            <div className="card-divider"></div>

                            <p className="card-simple-desc">Access all your {category.displayTitle} educational materials, including notes, papers, and more in one place.</p>

                            <button className="explore-btn">
                                Open Class {category.title} Hub
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CardSection;
