import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AddContent from './AddTopic'
import ManageContent from './ManageTopic'
import AllowUsers from './AllowUsers'

export default function Dashboard() {
  return (
    <>
    <Routes>
        <Route path="addContent" element={< AddContent/>} />
        <Route path="manageContent" element={<ManageContent/>} />
        <Route path="allowusers" element={<AllowUsers/>} />

        
    </Routes>
      
    </>
  )
}
