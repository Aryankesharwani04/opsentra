import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation(); // 👈 track route

  // Close menu on route change
  useEffect(() => {
    setOpen(false); // 👈 auto close on route change
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0B0C20]/80 backdrop-blur-md shadow-md"
          : "bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A]"
      }`}
    >
      {/* <div className="absolute inset-0 wave-bg" /> */}
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
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

        {/* Navigation Links */}
        <ul
          className={`md:flex gap-6 ${
            open ? "block" : "hidden"
          } absolute md:static top-16 left-0 w-full md:w-auto bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] md:bg-transparent px-6 py-4 md:p-0 rounded-xl md:rounded-none`}
        >
          <li><Link to="/products" className="text-white hover:text-[#00C2FF]">Products</Link></li>
          <li><Link to="/solutions" className="text-white hover:text-[#00C2FF]">Solutions</Link></li>
          <li><Link to="/why" className="text-white hover:text-[#00C2FF]">Why Opsentra? </Link></li>
          <li><Link to="/docs" className="text-white hover:text-[#00C2FF]">Docs</Link></li>
          <li><Link to="/usecase" className="text-white hover:text-[#00C2FF]">Use Cases & Technology</Link></li>

          {/* Log In only for mobile menu */}
          {open && (
            <>
              <li className="md:hidden mt-3">
                <Link
                  to="/login"
                  className="block w-full border border-[#00C2FF] px-4 py-2 rounded-xl text-white hover:bg-[#00C2FF] hover:text-black transition"
                >
                  Log In
                </Link>
              </li>
              <li className="md:hidden mt-2">
                <Link
                  to="/free-trial"
                  className="block w-full bg-[#00C2FF] text-black px-4 py-2 rounded-xl font-medium hover:bg-white transition"
                >
                  Start Free
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Action Buttons - hidden below 550px */}
        <div
          className={`items-center gap-2 hidden md:flex ${
            open ? "hidden" : "flex"
          }`}
        >
          <Link
            to="/login"
            className="border border-[#00C2FF] px-4 py-2 rounded-xl font-medium text-white hover:bg-[#00C2FF] hover:text-black transition"
          >
            Log In
          </Link>
          <Link
            to="/free-trial"
            className="bg-[#00C2FF] text-black px-4 py-2 rounded-xl font-medium hover:bg-white transition"
          >
            Start Free
          </Link>
        </div>

        {/* Burger Icon */}
        <div className="md:hidden cursor-pointer ml-3 z-50" onClick={() => setOpen(!open)}>
          {open ? <X className="text-white" /> : <Menu className="text-white" />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
