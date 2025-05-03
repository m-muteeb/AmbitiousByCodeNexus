import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import logo from "../../assets/images/Ambitious logo .jpg";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <>
      <footer
        className="text-center text-lg-start text-dark"
        style={{ backgroundColor: "#ECEFF1" }}
      >
        <section>
          <div className="container text-center text-md-start pt-5 mt-1">
            <div className="row mt-2">
              {/* Logo and description */}
              <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-1">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={logo} width="45" alt="Logo" />
                  <h1 className="text-dark">Ambitious</h1>
                </div>
                <p className="mb-0 text-dark">
                  Ambitious is an innovative educational platform dedicated to empowering students with high-quality learning resources. We offer engaging courses, interactive quizzes, and expert guidance to help learners achieve academic excellence.
                </p>
              </div>

              {/* Features */}
              <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                <h6 className="text-uppercase fw-bold">Features</h6>
                <hr
                  className="mb-4 mt-0 d-inline-block mx-auto"
                  style={{
                    width: "60px",
                    backgroundColor: "red",
                    height: "2px",
                  }}
                />
                <p>
                  <Link to="/notes" className="text-dark" style={{ textDecoration: "none" }}>
                    Notes
                  </Link>
                </p>
                <p>
                  <Link to="/faqs" className="text-dark" style={{ textDecoration: "none" }}>
                    FAQs
                  </Link>
                </p>
                <p>
                  <Link to="/privacypolicy" className="text-dark" style={{ textDecoration: "none" }}>
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Important Sections */}
              <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
                <h6 className="text-uppercase fw-bold">Important Sections</h6>
                <hr
                  className="mb-4 mt-0 d-inline-block mx-auto"
                  style={{
                    width: "60px",
                    backgroundColor: "#8B0000",
                    height: "2px",
                  }}
                />
                <p>
                  <Link to="/about" className="text-dark" style={{ textDecoration: "none" }}>
                    About
                  </Link>
                </p>
                <p>
                  <Link to="/instituionpage" className="text-dark" style={{ textDecoration: "none" }}>
                    Test Series
                  </Link>
                </p>
                <p>
                  <Link to="/contact" className="text-dark" style={{ textDecoration: "none" }}>
                    Contact Us
                  </Link>
                </p>
              </div>

              {/* Contact */}
              <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mt-3">
                <h6 className="text-uppercase fw-bold">Contact</h6>
                <hr
                  className="mb-4 mt-0 d-inline-block mx-auto"
                  style={{
                    width: "60px",
                    backgroundColor: "red",
                    height: "2px",
                  }}
                />
                <p>
                  <Link to="tel:30000000000" className="text-dark" style={{ textDecoration: "none" }}>
                    0333-4082706
                  </Link>
                </p>
                <p className="mt-2">
                  Main shop Jia Musa Shahdara Lahore, Pakistan, 54950
                </p>
                <p>
                  <Link to="mailto:theambitious.edu@gmail.com" className="text-dark" style={{ textDecoration: "none" }}>
                    theambitious.edu@gmail.com
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        <hr />

        {/* Copyright and Developer Credit */}
        <div className="text-center text-dark pb-3">
          <p className="fw-bold mb-1">
            Copyright © {year}. All Rights Reserved.
          </p>
          <p className="fw-bold mb-0">
            Designed by{" "}
            <a
              href="http://code-nexus-pk.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "red", fontWeight: "bold", textDecoration: "none" }}
            >
              Code Nexus
            </a>
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
