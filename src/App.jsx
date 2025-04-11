import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RouteHandler from "./routes/Route";

export default function App() {
  return (
    <Router>
      <div className="bg-[#0D0D12] text-white">
        <Navbar />
        <RouteHandler />
        <Footer />
      </div>
    </Router>
  );
}