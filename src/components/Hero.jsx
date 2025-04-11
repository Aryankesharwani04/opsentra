import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative flex items-center   min-h-screen  overflow-hidden text-left py-28 px-8 bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A]">
       <div className="absolute inset-0 wave-bg" />


      <motion.div
        className="max-w-5xl mx-auto relative z-10  md:text-left"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-extrabold leading-tight mb-6 text-[#9DE2E2]">
          All-in-one platform for unified observability and security
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mb-8">
          Seamlessly monitor, analyze, and optimize your applications and infrastructure with AI-powered insights and automation.
        </p>
        <Link to="/free-trial">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#9DE2E2] text-black font-semibold px-6 py-3 rounded-md hover:bg-white"
          >
            Start your free trial
          </motion.button>
        </Link>
      </motion.div>
      <motion.div
        className="absolute w-80 h-80 bg-[#00F0FF] opacity-10 rounded-full blur-3xl top-[-60px] left-[-60px]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      <motion.div
        className="absolute w-72 h-72 bg-[#00F0FF] opacity-10 rounded-full blur-2xl bottom-[-40px] right-[-40px]"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 5 }}
      />
    </section>
  );
};

export default Hero;
