const Logos = () => {
    return (
      <section className="py-16 bg-[#0D0D12] px-6 border-t border-gray-800">
        <h2 className="text-center text-lg text-gray-400 mb-8">Trusted by teams at</h2>
        <div className="flex justify-center gap-10 flex-wrap">
          {["AWS", "Kubernetes", "Grafana", "Elastic", "Prometheus"].map((name, idx) => (
            <div key={idx} className="text-white text-lg font-medium opacity-70 hover:opacity-100">
              {name}
            </div>
          ))}
        </div>
      </section>
    );
  };
  export default Logos;