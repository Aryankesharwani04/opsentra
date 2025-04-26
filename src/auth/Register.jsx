import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaGoogle, FaGithub } from "react-icons/fa";

const Register = () => {
  const handleGoogleRegister = () => {
    // TODO: integrate Google OAuth registration flow
    console.log("Google register clicked");
  };

  const handleGithubRegister = () => {
    // TODO: integrate GitHub OAuth registration flow
    console.log("GitHub register clicked");
  };

  return (
    <div className="min-h-screen bg-[#0B0C20] flex items-center justify-center px-4 pt-24 pb-8">
      <motion.div
        className="w-full max-w-md bg-[#1D1F3A] p-8 rounded-3xl shadow-2xl border border-[#2c2f57]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-extrabold text-center text-[#9DE2E2] mb-8">
          Create Your Account
        </h2>
        <form className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Full Name"
            className="bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]"
          />
          <input
            type="email"
            placeholder="Email"
            className="bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]"
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-4 px-5 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]"
          />

          <button
            type="submit"
            className="bg-[#9DE2E2] text-black py-4 rounded-xl font-semibold hover:bg-white transition duration-300"
          >
            Register
          </button>
        </form>

        <div className="mt-6 flex justify-center space-x-6">
          <button
            onClick={handleGoogleRegister}
            className="cursor-pointer p-3 rounded-full bg-[#2c2f57] hover:bg-[#3A3D67] transition"
            aria-label="Register with Google"
            title="Register with Google"
          >
            <FaGoogle className="w-6 h-6 text-[#9DE2E2]" />
          </button>
          <button
            onClick={handleGithubRegister}
            className="cursor-pointer p-3 rounded-full bg-[#2c2f57] hover:bg-[#3A3D67] transition"
            aria-label="Register with GitHub"
            title="Register with GitHub"
          >
            <FaGithub className="w-6 h-6 text-[#9DE2E2]" />
          </button>
        </div>

        <div className="text-sm text-center text-[#9DE2E2] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="underline">
            Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
