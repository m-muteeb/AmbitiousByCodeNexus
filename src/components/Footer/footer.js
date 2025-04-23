import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import logo from "../../assets/images/Ambitious logo .jpg"

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
              <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-1">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={logo} width="45" alt="Logo" />
                  <h1 className="text-dark">Ambitious</h1>
                </div>

                <p className="mb-0 text-dark">
                  Ambitious is an innovative educational platform dedicated to empowering students with high-quality learning resources. We offer engaging courses, interactive quizzes, and expert guidance to help learners achieve academic excellence.
                </p>
              </div>

              <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                <h6 className="text-uppercase fw-bold">Features</h6>
                <hr
                  className="mb-4 mt-0 d-inline-block mx-auto"
                  style={{
                    width: "60px",
                    backgroundColor: "red", // Change to red
                    height: "2px",
                  }}
                />
                <p style={{ textDecoration: "none", color: "black" }} >                 
                    Notes              
                </p>
                <p>                 
                    Past Papers                
                </p>
                <p>        
                    FAQs
                </p>
                <p>
                    Privacy Policy
                </p>
              </div>
              <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
                <h6 className="text-uppercase fw-bold">Important Sections</h6>
                <hr
                  className="mb-4 mt-0 d-inline-block mx-auto"
                  style={{
                    width: "60px",
                    backgroundColor: "#8B0000", // Change to red
                    height: "2px",
                  }}
                />
                <p>
                  <Link to="/about" className="text-dark" style={{ textDecoration: "none", color: "black" }}>
                    About
                  </Link>
                </p>
                <p>
                  <Link to="/about" className="text-dark" style={{ textDecoration: "none", color: "black" }}>
                    Services
                  </Link>
                </p>
                <p>
                  <Link to="/contact" className="text-dark" style={{ textDecoration: "none", color: "black" }}>
                    Contact Us
                  </Link>
                </p>
                <p>
                  <Link to="/orders" className="text-dark" style={{ textDecoration: "none", color: "black" }}>
                    Disscussion
                  </Link>
                </p>
              </div>
              <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mt-3">
                <h6 className="text-uppercase fw-bold">Contact</h6>
                <hr
                  className="mb-4 mt-0 d-inline-block mx-auto"
                  style={{
                    width: "60px",
                    backgroundColor: "red", // Change to red
                    height: "2px",
                  }}
                />
                <p>
                  <Link to="tel:30000000000" className="text-dark" style={{ textDecoration: "none", color: "black" }}>
                  0333-4082706
                  </Link>
                </p>
                <p className="mt-2">Main shop Jia Musa Shahdara Lahore, Pakistan , 54950</p>
                <p className="text-dark">
                  <Link to="mailto:  ambitiousacademy@gmail.com" className="text-dark" style={{ textDecoration: "none", color: "black" }}>
                  theambitious.edu@gmail.com
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
        <hr />
         <div className=" col-lg-12 col-md-6 text-center text-dark">
            <p className="text-dark fw-bold">Copyright © {year}. All Rights Reserved.</p>
          </div>
      </footer>
    </>
  );
};

export default Footer;
