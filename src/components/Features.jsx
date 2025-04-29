import { motion } from "framer-motion";

const features = [
  {
    title: "Unified Log Aggregation",
    text: "Collect and centralize logs from Docker, Linux, Jenkins, Terraform, and AWS into a single dashboard for seamless debugging.",
  },
  {
    title: "Real-Time Monitoring & Alerts",
    text: "Get notified instantly about system anomalies, failures, or unusual patterns with intelligent, customizable alerting.",
  },
  {
    title: "Seamless Integrations",
    text: "Easily connect with tools like Slack, Jira, PagerDuty, and Webhooks to integrate Opsentra into your existing DevOps workflows.",
  },
  {
    title: "Cost-Effective Observability",
    text: "Reduce monitoring costs with efficient log storage, smart sampling, and intelligent data retention policies tailored to your needs.",
  },
  {
    title: "Role-Based Access Control",
    text: "Secure your logs by defining user roles and permissions, ensuring only the right teams have access to sensitive information.",
  },
  {
    title: "Easy Onboarding",
    text: "Get started in minutes with simple agent installations and step-by-step guides for setting up Docker, Linux, Jenkins, Terraform, and AWS log forwarding.",
  }
];


const Features = () => {
  return (
    <section className="py-20 px-6 bg-[#0D0D12]">
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#9DE2E2]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Why Developers Choose Opsentra
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((f, idx) => (
          <motion.div
            key={idx}
            className="bg-[#1A1A2E] p-6 rounded-2xl hover:shadow-xl hover:shadow-[#00C2FF30] transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-4 text-[#00C2FF]">{f.title}</h3>
            <p className="text-gray-300">{f.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
