"use client";

import * as SIIcons from "react-icons/si";

const tools = [
  { name: "AWS", iconName: "SiAmazonaws", color: "#FF9900" },
  { name: "Docker", iconName: "SiDocker", color: "#2496ED" },
  { name: "Linux", iconName: "SiLinux", color: "#FCC624" },
  { name: "Jenkins", iconName: "SiJenkins", color: "#D24939" },
  { name: "Kubernetes", iconName: "SiKubernetes", color: "#326CE5" },
  { name: "Terraform", iconName: "SiTerraform", color: "#7B42BC" },
  { name: "Ansible", iconName: "SiAnsible", color: "#EE0000" },
  { name: "GitHub", iconName: "SiGithub", color: "#181717" },
  { name: "GitLab", iconName: "SiGitlab", color: "#FC6D26" },
  { name: "Prometheus", iconName: "SiPrometheus", color: "#E6522C" },
  { name: "Grafana", iconName: "SiGrafana", color: "#F46800" },
  { name: "Elasticsearch", iconName: "SiElasticsearch", color: "#005571" },
];

const About = () => {
  const logos = [...tools, ...tools]; // duplicated for infinite scroll

  return (
    <section className="mt-14 min-h-screen bg-[#0B0C20] text-white py-12 px-4 sm:px-6 lg:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          <div className="lg:w-1/2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#9DE2E2] mb-6 leading-tight">
              See Everything. Secure Everything.
              <br />
              <span className="text-white">All with Open Source.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Opsentra is a centralized logging platform designed to unify logs
              from all your infrastructure — all in one place.
            </p>
          </div>
          <div className="lg:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
              alt="Dashboard visualization"
              className="rounded-xl shadow-2xl border border-[#2A2B45]"
            />
          </div>
        </div>

        {/* About Content */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-[#9DE2E2] mb-8">
            About Opsentra
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <p className="text-lg text-gray-300 mb-6">
                Opsentra unifies logs from AWS, Docker, Linux, Jenkins, and
                Kubernetes — all in one place. We make it easier for developers
                and DevOps teams to monitor, debug, and optimize infrastructure
                with clear, readable, and actionable log data.
              </p>
              <p className="text-lg text-gray-300">
                With AI-powered parsing and an intuitive dashboard, Opsentra
                reduces noise and highlights what truly matters. Say goodbye to
                hopping across services — and hello to unified visibility.
              </p>
            </div>
            <div>
              <p className="text-lg text-gray-300 mb-6">
                Our open-source approach ensures transparency and allows the
                community to contribute to making logging better for everyone.
              </p>
              <p className="text-lg text-gray-300">
                Built by DevOps engineers for DevOps engineers, we understand
                the pain points of managing complex infrastructure logs.
              </p>
            </div>
          </div>
        </div>

        {/* Animated Logos Section */}
        <div className="py-20 bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] px-6 border-t border-gray-800 overflow-hidden">
          <h2 className="text-center text-2xl font-bold text-[#9DE2E2] mb-12">
            Integrated with Your Favorite Tools
          </h2>

          <div className="relative w-full max-w-screen-xl mx-auto overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-[#0D0D12] to-transparent z-20" />
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#0D0D12] to-transparent z-20" />

            {/* BACK ROW */}
            <div className="absolute top-1/2 -translate-y-1/2 flex space-x-24 animate-scroll-slow opacity-30 z-0">
              {logos.map(({ name, iconName, color }, idx) => {
                const IconComponent = SIIcons[iconName];
                if (!IconComponent) return null;
                return (
                  <div key={`back-${idx}`} className="flex items-center space-x-4 min-w-[200px]">
                    <IconComponent size={36} color={color} />
                    <span className="text-[#9DE2E2] font-semibold text-lg">{name}</span>
                  </div>
                );
              })}
            </div>

            {/* FRONT ROW */}
            <div className="relative flex space-x-24 animate-scroll-fast z-10">
              {logos.map(({ name, iconName, color }, idx) => {
                const IconComponent = SIIcons[iconName];
                if (!IconComponent) return null;
                return (
                  <div
                    key={`front-${idx}`}
                    className="flex items-center space-x-4 min-w-[200px] opacity-80 hover:opacity-100 group transition"
                  >
                    <IconComponent
                      size={40}
                      color={color}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="text-[#9DE2E2] font-semibold text-xl tracking-wide transition-colors duration-300 group-hover:text-white">
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <style jsx>{`
            @keyframes scrollFast {
              0% {
                transform: translateX(0%);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            @keyframes scrollSlow {
              0% {
                transform: translateX(0%);
              }
              100% {
                transform: translateX(-25%);
              }
            }
            .animate-scroll-fast {
              animation: scrollFast 30s linear infinite;
            }
            .animate-scroll-slow {
              animation: scrollSlow 60s linear infinite;
            }
            .animate-scroll-fast:hover,
            .animate-scroll-slow:hover {
              animation-play-state: paused;
            }
          `}</style>
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <h2 className="text-3xl font-bold text-[#9DE2E2] mb-6">
            Ready to Simplify Your Logging?
          </h2>
          <p className="text-3xl font-bold text-[#9DE2E2] mb-6">
            Join thousands of developers and DevOps teams who trust Opsentra
            for their logging needs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
