import { useState } from "react";
import { FaEnvelope, FaLock , FaUser } from "react-icons/fa"; // Importing icons
import "../assets/css/formauth.css";

const FormAuth = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="auth-container">
      <div className="auth-box mb-3">
        {/* <h2>{isSignUp ? "Create an Account" : "Login"}</h2> */}
        <form>
          {isSignUp && (
            <div className="input-group">
              <label className="mt-1">Name</label>
            <FaUser className="input-icon" />
              <input type="text" placeholder="Your Name" />
            </div>
          )}
          <div className="input-group">
            <label className="mt-1">Email</label>
            <FaEnvelope className="input-icon" />
            <input type="email" placeholder="Your Email" />
          </div>
          <div className="input-group">
            <label className="mt-1">Password</label>
            <FaLock className="input-icon" />
            <input type="password" placeholder="Your Password" />
         
          </div>
          <a href="#" className="forgot-password">Forgot Password?</a>
          <button type="submit" className="auth-btn">{isSignUp ? "Sign Up" : "Login"}</button>
        </form>
        {/* <p className="or-text">Or Login via</p> 
         <button className="google-btn">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo" />
          Login with Google
        </button> */}
        <p className="switch-auth">
          {isSignUp ? "Already have an account? Click" : "Create an account"}{" "}
          <span className="toggle-link" onClick={() => setIsSignUp(!isSignUp)}>Here</span>
        </p>
      </div>
    </div>
  );
};

export default FormAuth;
