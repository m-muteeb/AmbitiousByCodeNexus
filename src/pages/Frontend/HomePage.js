import React, { useEffect } from "react";
import Hero from "../../components/Home/Hero";
import Testimonial from "../../components/Home/Testimonial";
import RecentPost from "../../components/Home/RecentPost";
import OurTrack from "../../components/Home/OurTrack";
import CardSection from "../../components/Home/CardSection";
import Premium from "../../components/Home/Premium";

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Hero />
      <CardSection />
      <OurTrack />
      <Premium />
      <RecentPost />
      <Testimonial />
    </>
  );
};

export default HomePage;
