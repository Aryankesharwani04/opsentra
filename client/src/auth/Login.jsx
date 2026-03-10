import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaGithub, FaSpinner } from "react-icons/fa";
import { api } from "../utils/api";
import { AuthContext } from "../contexts/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { token } = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem("token", token);
      login(token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`;
  };

  return (
    <div className="min-h-screen bg-[#0B0C20] flex items-center justify-center px-4 pt-24 pb-8">
      <motion.div
        className="w-full max-w-md bg-[#1D1F3A] p-10 rounded-3xl shadow-2xl border border-[#2c2f57]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-extrabold text-center text-[#9DE2E2] mb-4">
          Welcome Back
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-3 px-4 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]"
            required
            disabled={isLoading}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-3 px-4 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]"
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            className="relative flex items-center justify-center cursor-pointer bg-[#9DE2E2] text-black py-3 rounded-xl font-semibold hover:bg-white transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin w-5 h-5 text-black" />
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="mt-6 flex justify-center space-x-6">
          <button
            onClick={handleGoogleLogin}
            className="p-3 rounded-full bg-[#2c2f57] hover:bg-[#3A3D67] transition"
            aria-label="Login with Google"
            title="Login with Google"
            disabled={isLoading}
          >
            <FaGoogle className="w-6 h-6 text-[#9DE2E2]" />
          </button>
          <button
            onClick={handleGithubLogin}
            className="p-3 rounded-full bg-[#2c2f57] hover:bg-[#3A3D67] transition"
            aria-label="Login with GitHub"
            title="Login with GitHub"
            disabled={isLoading}
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