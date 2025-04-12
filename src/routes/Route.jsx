import React from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Logos from "../components/Logos";
import Careers from "../pages/Careers";
import Solutions from "../pages/Solutions";
import Why from "../pages/Why";
import Docs from "../pages/Docs";
import Freetrial from "../auth/Freetrial";
import Login from "../auth/Login";
import Register from "../auth/Register";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Security from "../pages/Security";
import Usecase from "../pages/Usecase";
import Logmanagement from "../pages/Logmanagement";
import Infrastructure from "../pages/Infrastructure";
import Distributed from "../pages/Distributed";

const RouteHandler = () => (
  <Routes>
    <Route
      path="/"
      element={
        <>
          <Hero />
          <Features />
          <Logos />
        </>
      }
    />
    <Route path="/solutions" element={<Solutions />} />
    <Route path="/why" element={<Why />} />
    <Route path="/docs" element={<Docs />} />
    <Route path="/careers" element={<Careers />} />
{/*     <Route path="/usecase" element={<Usecase />} /> */}
    <Route path="/free-trial" element={<Freetrial />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/security" element={<Security />} />
    <Route path="/log-management" element={<Logmanagement />} />
    <Route path="/infrastructure-monitoring" element={<Infrastructure />} />
    <Route path="/distributed-tracing" element={<Distributed />} />
    <Route path="*" element={<h1>404 Not Found</h1>} />


  </Routes>
);

export default RouteHandler;
