import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Eye, Layers, Clock, BarChart, Server, Users, Link } from "lucide-react";
import * as SimpleIcons from 'simple-icons';
const features = [
  {
    icon: <ShieldCheck size={40} className="text-[#9DE2E2]" />,
    title: "Unified Logging",
    description: "View logs from AWS, Docker, Jenkins, Kubernetes, and Linux — all in one central place.",
    gradient: "from-[#9DE2E2]/20 to-[#9DE2E2]/5"
  },
  {
    icon: <Zap size={40} className="text-[#9DE2E2]" />,
    title: "AI-Powered Insights",
    description: "Smart noise filtering and real-time anomaly detection in log streams.",
    gradient: "from-[#00C2FF]/20 to-[#00C2FF]/5"
  },
  {
    icon: <Eye size={40} className="text-[#9DE2E2]" />,
    title: "Human-Readable Logs",
    description: "Structured, formatted logs with context-aware highlighting.",
    gradient: "from-[#9DE2E2]/20 to-[#9DE2E2]/5"
  },
  {
    icon: <Layers size={40} className="text-[#9DE2E2]" />,
    title: "Developer First",
    description: "Modern UI with features DevOps teams actually need.",
    gradient: "from-[#00C2FF]/20 to-[#00C2FF]/5"
  },
];

const statistics = [
  { icon: <Clock size={40} className="text-[#9DE2E2]" />, title: "Average Resolution Time", value: "2.4x", description: "Faster incident resolution compared to traditional tools" },
  { icon: <BarChart size={40} className="text-[#9DE2E2]" />, title: "Log Processing", value: "10TB+", description: "Daily log data processed across all clients" },
  { icon: <Server size={40} className="text-[#9DE2E2]" />, title: "System Uptime", value: "99.99%", description: "Guaranteed platform availability" },
  { icon: <Users size={40} className="text-[#9DE2E2]" />, title: "Active Teams", value: "500+", description: "DevOps teams using our platform daily" },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Lead DevOps Engineer",
    company: "TechCorp",
    text: "Opsentra revolutionized our log management. What used to take hours now takes minutes with their unified dashboard.",
  },
  {
    name: "Michael Chen",
    role: "CTO",
    company: "StartUpHub",
    text: "The AI-powered insights helped us identify production issues we didn't even know we had. Game changer!",
  },
];

const integrations = [
  { name: "AWS", color: "#FF9900" },
  { name: "Docker", color: "#2496ED" },
  { name: "Kubernetes", color: "#326CE5" },
  { name: "Jenkins", color: "#D24939" },
  { name: "Terraform", color: "#7B42BC" },
  { name: "Prometheus", color: "#E6522C" },
];

const Why = () => {
  const duplicatedIntegrations = [...integrations, ...integrations];

  return (
    <section className="bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] py-24 px-6 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-5xl font-bold text-center mb-6 text-[#9DE2E2]">
            Why Choose Opsentra?
          </h2>
          <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto">
            Transform your observability stack with developer-centric tools built for modern infrastructure
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative bg-[#13152D] border-2 border-[#2A2E4A] rounded-2xl p-8 hover:border-[#9DE2E2] transition-all duration-300 hover:-translate-y-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1,
                duration: 0.4,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-center h-16 w-16 bg-[#1A1B2F] rounded-xl border border-[#2A2E4A]">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-[#9DE2E2] mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statistics Section */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {statistics.map((stat, index) => (
            <div key={stat.title} className="bg-[#13152D] border-2 border-[#2A2E4A] rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                {stat.icon}
                <div>
                  <div className="text-4xl font-bold text-[#9DE2E2]">{stat.value}</div>
                  <div className="text-gray-300 text-sm">{stat.title}</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">{stat.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          className="space-y-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-4xl font-bold text-center text-[#9DE2E2]">
            What Our Users Say
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[#13152D] border-2 border-[#2A2E4A] rounded-2xl p-8">
                <p className="text-gray-300 text-lg mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#9DE2E2] rounded-full"></div>
                  <div>
                    <div className="font-semibold text-[#9DE2E2]">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">
                      {testimonial.role} @ {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Integrations Section */}
        <motion.div
          className="space-y-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-4xl font-bold text-center text-[#9DE2E2]">
            Seamless Integrations
          </h3>
          <div className="relative overflow-hidden py-6">
            <div className="animate-marquee whitespace-nowrap">
              {duplicatedIntegrations.map((tech, idx) => {
                const icon = SimpleIcons[`si${tech.name.replace(/\s/g, '')}`];
                return (
                  <div
                    key={idx}
                    className="inline-flex items-center mx-10 opacity-90 hover:opacity-100 transition-all duration-300 group"
                    style={{ width: '220px' }}
                  >
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      className="h-12 w-12 mr-4 transition-transform duration-300 group-hover:scale-110"
                      style={{ fill: tech.color }}
                      dangerouslySetInnerHTML={{ __html: icon?.path }}
                    />
                    <span className="text-2xl font-medium text-gray-100">
                      {tech.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-4xl font-bold text-[#9DE2E2]">
            Ready to Transform Your Observability?
          </h3>
          <p className="text-3xl text-[#9DE2E2] max-w-2xl mx-auto">
            Join hundreds of DevOps teams already streamlining their workflows with Opsentra
          </p>
          <div className="flex justify-center gap-6">
          </div>
        </motion.div>

        {/* Animated background elements */}
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

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Why;