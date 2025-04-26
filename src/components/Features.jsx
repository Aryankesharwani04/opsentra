import { motion } from "framer-motion";

const features = [
  {
    title: "Built on Open Source",
    text: "Leverage the power and flexibility of open-source tools—Elastic, OpenTelemetry, Grafana—and avoid vendor lock-in.",
  },
  {
    title: "Full Visibility into Your Stack",
    text: "See logs, metrics and traces from AWS, Docker, Linux, Jenkins and Kubernetes in one unified dashboard.",
  },
  {
    title: "Lower Observability Costs",
    text: "Optimize your data pipeline with sampling, tiered storage and intelligent retention to reduce your cloud bill.",
  },
  {
    title: "AI-Driven Insights",
    text: "Our AI agent automatically highlights anomalies, groups similar errors, and pinpoints root causes in seconds.",
  },
  {
    title: "Custom Alerts & Workflows",
    text: "Set up alerts on any log pattern or metric threshold, and trigger notifications or automated remediation scripts.",
  },
  {
    title: "Extensible Integrations",
    text: "Connect with Slack, PagerDuty, Jira and more to fit Opsentra seamlessly into your existing DevOps toolchain.",
  },
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
