import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RouteHandler from "./routes/Route";
import Scrolltotop from "./utils/Scrolltotop";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <Router>
      <Scrolltotop />
      <div className="bg-[#0D0D12] text-white">
        <Navbar />
        <AuthProvider>
        <RouteHandler />
        </AuthProvider>
        <Footer />
      </div>
    </Router>
  );
}