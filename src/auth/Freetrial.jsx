import React from "react";
import { motion } from "framer-motion";

const Freetrial = () => {
  return (
    <div className="mt-4 min-h-screen bg-[#0B0C20] flex items-center justify-center px-4 py-16">
      <motion.div
        className="w-full max-w-3xl bg-[#1D1F3A] p-10 md:p-16 rounded-3xl shadow-2xl border border-[#2c2f57]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#9DE2E2] mb-10">
          Take a Free Trial
        </h2>
        <form className="grid grid-cols-1 gap-6">
          <input type="email" placeholder="Business Email" className="input bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]" />
          <div className="flex flex-col md:flex-row gap-6">
            <input type="text" placeholder="First Name" className="input flex-1 bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]" />
            <input type="text" placeholder="Last Name" className="input flex-1 bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]" />
          </div>
          <input type="text" placeholder="Job Title" className="input bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]" />
          <input type="text" placeholder="Company Name" className="input bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]" />
          <select className="input bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]">
            <option>Company Size</option>
            <option>1-10</option>
            <option>11-50</option>
            <option>51-200</option>
            <option>201-1000</option>
            <option>1000+</option>
          </select>
          <input type="tel" placeholder="Work Phone" className="input bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]" />
          <select className="input bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]">
            <option>Country</option>
            <option>India</option>
            <option>United States</option>
            <option>Germany</option>
            <option>UK</option>
            <option>Canada</option>
          </select>
          <select className="input bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]">
            <option>Which product(s) are you interested in?</option>
            <option>Log Management</option>
            <option>Infrastructure Monitoring</option>
            <option>Security Analytics</option>
          </select>
          <textarea placeholder="Anything we should know?" rows="3" className="input bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]" />
          <button
            type="submit"
            className="bg-[#9DE2E2] text-black py-4 rounded-xl font-semibold hover:bg-white transition duration-300"
          >
            Request Demo
          </button>
          <p className="text-xs text-center text-[#9DE2E2] mt-2">
            This site is protected by reCAPTCHA and the Google {" "}
            <a href="#" className="underline">Privacy Policy</a> and {" "}
            <a href="#" className="underline">Terms of Service</a> apply.
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Freetrial;