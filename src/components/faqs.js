import React, { useState, useEffect } from "react";
import '../assets/css/faqs.css'; // Adjust the path as necessary

const faqsData = [
  {
    question: "How can I download notes for all classes and subjects?",
    answer:
      "Navigate to the 'Notes' section in the main menu, select your class and subject, and download organized PDFs prepared by top educators.",
  },
  {
    question: "Where can I find past papers or guess papers for exam preparation?",
    answer:
      "Visit the 'Past Papers' or 'Guess Papers' tab, filter by class, subject, and year. We also offer smart guess papers to help you prep smartly.",
  },
  {
    question: "Can I publish my notes or study material on Ambitious with my institution’s logo?",
    answer:
      "Yes! Go to the 'Contribute' section, upload your content, and choose the option to include your institution's logo. We credit all contributors.",
  },
  {
    question: "Is Ambitious free to use or do I need a subscription?",
    answer:
      "Ambitious is 100% free! All notes, papers, and resources are accessible without charges. We believe in making education accessible to everyone.",
  },
  {
    question: "How can I request notes or papers that are currently not available on the site?",
    answer:
      "Use the 'Request Section' or contact our Live Chat. We try to upload requested content within 48 hours, depending on availability.",
  },
];

const Faqs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

   useEffect(() => {
        window.scrollTo(0, 0);
      }, []);

  return (
    <div className="faq-container mb-4 ">
      <h2 className="faq-heading mt-4">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqsData.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">
              {faq.question}
              <span className="faq-icon">{activeIndex === index ? '-' : '+'}</span>
            </div>
            {activeIndex === index && (
              <div className="faq-answer">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faqs;
