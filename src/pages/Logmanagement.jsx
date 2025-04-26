import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, GaugeCircle, Users, Wallet, Layers, Database, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <CheckCircle className="text-[#9DE2E2] w-8 h-8" />,
    title: "AI-Powered Root Cause Analysis",
    desc: "Leverage machine learning to detect anomalies and automatically pinpoint issues, drastically reducing manual log investigation."
  },
  {
    icon: <GaugeCircle className="text-[#9DE2E2] w-8 h-8" />,
    title: "Reduce MTTR",
    desc: "Minimize Mean Time To Resolution by proactively identifying log patterns and surfacing correlated errors and alerts."
  },
  {
    icon: <Users className="text-[#9DE2E2] w-8 h-8" />,
    title: "Empower Your Team",
    desc: "Enable teams to collaborate using shared views, annotations, and powerful search filters tailored to their roles."
  },
  {
    icon: <Wallet className="text-[#9DE2E2] w-8 h-8" />,
    title: "Optimize Cost",
    desc: "Tiered storage and data optimization reduce cost while keeping important logs instantly accessible."
  },
  {
    icon: <Database className="text-[#9DE2E2] w-8 h-8" />,
    title: "Data Optimization Hub",
    desc: "Customize log retention, sampling, and transformation rules to reduce noise and improve clarity."
  },
  {
    icon: <Layers className="text-[#9DE2E2] w-8 h-8" />,
    title: "Multi-Tiered Storage",
    desc: "Store logs based on usage frequency: hot, warm, and cold storage—all searchable from a unified interface."
  },
  {
    icon: <BarChart3 className="text-[#9DE2E2] w-8 h-8" />,
    title: "LogMetrics",
    desc: "Convert logs to structured metrics and visualize them to derive key insights and trends."
  }
];

const Logmanagement = () => {
  return (
    <div className="mt-8 bg-[#0B0C20] text-white py-20 px-4 md:px-20">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#9DE2E2]"
      >
        Intelligent Log Management
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {features.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-[#1D1F3A] border border-[#2c2f57] p-6 rounded-2xl shadow-lg hover:shadow-xl hover:border-[#9DE2E2] transition"
          >
            <div className="mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-[#9DE2E2]">{item.title}</h3>
            <p className="text-[#D1D5DB]">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* <div className="mt-20 flex justify-center">
        <img
          src="https://www.svgrepo.com/show/416500/server-data-connection.svg"
          alt="Log Flow Diagram"
          className="w-full max-w-3xl"
        />
      </div> */}
    </div>
  );
};

export default Logmanagement;
