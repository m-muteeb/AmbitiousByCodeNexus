import React from "react";
import { Routes, Route } from "react-router-dom";

// Page Components
import HomePage from "./pages/Frontend/HomePage";
import FrontEnd from "./pages/Frontend/index";
import AuthRouter from "./pages/Auth/index";
import Discussion from "./pages/Discussion/index";
import Institution from "./pages/Institution/index";
import Dashboard from "./pages/AdminDashboard/index";
import NotFound from "./pages/NotFound";
import ResultSearch from "./pages/StudentPortal/ResultSearch";
import TestSupabase from "./pages/TestSupabase";

// Components
import PrivateRoute from "./components/PrivateRoute";

const Router = () => {
    return (
        <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />

            {/* Frontend Routes - Notes, About, Contact, etc. */}
            <Route path="/*" element={<FrontEnd />} />

            {/* Auth Routes */}
            <Route path="/auth/*" element={<AuthRouter />} />

            {/* Discussion Forum */}
            <Route path="/fourm" element={<Discussion />} />

            {/* Institution/Paid Test Series Page */}
            <Route path="/institutionpage" element={<Institution />} />

            {/* Student Result Portal */}
            <Route path="/result-portal" element={<ResultSearch />} />

            {/* Supabase Test Page - for debugging */}
            <Route path="/test-supabase" element={<TestSupabase />} />

            {/* Admin Dashboard Routes */}
            <Route
                path="/dashboard/*"
                element={
                    <PrivateRoute requiredRoles={['admin', 'superadmin']}>
                        <Dashboard />
                    </PrivateRoute>
                }
            />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default Router;
