import React from "react";
import { motion } from "framer-motion";

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

const technologies = ["AWS", "Docker", "Linux", "Jenkins", "Kubernetes", "Node.js", "Nginx", "MongoDB"];

function Usecase() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] text-white px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center text-[#9DE2E2]"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Real World Use Cases
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-10">
          {useCases.map((item, index) => (
            <motion.div
              key={item.title}
              className="bg-[#13152D] border border-[#1F223A] rounded-lg p-6 hover:border-[#00C2FF] transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <h3 className="text-xl font-semibold text-[#00C2FF] mb-2">
                {item.title}
              </h3>
              <p className="text-gray-300">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-[#9DE2E2]">Supported Technologies</h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-200">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="bg-[#1E213F] border border-[#2A2E4A] px-4 py-2 rounded-full hover:bg-[#00C2FF] hover:text-black transition"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Usecase;
