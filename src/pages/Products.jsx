// src/pages/Products.jsx
import { motion } from "framer-motion";

const productData = [
  {
    title: "Log Management",
    description: "Centralize, search, and analyze log data in real-time using ELK-as-a-service with Grafana visualizations.",
    color: "#00C2FF",
  },
  {
    title: "Infrastructure Monitoring",
    description: "Monitor the performance of servers, containers, and cloud-native infrastructure using built-in integrations.",
    color: "#00E6FF",
  },
  {
    title: "SIEM & Security Analytics",
    description: "Detect threats with real-time security event monitoring, correlation, and alerting using OpenSearch.",
    color: "#2FF3E0",
  },
];

const Products = () => {
  return (
    <div className="min-h-screen bg-[#0D0D12] text-white py-24 px-6">
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-[#9DE2E2]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Explore Our Products
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {productData.map((product, idx) => (
          <motion.div
            key={idx}
            className="p-6 rounded-2xl bg-[#1A1A2E] hover:shadow-xl hover:shadow-[#00C2FF30] transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2, duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-4" style={{ color: product.color }}>
              {product.title}
            </h3>
            <p className="text-gray-300">{product.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Products;
