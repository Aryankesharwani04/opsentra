import { motion } from "framer-motion";

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
        {[
          "Built on Open Source",
          "Full Visibility into Your Stack",
          "Lower Observability Costs",
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            className="bg-[#1A1A2E] p-6 rounded-2xl hover:shadow-xl hover:shadow-[#00C2FF30] transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2, duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-4 text-[#00C2FF]">{feature}</h3>
            <p className="text-gray-300">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat, harum.
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
