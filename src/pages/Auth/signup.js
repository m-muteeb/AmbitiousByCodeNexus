import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, storage } from '../../config/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const SignupPage = () => {
  const [institutionName, setInstitutionName] = useState('');
  const [email, setEmail] = useState('');
  const [logo, setLogo] = useState(null);
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let logoUrl = '';
      if (logo) {
        const logoRef = ref(storage, 'logos/' + logo.name);
        const uploadTask = uploadBytesResumable(logoRef, logo);
        await uploadTask;
        logoUrl = await getDownloadURL(logoRef);
      }

      await setDoc(doc(db, 'users', user.uid), {
        institutionName,
        email,
        logoUrl: logoUrl || '',
        address,
        phoneNumber,
        role: 'user',
      });

      navigate('/institutionpage');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupBox}>
            <h3>📢 Important Instructions</h3>
            <ul style={{ paddingLeft: '1rem' }}>
              <li style={{ fontWeight: 'bold', fontSize: '18px' }}>🔥 Premium Access</li>
              <li>Fill out all fields in the form below.</li>
              <li>Pay the registration fee via <strong>JazzCash</strong>.</li>
              <li>Send your <strong>payment proof via WhatsApp</strong>.</li>
              <li style={{ color: 'red', fontWeight: 'bold' }}>
                You will get access to all PDFs within 24 hours. This is a one-time process.
              </li>
              <li>After registration, just login anytime to access all modified PDFs.</li>

              <br />

              <li style={{ fontWeight: 'bold', fontSize: '18px' }}>🧪 Demo Access</li>
              <li>Enter all required fields in the form below.</li>
              <li style={{ color: 'orange', fontWeight: 'bold' }}>
                Missing any field will prevent demo test downloads.
              </li>
              <li>You will get access within 24 hours. Until then, "Access Denied" may appear.</li>
              <li>For queries, contact us via WhatsApp.</li>
            </ul>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowPopup(false)} style={styles.popupButton}>
                I Understand
              </button>
              <Link to="/faqs" style={{ ...styles.popupButton, marginLeft: 'auto', textDecoration: 'none' }}>
                Want to Learn More
              </Link>
            </div>
          </div>
        </div>
      )}

      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Institution Sign Up</h2>
        <p style={styles.note}>
          All fields must be filled correctly as they will appear on your PDFs and cannot be changed later.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSignup} style={styles.form}>
          <label style={styles.label}>Institution Name</label>
          <input
            type="text"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Upload Your Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files[0])}
            required
            style={styles.input}
          />

          <label style={styles.label}>Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Re-type Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div style={styles.links}>
          <p>
            Already have an account? <Link to="/auth/login" style={styles.link}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(to right, #e0eafc, #cfdef3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    minHeight: '100vh',
  },
  formWrapper: {
    background: '#fff',
    padding: '2.5rem',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '800px',
    marginTop: '4rem',
    marginBottom: '2rem',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1rem',
    color: '#003f88',
  },
  note: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#d9534f',
    fontSize: '0.95rem',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '0.3rem',
    fontWeight: '500',
    color: '#444',
    fontSize: '0.9rem',
  },
  input: {
    padding: '0.75rem',
    marginBottom: '1.2rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    padding: '0.8rem',
    backgroundColor: '#003f88',
    color: '#fff',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  links: {
    marginTop: '1.5rem',
    textAlign: 'center',
  },
  link: {
    color: '#003f88',
    textDecoration: 'none',
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
    textAlign: 'center',
  },

  // Popup
  popupOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popupBox: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '10px',
    maxWidth: '600px',
    width: '90%',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    textAlign: 'left',
  },
  popupButton: {
    marginTop: '1.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#003f88',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  }
};

export default SignupPage;
