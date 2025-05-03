// src/components/SignupPage.js
import React, { useState , useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, storage } from '../../config/firebase';
import { useNavigate , Link } from 'react-router-dom';
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const SignupPage = () => {
  const [institutionName, setInstitutionName] = useState('');
  const [email, setEmail] = useState('');
  const [logo, setLogo] = useState(null); // For logo image
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Handle logo upload to Firebase Storage
      let logoUrl = '';
      if (logo) {
        const logoRef = ref(storage, 'logos/' + logo.name); // Set a path in Firebase Storage
        const uploadTask = uploadBytesResumable(logoRef, logo);

        // Wait for upload completion
        await uploadTask;

        // Get the download URL
        logoUrl = await getDownloadURL(logoRef);
      }

      // Add user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        institutionName,
        email,
        logoUrl: logoUrl || '', // If no logo, leave it blank
        address,
        phoneNumber,
        role: 'user', // Default role
      });

      // Redirect to institution page
      navigate('/institutionpage');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Sign Up</h2>
        <p style={styles.note}>All fields must be filled correctly as they can't be changed afterward.</p>
        
        {error && <p style={styles.error}>{error}</p>}
        
        <form onSubmit={handleSignup} style={styles.form}>
          <input
            type="text"
            placeholder="Institution Name"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files[0])}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm Password"
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
          <p style={{ marginTop: '1rem' }}>
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
  },
  formWrapper: {
    background: '#fff',
    padding: '3rem',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '900px',
    marginTop: '6rem',
    marginBottom: '2rem',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333',
  },
  note: {
    textAlign: 'center',
    marginBottom: '1rem',
    color: '#e04a4a',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem 1rem',
    backgroundColor: '#003f88',
    color: '#fff',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  links: {
    marginTop: '1rem',
    textAlign: 'center',
  },
  link: {
    color: '#003f88',
    textDecoration: 'none',
    fontWeight: '500',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
    textAlign: 'center',
  },
};

export default SignupPage;
