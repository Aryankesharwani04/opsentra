import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#0B0B0E] text-sm text-gray-400 py-10 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-bold mb-4">Company</h4>
          <ul>
            <li><Link to="/about" className="hover:text-white transition duration-200">About</Link></li>
            <li><Link to="/careers" className="hover:text-white transition duration-200">Careers</Link></li>
            <li><Link to="/contact" className="hover:text-white transition duration-200">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Product</h4>
          <ul>
            <li><Link to="/" className="hover:text-white transition duration-200">Log Management</Link></li>
            <li><Link to="/" className="hover:text-white transition duration-200">Infrastructure Monitoring</Link></li>
            <li><Link to="/" className="hover:text-white transition duration-200">SIEM</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Resources</h4>
          <ul>
            <li><Link to="/" className="hover:text-white transition duration-200">Blog</Link></li>
            <li><Link to="/docs" className="hover:text-white transition duration-200">Docs</Link></li>
            <li><Link to="/contact" className="hover:text-white transition duration-200">Support</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Follow Us</h4>
          <ul>
            <li><Link to="/" className="hover:text-white transition duration-200">Twitter</Link></li>
            <li><Link to="/" className="hover:text-white transition duration-200">LinkedIn</Link></li>
            <li><Link to="/" className="hover:text-white transition duration-200">GitHub</Link></li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-10">© 2025 Opsentra. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
