import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Notes from '../../components/category/notes';
import SubNotes from '../../components/category/subnotes';
import Preview from "../../components/pdfviewer/index";
import AboutSection from './AboutPage';
import ContactSection from './ContactPage';
import Faqs from '../../components/faqs';
import PrivacyPolicy from '../../components/privacypolicy';
import EcatNotes from '../../components/category/EcatNotes';
import PrimaryContentBrowser from '../../components/Primary-Education/Index';

export default function FrontEnd() {
  return (
    <>
    <Routes>

        <Route path="/notes/:selectedClass/:category?/:subCategory?" element={<Notes />} />
        <Route path="/:selectedClass/:subject?/:ecatContentType?" element={<EcatNotes/>} />
        <Route path="/note" element={<PrimaryContentBrowser/>} />


        <Route path="/preview" element={<Preview/>} />

        {/* <Route path="/note/:subject" element={<SubNotes />} /> */}
        <Route path="/about" element={<AboutSection/>} />
        <Route path="/contact" element={<ContactSection/>} />
        <Route path="/faqs" element={<Faqs/>} />
        <Route path="/privacypolicy" element={<PrivacyPolicy/>} />zz

      
        
    </Routes>
      
    </>
  )
}
