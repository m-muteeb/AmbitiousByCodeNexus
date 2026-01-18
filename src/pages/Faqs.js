import React, { useState, useEffect } from "react";
import '../assets/css/faqs.css';

const faqsData = [
    {
        question: "Is Ambitious free to use?",
        questionUrdu: "کیا Ambitious  pk استعمال کرنا مفت ہے؟",
        answer: "Yes, Ambitious is completely free! However, for some special categories, we charge a small maintenance fee to support the platform.",
        answerUrdu: "جی ہاں، Ambitious مکمل طور پر مفت ہے! لیکن کچھ خاص زمروں کے لیے، ہم پلیٹ فارم کی معاونت کے لیے معمولی فیس لیتے ہیں۔"
    },
    {
        question: "How can I find past papers?",
        questionUrdu: "میں پرانے پرچے کیسے تلاش کر سکتا ہوں؟",
        answer: "Go to the 'Featured Classes' section, select your class, then choose the subject, and finally select the file you need.",
        answerUrdu: "'Featured Classes' سیکشن میں جائیں، اپنی کلاس منتخب کریں، پھر مضمون چنیں، اور آخر میں مطلوبہ فائل منتخب کریں۔"
    },
    {
        question: "Can I download the PDFs?",
        questionUrdu: "کیا میں پی ڈی ایفز ڈاؤنلوڈ کر سکتا ہوں؟",
        answer: "Yes! When you open the PDF, click on the three dots (⋮) in the top corner and choose the 'Download' option.",
        answerUrdu: "جی ہاں! جب آپ پی ڈی ایف کھولیں، اوپر کونے میں تین نقطوں (⋮) پر کلک کریں اور 'Download' کا آپشن منتخب کریں۔"
    },
    {
        question: "What are Demo Tests?",
        questionUrdu: "ڈیمو ٹیسٹ کیا ہوتے ہیں؟",
        answer: "Demo tests provide limited access to selected material. Make sure all signup fields are filled correctly to avoid access issues.",
        answerUrdu: "ڈیمو ٹیسٹ محدود مواد تک رسائی فراہم کرتے ہیں۔ رسائی کے مسائل سے بچنے کے لیے سائن اپ کے تمام فیلڈز درست طریقے سے پُر کریں۔"
    },
    {
        question: "What are Premium Tests?",
        questionUrdu: "پریمیم ٹیسٹ کیا ہوتے ہیں؟",
        answer: "Premium tests give you full access to updated and smart material. After payment confirmation, you get lifetime access to exclusive content.",
        answerUrdu: "پریمیم ٹیسٹ آپ کو جدید اور ذہین مواد تک مکمل رسائی دیتے ہیں۔ ادائیگی کی تصدیق کے بعد، آپ کو مخصوص مواد تک تاحیات رسائی ملتی ہے۔"
    },
    {
        question: "Can I suggest test series or notes?",
        questionUrdu: "کیا میں ٹیسٹ سیریز یا نوٹس تجویز کر سکتا ہوں؟",
        answer: "Yes, absolutely! Go to the 'Suggest' or 'Contribute' section to share your ideas, and our team will try to implement them.",
        answerUrdu: "جی ہاں، بالکل! 'Suggest' یا 'Contribute' سیکشن میں جائیں اور اپنے خیالات شیئر کریں۔ ہماری ٹیم ان پر عمل درآمد کرنے کی کوشش کرے گی۔"
    }
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
        <div className="faq-container mb-4">
            <h2 className="faq-heading mt-4">Frequently Asked Questions (FAQs)</h2>

            {/* ✅ Alert Section */}
            <div style={{
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeeba",
                padding: "12px 16px",
                borderRadius: 4,
                color: "#856404",
                marginBottom: "20px"
            }}>
                ⚠️ <strong>Please be careful while signing up:</strong> fill all fields correctly as they will be shown on the downloaded PDFs.
            </div>

            {/* FAQ Accordion */}
            <div className="faq-list">
                {faqsData.map((faq, index) => (
                    <div
                        key={index}
                        className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                        onClick={() => toggleFAQ(index)}
                    >
                        <div className="faq-question">
                            {faq.question}
                            <br />
                            <span className="faq-question-urdu">{faq.questionUrdu}</span>
                            <span className="faq-icon">{activeIndex === index ? '-' : '+'}</span>
                        </div>
                        {activeIndex === index && (
                            <div className="faq-answer">
                                {faq.answer}
                                <br />
                                <span className="faq-answer-urdu">{faq.answerUrdu}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Faqs;
