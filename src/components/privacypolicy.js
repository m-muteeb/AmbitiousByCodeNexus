import React, { useEffect } from "react";
import '../assets/css/privacypolicy.css'; // Ensure this path is correct

const PrivacyPolicy = () => {
   useEffect(() => {
        window.scrollTo(0, 0);
      }, []);
  return (
    <div className="privacy-container">
      <h1 className="privacy-heading">Privacy Policy</h1>

      <p className="privacy-paragraph">
        At <strong>Ambitious</strong>, we take your privacy seriously and are committed to protecting the personal information of our users. We ensure that all data collected—such as names, emails, and browsing behavior—is used solely for educational and service improvement purposes. Under no circumstances will your data be sold, traded, or shared with any third parties without your explicit consent. Our platform uses secure protocols and encryption techniques to safeguard your information against unauthorized access or misuse.
      </p>

      <p className="privacy-paragraph">
        We strictly prohibit any attempt to misuse, copy, or redistribute educational content, notes, papers, or user-contributed material published on our website. All content is the intellectual property of <strong>Ambitious</strong> or its respective contributors and is protected under copyright law. Users who attempt to steal, replicate, or misuse content—either manually or through automated tools—will face permanent suspension, legal action, and other necessary penalties. We actively monitor suspicious activity to maintain a secure and trustworthy environment for all students and educators.
      </p>

      <p className="privacy-paragraph">
        By using Ambitious, you agree to abide by our policies and values. We encourage our community to report any security concerns, misuse of content, or harmful behavior to our support team immediately. Together, we aim to create a safe, respectful, and valuable learning space for everyone.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
