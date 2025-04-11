import { motion } from "framer-motion";

const solutions = [
  {
    title: "AWS",
    description:
      "Integrate Opsentra with your AWS CloudWatch to centralize logs from EC2, Lambda, S3, and more. No more juggling dashboards across services.",
  },
  {
    title: "Docker",
    description:
      "Aggregate logs from all your Docker containers into one clean, searchable interface. Detect issues and monitor deployments easily.",
  },
  {
    title: "Linux",
    description:
      "Centralize system logs from your Linux servers with real-time tracking and customizable filters for faster debugging and auditing.",
  },
  {
    title: "Jenkins",
    description:
      "Automatically pull logs from Jenkins pipelines and jobs. Get visibility into build failures, test reports, and CI/CD metrics.",
  },
  {
    title: "Kubernetes",
    description:
      "Monitor pods, services, and node logs in a unified interface. Tail logs live and diagnose K8s issues with intelligent tagging.",
  },
];

const Solutions = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] text-white px-6 py-20">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h1
          className="text-4xl font-bold mb-4 text-[#9DE2E2]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Powerful Integrations for Unified Observability
        </motion.h1>
        <p className="text-lg text-gray-300 mb-10">
          Opsentra unifies your logs from multiple platforms into a single pane of glass.
        </p>

        <div className="grid md:grid-cols-2 gap-8 text-left">
          {solutions.map((sol, index) => (
            <motion.div
              key={sol.title}
              className="bg-[#13152D] p-6 rounded-lg border border-[#1E213F] hover:border-[#00C2FF] transition"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-semibold text-[#00C2FF] mb-2">
                {sol.title}
              </h3>
              <p className="text-gray-300">{sol.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16">
          <motion.h2
            className="text-2xl font-bold mb-4 text-[#9DE2E2]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Who is it for?
          </motion.h2>
          <ul className="text-gray-300 list-disc list-inside space-y-2">
            <li>
              <strong>Developers</strong> – Debug faster with searchable logs across your full stack.
            </li>
            <li>
              <strong>SREs & DevOps</strong> – Get real-time infrastructure insights and trigger alerts.
            </li>
            <li>
              <strong>Startups & Enterprises</strong> – Monitor and secure environments with zero friction.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Solutions;
