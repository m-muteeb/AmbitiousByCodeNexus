import React from 'react'
import '../assets/css/ourtrack.css';
import TestPrep from '../assets/images/t4.jpg'
import Personal from '../assets/images/t1.jpg'
import Leadership from '../assets/images/t2.jpg'


export default function Project() {
  const tracks = [
    {
      title: "Exams & Test Preparation",
      description: "Master your exams with our comprehensive test preparation resources, designed to boost your confidence.",
      image: TestPrep,
    },
    {
      title: "Soft Skills ",
      description: "Covers communication skills, leadership, time management, productivity, and career development.",
      image: Personal,
    },
    {
      title: "Leadership & Management",
      description: "Focuses on decision-making,emotional intelligence, and team-building skills to develop effective leaders.",
      image: Leadership,
    },
  ];

  return (

    <div className="container">
    <div className='tracks'>
        <h1 className='text-center mb-2'>Our Tracks</h1>
        <p className='text-center mb-5'>Unlock limitless learning opportunities with our expertly curated tracks, designed to empower you with knowledge and skills for success.</p>
     
      <div className="row">
        {tracks.map((track, index) => (
          <div className="col-md-4 mb-4" key={index}>
            <div className="card project-card">
              <img src={track.image} className="card-img-top project-image" alt={track.title} />
              <div className="card-body">
                <h4 className="card-title">{track.title}</h4>
                <p className='card-description'>{track.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
    

   





    
  );
}
