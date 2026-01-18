import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AddContent from './AddContent'
import ManageContent from './ManageTopic'
import AllowUsers from './AllowUsers'
import ManageResultPortal from './ResultPortal/ManageClasses'
import ResultReport from './ResultPortal/ResultReport'
import DashboardLayout from './Layout.jsx'
import AdminHome from './AdminHome.jsx'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="addContent" element={< AddContent />} />
        <Route path="manageContent" element={<ManageContent />} />
        <Route path="allowusers" element={<AllowUsers />} />

        {/* Result Portal Admin Routes */}
        <Route path="result-portal/manage" element={<ManageResultPortal />} />
        <Route path="result-portal/report" element={<ResultReport />} />
      </Routes>
    </DashboardLayout>
  )
}
