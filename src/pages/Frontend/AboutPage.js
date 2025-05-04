import React, { useEffect, useState } from "react";
import "../../assets/css/aboutpage.css";
import AboutImg from "../../assets/images/AboutImg.png";
import CEO from "../../assets/images/CEO .jpg";
import img1 from "../../assets/images/stu5.png";
import img2 from "../../assets/images/stu5.png";
import img3 from "../../assets/images/stu5.png";

const AboutSection = () => {
  const [showHeroMore, setShowHeroMore] = useState(false);
  const [showMore1, setShowMore1] = useState(false);
  const [showMore2, setShowMore2] = useState(false);
  const [showMore3, setShowMore3] = useState(false);
  const [showCEO, setShowCEO] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="about-container">
      {/* About Hero Section */}
      <div className="about-section">
        <img src={AboutImg} alt="About Us" className="background-image" />
        <div className="overlay"></div>
        <div className="content">
          <h2>About Us</h2>
          <p>
            We are dedicated to providing the best services with a focus on quality and innovation.
            {showHeroMore && (
              <>
                <br />
                Our commitment drives us to constantly innovate and exceed expectations.
              </>
            )}
          </p>
          <button className="learn-more" onClick={() => setShowHeroMore(!showHeroMore)}>
            {showHeroMore ? "View Less" : "View More"}
          </button>
        </div>
      </div>

      <h2 className="about-title mt-5 text-dark">Preparing Students to Achieve Success</h2>
      <div className="title-underline"></div>

      <div className="about-content">
        {/* Section 1 */}
        <div className="about-row">
          <div className="about-text">
            <h3>Empowering Minds, Transforming Futures</h3>
            <p>
              We provide students with cutting-edge knowledge, critical thinking skills, and the confidence to navigate the challenges of the modern world. Our holistic approach ensures a strong foundation for lifelong success.
            </p>
            {showMore1 && (
              <p>
                Through hands-on learning and mentorship, students become proactive problem-solvers and responsible global citizens.
              </p>
            )}
            <button className="about-btn" onClick={() => setShowMore1(!showMore1)}>
              {showMore1 ? "View Less" : "View More"}
            </button>
          </div>
          <div className="about-image-wrapper">
            <div className="about-image-bg"></div>
            <img src={img1} alt="Confident Learners" className="about-image" />
          </div>
        </div>

        {/* Section 2 */}
        <div className="about-row about-reverse">
          <div className="about-text">
            <h3>Innovative Learning, Limitless Possibilities</h3>
            <p>
              Our dynamic classrooms foster curiosity and creativity, encouraging students to explore, experiment, and excel. With interactive experiences and real-world applications, learning becomes an exciting journey.
            </p>
            {showMore2 && (
              <p>
                Students engage with simulations, collaborative projects, and tech-driven lessons that unlock their full potential.
              </p>
            )}
            <button className="about-btn" onClick={() => setShowMore2(!showMore2)}>
              {showMore2 ? "View Less" : "View More"}
            </button>
          </div>
          <div className="about-image-wrapper">
            <div className="about-image-bg"></div>
            <img src={img2} alt="Unique Classroom" className="about-image" />
          </div>
        </div>

        {/* Section 3 */}
        <div className="about-row">
          <div className="about-text">
            <h3>Mentors Who Inspire, Guide, and Elevate</h3>
            <p>
              Our passionate educators go beyond teaching—they mentor, motivate, and shape future leaders. With personalized attention and unwavering support, every student receives the guidance they need to reach their full potential.
            </p>
            {showMore3 && (
              <p>
                We create a nurturing environment where every learner feels seen, supported, and inspired to achieve greatness.
              </p>
            )}
            <button className="about-btn" onClick={() => setShowMore3(!showMore3)}>
              {showMore3 ? "View Less" : "View More"}
            </button>
          </div>
          <div className="about-image-wrapper">
            <div className="about-image-bg"></div>
            <img src={img3} alt="Passionate Teachers" className="about-image" />
          </div>
        </div>
      </div>

      {/* CEO Message Section */}
      <div className="container" style={{ paddingTop: "50px", paddingBottom: "100px" }}>
        <div className="row">
          <div className="col-md-6 d-flex justify-content-center align-items-center flex-column align-items-md-start">
            <h3 style={{ fontFamily: "Playfair Display", fontSize: "50px", color: "black" }} className="mb-3">
              Message from Our CEO
            </h3>
            <p className="mt-3 mb-4" style={{ fontSize: "20px" }}>
              Education means nourishing the mind and make it develop in order to see beyond the limitations of current social perception.
              <br />
              “The flow of knowledge towards the mind should be moderated by the faculties of the mind itself, based on the acceptability of nothing but the mind."
              <br />
              “A carefully constructed structure of education is supposed to smoothen the pursuit of knowledge, instead of restricting the flow of knowledge.”
            </p>
            {showCEO && (
              <p className="mb-4" style={{ fontSize: "20px" }}>
                “The world needs teachers – teachers who have broken their own shackles of indoctrination – teachers who can go beyond the narrow-mindedness of the society.
                A handful of these young, brave and zealous teachers in every nation, shall be enough to rekindle the spark of pure knowledge in the entire species."
                <br />
                This is not Education. It is a process of manufacturing computation devices that look like Homo sapiens.”
                <br />
                Our motto is to provide quality Education.
                <br />
                Join hands to Dream, Believe and Do.
              </p>
            )}
            <button className="learn-more mb-2" onClick={() => setShowCEO(!showCEO)}>
              {showCEO ? "View Less" : "View More"}
            </button>
          </div>
          <div className="col-md-6">
            <img
              src={CEO}
              alt="Our Mission"
              style={{ width: "80%", height: "420px", marginTop: "50px", borderRadius: "6px" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;





