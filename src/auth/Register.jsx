import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { api } from "../utils/api";
import { AuthContext } from "../contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Client-side password length validation
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { token } = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });
      localStorage.setItem("token", token);
      login(token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  const handleGithubRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`;
  };

  return (
    <div className="min-h-screen bg-[#0B0C20] flex items-center justify-center px-4 pt-24 pb-8">
      <motion.div
        className="w-full max-w-md bg-[#1D1F3A] p-8 rounded-3xl shadow-2xl border border-[#2c2f57]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-extrabold text-center text-[#9DE2E2] mb-4">
          Create Your Account
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            type="text"
            placeholder="Full Name"
            className="bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-3 px-4 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]"
            required
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="Email"
            className="bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-3 px-4 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]"
            required
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Password (min 6 chars)"
            className="bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-3 px-4 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]"
            required
            minLength={6}
          />
          <input
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            type="password"
            placeholder="Confirm Password"
            className="bg-[#0B0C20] text-white border border-[#3A3D67] rounded-xl py-3 px-4 placeholder:text-[#9DE2E2] focus:outline-none focus:ring-2 focus:ring-[#9DE2E2]"
            required
            minLength={6}
          />

          <button
            type="submit"
            className={`cursor-pointer py-3 rounded-xl font-semibold transition duration-300 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#9DE2E2] hover:bg-white text-black"
            }`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <div className="mt-6 flex justify-center space-x-6">
          <motion.button
            onClick={handleGoogleRegister}
            whileHover={{ scale: 1.1 }}
            className="p-3 rounded-full bg-[#2c2f57] hover:bg-[#3A3D67] transition"
            aria-label="Register with Google"
            title="Register with Google"
          >
            <FaGoogle className="w-6 h-6 text-[#9DE2E2]" />
          </motion.button>
          <motion.button
            onClick={handleGithubRegister}
            whileHover={{ scale: 1.1 }}
            className="p-3 rounded-full bg-[#2c2f57] hover:bg-[#3A3D67] transition"
            aria-label="Register with GitHub"
            title="Register with GitHub"
          >
            <FaGithub className="w-6 h-6 text-[#9DE2E2]" />
          </motion.button>
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
