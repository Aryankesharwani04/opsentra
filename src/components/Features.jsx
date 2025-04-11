const Features = () => {
    return (
      <section className="py-20 px-6 bg-[#0D0D12]">
        <h2 className="text-3xl font-bold text-center mb-12">Why Developers Choose Opsentra</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            "Built on Open Source",
            "Full Visibility into Your Stack",
            "Lower Observability Costs",
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-[#1A1A1F] p-6 rounded-lg shadow-lg hover:scale-105 transition"
            >
              <h3 className="text-xl font-semibold mb-2">{feature}</h3>
              <p className="text-gray-400">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat, harum.
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  };
  export default Features;