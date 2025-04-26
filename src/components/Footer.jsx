import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#0B0B0E] border-t border-[#1A1B2F]">
      <div className="max-w-7xl mx-auto px-6 py-16 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Branding Column */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#9DE2E2] mb-4">Opsentra</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering teams with open-source observability solutions for modern infrastructure.
              </p>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-300 font-medium mb-3">Subscribe to our newsletter</h3>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="bg-[#1A1B2F] border border-[#2A2B45] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#9DE2E2] flex-1"
                />
                <button className="bg-[#9DE2E2] hover:bg-[#7acccc] text-[#0B0C20] font-medium px-4 py-2 rounded-lg transition duration-300 text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[#9DE2E2] font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/log-management" className="text-gray-400 hover:text-[#9DE2E2] transition duration-200 text-sm">Log Management</Link></li>
                <li><Link to="/infrastructure-monitoring" className="text-gray-400 hover:text-[#9DE2E2] transition duration-200 text-sm">Infrastructure Monitoring</Link></li>
                <li><Link to="/distributed-tracing" className="text-gray-400 hover:text-[#9DE2E2] transition duration-200 text-sm">Distributed Tracing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#9DE2E2] font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/docs" className="text-gray-400 hover:text-[#9DE2E2] transition duration-200 text-sm">Documentation</Link></li>
                <li><Link to="/blogs" className="text-gray-400 hover:text-[#9DE2E2] transition duration-200 text-sm">Blog</Link></li>
                <li><Link to="/usecase" className="text-gray-400 hover:text-[#9DE2E2] transition duration-200 text-sm">Use Cases</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#9DE2E2] font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-400 hover:text-[#9DE2E2] transition duration-200 text-sm">About</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-[#9DE2E2] transition duration-200 text-sm">Careers</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-[#9DE2E2] transition duration-200 text-sm">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#1A1B2F] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Opsentra. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;