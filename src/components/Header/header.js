import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegBell, FaBars, FaTimes } from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../config/firebase"; // Make sure path is correct
import "../../assets/css/header.css";
import logo from "../../assets/images/Ambitious logo .jpg";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Track user auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false); // Close menu on logout
    navigate("/");
  };

  // Close menu when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        {/* Logo & Website Name */}
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <Link to="/" className="site-name" onClick={handleLinkClick}>Ambitious</Link>
        </div>

        {/* Navigation */}
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/institutionpage">Paid Test Series</Link>
        </nav>

        {/* Right Section */}
        <div className="right-section">
          {!user ? (
            <Link to="/auth/login">
              <button className="sign-in-btn">Login</button>
            </Link>
          ) : (
            <button onClick={handleLogout} className="sign-in-btn">
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={handleLinkClick}>Home</Link>
          <Link to="/about" onClick={handleLinkClick}>About Us</Link>
          <Link to="/institutionpage" onClick={handleLinkClick}>Paid Test Series</Link>
          <Link to="/contact" onClick={handleLinkClick}>Contact Us</Link>
          {/* {!user && <Link to="/login" onClick={handleLinkClick}>Login</Link>} */}
          {!user ? (
            <Link to="/auth/login" onClick={handleLinkClick}>
              <button className="sign-in-btn">Sign Up</button>
            </Link>
          ) : (
            <button onClick={handleLogout} className="sign-in-btn">
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}





