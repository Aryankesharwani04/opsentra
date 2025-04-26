import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaGoogle, FaGithub } from "react-icons/fa";

const Login = () => {
  const handleGoogleLogin = () => {
    // TODO: integrate Google OAuth flow here
    console.log("Google login clicked");
  };

  const handleGithubLogin = () => {
    // TODO: integrate GitHub OAuth flow here
    console.log("GitHub login clicked");
  };

  return (
    <div className="min-h-screen bg-[#0B0C20] flex items-center justify-center px-4 pt-24 pb-8">
      <motion.div
        className="w-full max-w-md bg-[#1D1F3A] p-10 rounded-3xl shadow-2xl border border-[#2c2f57]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-extrabold text-center text-[#9DE2E2] mb-8">
          Welcome Back
        </h2>
        <form className="flex flex-col gap-6">
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
          <button
            type="submit"
            className="cursor-pointer bg-[#9DE2E2] text-black py-4 rounded-xl font-semibold hover:bg-white transition duration-300"
          >
            Log In
          </button>
        </form>

        <div className="mt-6 flex justify-center space-x-6">
          <button
            onClick={handleGoogleLogin}
            className="cursor-pointer p-3 rounded-full bg-[#2c2f57] hover:bg-[#3A3D67] transition"
            aria-label="Login with Google"
            title="Login with Google"
          >
            <FaGoogle className="w-6 h-6 text-[#9DE2E2]" />
          </button>
          <button
            onClick={handleGithubLogin}
            className="cursor-pointer p-3 rounded-full bg-[#2c2f57] hover:bg-[#3A3D67] transition"
            aria-label="Login with GitHub"
            title="Login with GitHub"
          >
            <FaGithub className="w-6 h-6 text-[#9DE2E2]" />
          </button>
        </div>

        <div className="text-sm text-center text-[#9DE2E2] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="underline">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
