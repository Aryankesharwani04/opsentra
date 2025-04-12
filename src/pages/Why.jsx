import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Eye, Layers } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck size={32} className="text-[#00C2FF]" />,
    title: "Unified Logging",
    description: "View logs from AWS, Docker, Jenkins, Kubernetes, and Linux — all in one central place.",
  },
  {
    icon: <Zap size={32} className="text-[#00C2FF]" />,
    title: "AI-Powered Insights",
    description: "Let our smart engine filter noise and highlight what truly matters in real-time logs.",
  },
  {
    icon: <Eye size={32} className="text-[#00C2FF]" />,
    title: "Human-Readable Logs",
    description: "Formatted, readable, and searchable logs that help developers debug 3x faster.",
  },
  {
    icon: <Layers size={32} className="text-[#00C2FF]" />,
    title: "Developer First",
    description: "Built with a modern UI and features that developers and DevOps teams actually need.",
  },
];

const Why = () => {
  return (
    <section className="bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] py-20 px-6 text-white">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-bold text-center mb-14 text-[#9DE2E2]"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Why Opsentra?
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-[#13152D] border border-[#1F223A] rounded-lg p-6 hover:border-[#00C2FF] transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="flex items-center gap-4 mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-[#00C2FF]">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Why;
