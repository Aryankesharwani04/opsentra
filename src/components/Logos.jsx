import * as SimpleIcons from 'simple-icons';

const Logos = () => {
  const logos = [
    { name: "AWS", color: "#FF9900" },
    { name: "Kubernetes", color: "#326CE5" },
    { name: "Grafana", color: "#F46800" },
    { name: "Elasticsearch", color: "#005571" },
    { name: "Prometheus", color: "#E6522C" },
    { name: "Docker", color: "#2496ED" },
    { name: "Jenkins", color: "#D24939" },
    { name: "Terraform", color: "#7B42BC" },
  ];

  const duplicatedLogos = [...logos, ...logos];

  return (
    <section className="py-16 bg-[#0D0D12] px-6 border-t border-gray-800 overflow-hidden">
      <h2 className="text-center text-2xl font-bold text-[#9DE2E2] mb-12">
        Trusted by teams at
      </h2>
      
      <div className="relative w-full max-w-screen-xl mx-auto">
        <div className="animate-marquee whitespace-nowrap">
          {duplicatedLogos.map(({ name, color }, idx) => {
            const icon = SimpleIcons[`si${name.replace(/\s/g, '')}`];
            return (
              <div
                key={idx}
                className="inline-flex items-center mx-12 opacity-80 hover:opacity-100 transition-all duration-300 group"
                style={{ width: '200px' }}
              >
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 mr-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ fill: color }}
                  dangerouslySetInnerHTML={{ __html: icon?.path }}
                />
                <span className="text-[#9DE2E2] font-semibold text-xl tracking-wide transition-colors duration-300 group-hover:text-white
">
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-marquee {
          animation: marquee 40s linear infinite;
          display: inline-block;
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