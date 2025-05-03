import React from 'react';
import "../assets/css/testimonial.css";
// import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const testimonialsData = [
  {
    id: 1,
    name: 'Husnain Ali',
    role: 'Student',
    text: 'This platform transformed my learning experience! The interactive lessons and expert guidance made complex topics so easy to understand.',
    image: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(32).webp'
   
  },
  {
    id: 2,
    name: 'Rabia Ahmad',
    role: 'Teacher',
    text: 'I never thought online education could be this engaging! The well-structured courses and real-world examples kept me motivated throughout.',
    image: "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(2).webp"
  },
  {
    id: 3,
    name: 'Sarah Khan',
    role: 'Student',
    text: 'Thanks to this website, I gained the confidence to excel in my studies. The resources and supportive community made all the difference!',
     image: "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(31).webp"
    
  }
];

const Testimonials = () => {
  return (
    <section className="testimonial-section">
  <h1 className='test fw-bold '>What Student's Say</h1>
  <p className='mt-1 mb-3 fw-bold'>Hear from our students about how this platform has empowered their learning journey and helped them achieve academic success!</p>
  <div className="underline mb-4 ">

  </div>
  <div className="testimonial-cards mt-2">
    {testimonialsData.map(({ id, name, role, text, image }) => (
      <div key={id} className="testimonial-card">
        <div className="card-content">
          <p>{text}</p>
          <h4>{name}</h4>
          <span>{role}</span>
        </div>
       
      </div>
    ))}
  </div>

</section>

  );
};

export default Testimonials;
