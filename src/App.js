import React, { useEffect, useState } from "react";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Header from "./components/Header/header";
import Router from "./Router";
import Footer from "./components/Footer/footer";

function App() {
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(false), 7000); // Auto close after 7s
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Router />
      </main>
      <Footer />

      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.4)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 rounded-4 shadow-lg"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div
                className="modal-header text-white border-0"
                style={{
                  background: "linear-gradient(135deg, #0d6efd99, #19875499)",
                  borderTopLeftRadius: "1rem",
                  borderTopRightRadius: "1rem",
                }}
              >
                <h5 className="modal-title fw-bold">
                  Test Maker Software – Coming Soon
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body text-white text-center p-4">
                <p className="mb-3 fs-6">
                  A smart and modern way to create tests quickly and easily.
                </p>

                <div className="row">
                  <div className="col-md-6 text-start">
                    <h6 className="fw-bold">Features (English)</h6>
                    <ul className="small">
                      <li>Create tests in minutes</li>
                      <li>Automatic MCQs & short questions</li>
                      <li>Exclusive early-access discount</li>
                    </ul>
                  </div>
                  <div className="col-md-6 text-end" dir="rtl">
                    <h6 className="fw-bold">خصوصیات (اردو)</h6>
                    <ul className="small">
                      <li>آسان اور تیز رفتار ٹیسٹ بنانے کی سہولت</li>
                      <li>خودکار سوالات تیار کریں</li>
                      <li>خصوصی رعایت برائے ابتدائی صارفین</li>
                    </ul>
                  </div>
                </div>

                <a
                  href="https://chat.whatsapp.com/IOUB5HFWu37AT81LxOuINF?mode=ems_copy_t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light fw-bold px-4 rounded-pill mt-3 shadow-sm"
                  style={{
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                  }}
                >
                  Join on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
