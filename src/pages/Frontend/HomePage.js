import React, { useEffect } from "react"; // <-- import useEffect
import Hero from '../../components/hero'
import CardSection from '../../components/cardsection'
import Premium from '../../components/premium'
import Testimonials from '../../components/testimonial'
import FormAuth from '../../components/formauth'
import Project from '../../components/ourTrack'
import Recentpost from '../../components/recentpost'

export default function HomePage() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Hero />
      <CardSection />
      <Project />
      <Premium />
      <Recentpost />
      <Testimonials />
      {/* <FormAuth /> */}
    </>
  )
}
