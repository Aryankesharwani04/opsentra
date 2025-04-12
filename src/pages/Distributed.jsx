import React from "react";
import { motion } from "framer-motion";
import { FaBug, FaProjectDiagram, FaMapMarkedAlt, FaBell, FaClock, FaCodeBranch, FaTools } from "react-icons/fa";

const Distributed = () => {
  return (
    <div className="min-h-screen bg-[#0B0C20] text-white px-6 py-16">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-[#9DE2E2] mb-8 text-center">
          Distributed Tracing
        </h1>
        <p className="text-lg text-center text-gray-300 mb-16">
          Surface and debug issues fast across microservices architecture with powerful tracing and real-time insights.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[#1D1F3A] rounded-2xl p-6 border border-[#2c2f57] shadow-lg">
            <FaBug className="text-3xl text-[#9DE2E2] mb-4" />
            <h2 className="text-xl font-semibold mb-2">Debug Issues in Microservices</h2>
            <p className="text-gray-400">
              Easily trace the flow of requests through various services to quickly identify and resolve bottlenecks or failures.
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-[#1D1F3A] rounded-2xl p-6 border border-[#2c2f57] shadow-lg">
            <FaClock className="text-3xl text-[#9DE2E2] mb-4" />
            <h2 className="text-xl font-semibold mb-2">Latency Root Cause Analysis</h2>
            <p className="text-gray-400">
              Isolate latency problems within microservices layers to reduce mean time to resolution (MTTR).
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-[#1D1F3A] rounded-2xl p-6 border border-[#2c2f57] shadow-lg">
            <FaTools className="text-3xl text-[#9DE2E2] mb-4" />
            <h2 className="text-xl font-semibold mb-2">Minimal Configuration</h2>
            <p className="text-gray-400">
              Begin monitoring microservices performance with nearly zero configuration and smart defaults.
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-[#1D1F3A] rounded-2xl p-6 border border-[#2c2f57] shadow-lg">
            <FaMapMarkedAlt className="text-3xl text-[#9DE2E2] mb-4" />
            <h2 className="text-xl font-semibold mb-2">System Architecture Map</h2>
            <p className="text-gray-400">
              Visualize your system architecture and track requests across services in real-time.
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-[#1D1F3A] rounded-2xl p-6 border border-[#2c2f57] shadow-lg">
            <FaCodeBranch className="text-3xl text-[#9DE2E2] mb-4" />
            <h2 className="text-xl font-semibold mb-2">OpenTelemetry Auto-Instrumentation</h2>
            <p className="text-gray-400">
              Leverage OpenTelemetry to automatically collect and export trace data without custom code.
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-[#1D1F3A] rounded-2xl p-6 border border-[#2c2f57] shadow-lg">
            <FaBell className="text-3xl text-[#9DE2E2] mb-4" />
            <h2 className="text-xl font-semibold mb-2">Real-Time Alerts</h2>
            <p className="text-gray-400">
              Stay on top of performance issues with intelligent, real-time alerts that notify you before problems escalate.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <img src="/tracing-diagram.png" alt="Tracing Architecture Diagram" className="mx-auto max-w-full rounded-xl border border-[#3A3D67] shadow-lg" />
          <p className="text-sm text-gray-500 mt-4">
            * Diagram showcasing service-to-service tracing and latency detection.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Distributed;
