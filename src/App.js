import React from 'react';
import './index.css'; // Importing the CSS file
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Bootstrap JS (for components like navbar, modals, tooltips, etc.)
import Header from './components/Header/header';
import Router from './Router';
import Footer from './components/Footer/footer';



   

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
      <Router/>
      </main>
      <Footer />
    
    
      
    </div>
  );
}

export default App;
