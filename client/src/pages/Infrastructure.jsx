import React from "react";
import { motion } from "framer-motion";
import { MonitorDot, LayoutDashboard, AlertTriangle, ServerCrash, BarChart3, Link2 } from "lucide-react";

const features = [
  {
    icon: <MonitorDot className="w-8 h-8 text-[#9DE2E2]" />,
    title: "Full Visibility",
    description:
      "Gain complete insight into your infrastructure's health and performance with real-time monitoring and historical data."
  },
  {
    icon: <ServerCrash className="w-8 h-8 text-[#9DE2E2]" />,
    title: "Kubernetes 360",
    description:
      "Unify all your Kubernetes metrics and logs into one centralized view, enhancing debugging and observability."
  },
  {
    icon: <Link2 className="w-8 h-8 text-[#9DE2E2]" />,
    title: "Metrics Centralization",
    description:
      "Centralize metrics from Prometheus and third-party integrations for a cohesive infrastructure overview."
  },
  {
    icon: <LayoutDashboard className="w-8 h-8 text-[#9DE2E2]" />,
    title: "Advanced Dashboarding",
    description:
      "Use interactive dashboards to visualize performance data and trends with customizable widgets and graphs."
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-[#9DE2E2]" />,
    title: "Data Correlation",
    description:
      "Easily investigate problems in context by correlating metrics, logs, and traces to find root causes quickly."
  },
  {
    icon: <AlertTriangle className="w-8 h-8 text-[#9DE2E2]" />,
    title: "Real-Time Alerting",
    description:
      "Stay ahead of issues with real-time alerts and notifications configured for key metrics and thresholds."
  }
];

const Infrastructure = () => {
  return (
    <div className="mt-6 bg-[#0B0C20] text-white min-h-screen px-6 py-20">
      <motion.h2
        className="text-5xl font-bold text-center text-[#9DE2E2] mb-14"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Infrastructure Monitoring
      </motion.h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-[#1D1F3A] p-6 rounded-2xl border border-[#2c2f57] shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4 mb-4">
              {feature.icon}
              <h3 className="text-xl font-semibold text-[#9DE2E2]">
                {feature.title}
              </h3>
            </div>
            <p className="text-gray-300 text-base">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* <div className="mt-20 flex justify-center">
        <motion.img
          src="/infrastructure-diagram.png"
          alt="Infrastructure Diagram"
          className="max-w-4xl w-full rounded-xl border border-[#2c2f57]"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        />
      </div> */}
    </div>
  );
};

export default Infrastructure;
