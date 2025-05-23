import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Logos from "../components/Logos";
import Careers from "../pages/Careers";
import Solutions from "../pages/Solutions";
import Why from "../pages/Why";
import Docs from "../pages/Docs";
import Login from "../auth/Login";
import Register from "../auth/Register";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Security from "../pages/Security";
import Usecase from "../pages/Usecase";
import Logmanagement from "../pages/Logmanagement";
import Infrastructure from "../pages/Infrastructure";
import Distributed from "../pages/Distributed";
import Blogs from "../pages/Blogs";
import Faq from "../pages/faq";
import Dashboard from "../components/Dashboard";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

// Protect a route
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
};

// Conditional Home route
const HomeRoute = () => {
  const { user } = useContext(AuthContext);
  return (
    <div>
      {user && 
      <>
      <Dashboard />
      </>
      }
      <Hero />
      <Features />
      <Logos />
    </div>
  );
};
const RouteHandler = () => (
  <Routes>
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/why" element={<Why />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/security" element={<Security />} />
      <Route path="/log-management" element={<Logmanagement />} />
      <Route path="/infrastructure-monitoring" element={<Infrastructure />} />
      <Route path="/distributed-tracing" element={<Distributed />} />
      <Route path="/usecase" element={<Usecase />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/faq" element={<Faq />} />
    {/* Public Routes */}
    <Route element={<PublicRoute />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<HomeRoute />} />
    </Route>

    {/* Protected Routes */}
    <Route element={<PrivateRoute />}>
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Route>

    {/* 404 Page */}
    <Route path="*" element={<h1>404 Not Found</h1>} />
  </Routes>
);


export default RouteHandler;
