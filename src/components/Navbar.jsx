import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 overflow-hidden ${
        scrolled
          ? "bg-[#0B0C20]/80 backdrop-blur-md shadow-md"
          : "bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A]"
      }`}
    >
    <div className="absolute inset-0 wave-bg" />
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 3 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            to="/"
            className="text-2xl font-bold text-[#00C2FF] hover:text-[#00e6ff]"
          >
            Opsentra
          </Link>
        </motion.div>

        <ul
          className={`md:flex gap-6 ${
            open ? "block" : "hidden"
          } absolute md:static top-16 left-0 w-full md:w-auto bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] md:bg-transparent px-6 py-4 md:p-0 rounded-xl md:rounded-none`}
        >
          <li><Link to="/products" className="text-white hover:text-[#00C2FF]">Products</Link></li>
          <li><Link to="/solutions" className="text-white hover:text-[#00C2FF]">Solutions</Link></li>
          <li><Link to="/pricing" className="text-white hover:text-[#00C2FF]">Pricing</Link></li>
          <li><Link to="/docs" className="text-white hover:text-[#00C2FF]">Docs</Link></li>
          <li><Link to="/company" className="text-white hover:text-[#00C2FF]">Company</Link></li>
        </ul>

        <div className="flex gap-4 items-center">
          <Link
            to="/login"
            className="border border-[#00C2FF] px-6 py-2 rounded-xl font-medium text-white hover:bg-[#00C2FF] hover:text-black transition"
          >
            Log In
          </Link>
          <Link
            to="/free-trial"
            className="bg-[#00C2FF] text-black px-6 py-2 rounded-xl font-medium hover:bg-white transition"
          >
            Start Free
          </Link>
          <div className="md:hidden cursor-pointer" onClick={() => setOpen(!open)}>
            {open ? <X className="text-white" /> : <Menu className="text-white" />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;