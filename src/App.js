import React, { useEffect, useState } from "react";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Header from "./components/Header/header";
import Router from "./Router";
import Footer from "./components/Footer/footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(false), 7000); // Auto close after 7s
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <div className="App">
        <ScrollToTop />
        <Header />
        <Router />
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </AuthProvider>
  );
}

export default App;
