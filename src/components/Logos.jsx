import React from "react";

const Logos = () => {
  const tools = [
    { name: 'AWS', icon: '☁️' },
    { name: 'Docker', icon: '🐳' },
    { name: 'Linux', icon: '🐧' },
    { name: 'Jenkins', icon: '⚙️' },
    { name: 'Kubernetes', icon: '⎈' },
    { name: 'Terraform', icon: '🏗️' },
    { name: 'Ansible', icon: '🔄' },
    { name: 'GitHub', icon: '🐙' },
    { name: 'GitLab', icon: '🦊' },
    { name: 'Prometheus', icon: '📊' },
    { name: 'Grafana', icon: '📈' },
    { name: 'Elasticsearch', icon: '🔍' },
  ];

  // duplicate the list for seamless marquee effect
  const duplicated = [...tools, ...tools];

  return (
    <section className="py-16 bg-[#0D0D12] px-6 border-t border-gray-800 overflow-hidden">
      <h2 className="text-center text-2xl font-bold text-[#9DE2E2] mb-12">
        Trusted by teams at
      </h2>

      <div className="relative w-full max-w-screen-xl mx-auto">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {duplicated.map((tool, idx) => (
            <div
              key={idx}
              className="inline-flex items-center mx-8 opacity-80 hover:opacity-100 transition-all duration-300 group"
              style={{ width: '160px' }}
            >
              <span className="text-4xl mr-3 transition-transform duration-300 group-hover:scale-110">
                {tool.icon}
              </span>
              <span className="text-[#9DE2E2] font-semibold text-lg transition-colors duration-300 group-hover:text-white">
                {tool.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};

export default Logos;