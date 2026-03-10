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

const Logos = () => {
  const logos = [...tools, ...tools]; // duplicated for infinite scroll

  return (
    <section className="py-20 bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] px-6 border-t border-gray-800 overflow-hidden">
      <h2 className="text-center text-2xl font-bold text-[#9DE2E2] mb-12">
        Trusted by teams at
      </h2>

      <div className="relative w-full max-w-screen-xl mx-auto overflow-hidden">
        {/* Left and Right Fade */}
        <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-[#0D0D12] to-transparent z-20" />
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#0D0D12] to-transparent z-20" />

        {/* BACK ROW (Slower) */}
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

        {/* FRONT ROW (Faster) */}
        <div className="relative flex space-x-24 animate-scroll-fast z-10">
          {logos.map(({ name, iconName, color }, idx) => {
            const IconComponent = SIIcons[iconName];
            if (!IconComponent) return null;
            return (
              <div key={`front-${idx}`} className="flex items-center space-x-4 min-w-[200px] opacity-80 hover:opacity-100 group transition">
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
    </section>
  );
};

export default Logos;
