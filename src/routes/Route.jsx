import React from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Logos from "../components/Logos";
import Products from "../pages/Products";
import Company from "../pages/Company";
import Solutions from "../pages/Solutions";
import Pricing from "../pages/Pricing";
import Docs from "../pages/Docs";
import Freetrial from "../auth/Freetrial";
import Login from "../auth/Login";

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
    <Route path="/products" element={<Products />} />
    <Route path="/solutions" element={<Solutions />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/docs" element={<Docs />} />
    <Route path="/company" element={<Company />} />
    <Route path="/free-trial" element={<Freetrial />} />
    <Route path="/login" element={<Login />} />

  </Routes>
);

export default RouteHandler;