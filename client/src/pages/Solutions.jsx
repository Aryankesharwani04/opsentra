import { motion } from "framer-motion";
import { Terminal, Server, Users, AlertCircle } from "lucide-react";
import * as SimpleIcons from 'simple-icons';
import Logos from '../components/Logos'; // 🔥 Update the path as you will provide

const solutions = [
  {
    title: "AWS",
    description: "Integrate Opsentra with your AWS CloudWatch to centralize logs from EC2, Lambda, S3, and more.",
    icon: "AWS",
    color: "#FF9900"
  },
  {
    title: "Docker",
    description: "Aggregate logs from all Docker containers into one clean, searchable interface.",
    icon: "Docker",
    color: "#2496ED"
  },
  {
    title: "Linux",
    description: "Centralize system logs from Linux servers with real-time tracking and filters.",
    icon: "Linux",
    color: "#FCC624"
  },
  {
    title: "Jenkins",
    description: "Automatically pull logs from Jenkins pipelines and jobs for CI/CD visibility.",
    icon: "Jenkins",
    color: "#D24939"
  },
  {
    title: "Kubernetes",
    description: "Monitor pods, services, and node logs in a unified K8s interface.",
    icon: "Kubernetes",
    color: "#326CE5"
  },
  {
    title: "Terraform",
    description: "Track infrastructure changes and deployment logs across environments.",
    icon: "Terraform",
    color: "#7B42BC"
  },
];

const personas = [
  {
    title: "Developers",
    icon: <Terminal size={32} className="text-[#9DE2E2]" />,
    description: "Debug faster with searchable logs and context-aware highlighting"
  },
  {
    title: "SREs & DevOps",
    icon: <Server size={32} className="text-[#9DE2E2]" />,
    description: "Real-time infrastructure insights and automated alerting"
  },
  {
    title: "Security Teams",
    icon: <AlertCircle size={32} className="text-[#9DE2E2]" />,
    description: "Audit trails and compliance monitoring with encrypted logging"
  },
  {
    title: "Engineering Managers",
    icon: <Users size={32} className="text-[#9DE2E2]" />,
    description: "Team-wide visibility and performance analytics"
  },
];

const Solutions = () => {
  return (
    <section className="mt-4 min-h-screen bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] text-white px-6 py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Hero Section */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#9DE2E2]">
            Unified Observability Platform
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Connect, analyze, and act on infrastructure logs across your entire stack
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {solutions.map((sol, index) => {
            const icon = SimpleIcons[`si${sol.icon.replace(/\s/g, '')}`];
            return (
              <motion.div
                key={sol.title}
                className="group relative bg-[#13152D] border-2 border-[#2A2E4A] rounded-2xl p-8 hover:border-[#9DE2E2] transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      className="h-12 w-12"
                      style={{ fill: sol.color }}
                      dangerouslySetInnerHTML={{ __html: icon?.path }}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-[#9DE2E2] mb-2">
                      {sol.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {sol.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Personas Section */}
        <motion.div 
          className="mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-4xl font-bold text-center mb-16 text-[#9DE2E2]">
            Built For Modern Teams
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {personas.map((persona) => (
              <div 
                key={persona.title}
                className="bg-[#13152D] border-2 border-[#2A2E4A] rounded-2xl p-8"
              >
                <div className="mb-4 text-[#9DE2E2]">{persona.icon}</div>
                <h3 className="text-2xl font-semibold mb-2">{persona.title}</h3>
                <p className="text-gray-300">{persona.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Logos Container Integration */}
        <motion.div 
          className="mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-[#9DE2E2]">
            Supported Technologies
          </h2>

          {/* ✅ Instead of repeating the logo scrolling logic, we import a reusable container */}
          <Logos />
          
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold mb-6 text-[#9DE2E2]">
            Ready to Unify Your Observability?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of engineers who've transformed their logging workflow with Opsentra
          </p>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border border-[#2A2E4A] rounded-full"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Solutions;
