import React from "react";
import { motion } from "framer-motion";
import Logos from '../components/Logos';

const useCases = [
  {
    title: "Centralized Log Management",
    description:
      "No need to hop between different cloud platforms and terminals. Opsentra brings all your logs in one clean dashboard.",
  },
  {
    title: "Incident Detection & Root Cause Analysis",
    description:
      "Quickly trace issues from logs during outages or performance drops with rich filtering and search capabilities.",
  },
  {
    title: "DevOps Monitoring & Optimization",
    description:
      "Track CI/CD logs, infrastructure metrics, and application behavior to streamline deployment and operations.",
  },
  {
    title: "Compliance & Audit Logging",
    description:
      "Store and organize logs for regulatory compliance. Enable access control and encryption for sensitive data.",
  },
];

function Usecase() {
  return (
    <section className="mt-8 min-h-screen bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] text-white px-6 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-bold mb-16 text-center text-[#9DE2E2]"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Real World Use Cases
        </motion.h1>

        <div className="grid lg:grid-cols-2 gap-8 mb-24">
          {useCases.map((item, index) => (
            <motion.div
              key={item.title}
              className="group relative bg-[#13152D] border-2 border-[#2A2B45] rounded-2xl p-8 hover:border-[#9DE2E2] transition-all duration-300 hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#9DE2E2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h3 className="text-2xl font-semibold text-[#9DE2E2] mb-4">
                {item.title}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-16 text-center text-[#9DE2E2]">
            Supported Technologies
          </h2>

          {/* Replace manual marquee with Logos container */}
          <Logos />
        </motion.div>
      </div>
    </section>
  );
}

export default Usecase;
