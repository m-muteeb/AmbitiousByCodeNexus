import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/header.css";
import logo from "../../assets/images/Ambitious logo .jpg";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = profile && (profile.role === 'admin' || profile.role === 'superadmin');

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false); // Close menu on logout
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Close menu when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Hide header on Admin Dashboard
  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

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
          <Link to="/result-portal" onClick={handleLinkClick}>Student Result</Link>
        </nav>

        {/* Right Section */}
        <div className="right-section" style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && (
            <Link to="/dashboard">
              <button className="sign-in-btn" style={{ background: '#1d3557' }}>Admin Panel</button>
            </Link>
          )}
          {!user ? (
            <Link to="/auth/login" className="mobile-hidden">
              <button className="sign-in-btn">Login</button>
            </Link>
          ) : (
            <button onClick={handleLogout} className="sign-in-btn mobile-hidden">
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
          <Link to="/fourm" onClick={handleLinkClick}>Discussion Forum</Link>
          <Link to="/result-portal" onClick={handleLinkClick}>Student Result</Link>

          <Link to="/contact" onClick={handleLinkClick}>Contact Us</Link>
          {/* {!user && <Link to="/login" onClick={handleLinkClick}>Login</Link>} */}
          {isAdmin && <Link to="/dashboard" onClick={handleLinkClick} style={{ fontWeight: 'bold' }}>Admin Dashboard</Link>}
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





