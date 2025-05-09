import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return null;
    }

    return (
        <section className="relative min-h-screen overflow-hidden text-left py-12 px-8 bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] mt-16">
            <div className="absolute inset-0 wave-bg" />

            <motion.div
                className="max-w-6xl mx-auto relative z-10"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                {/* Welcome Heading */}
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[#9DE2E2]">
                    Welcome, {user.name}!
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Observability Card */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col justify-between p-8 bg-gradient-to-br from-black-900 to-blue-400 rounded-2xl shadow-lg hover:shadow-2xl transition-transform duration-300 ease-out"
                    >
                        <div>
                            <h2 className="text-4xl font-extrabold text-white mb-4">
                                Observability
                            </h2>
                            <p className="text-blue-200 leading-relaxed">
                                Consolidate your logs, metrics, application traces, and system
                                availability with purpose-built UIs.
                            </p>
                        </div>
                        <a
                            href="/observability"
                            className="mt-6 inline-block text-center font-semibold text-indigo-900 bg-white px-5 py-3 rounded-full hover:bg-opacity-90 transition-colors"
                        >
                            Get Observability
                        </a>
                    </motion.div>

                    {/* Analytics Card */}
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="flex flex-col justify-between p-8 bg-gradient-to-br from-black-900 to-blue-400 rounded-2xl shadow-lg hover:shadow-2xl transition-transform duration-300 ease-out"
                    >
                        <div>
                            <h2 className="text-4xl font-extrabold text-white mb-4">
                                Analytics
                            </h2>
                            <p className="text-green-200 leading-relaxed">
                                Explore, visualize, and analyze your data using a powerful suite of
                                analytical tools and applications.
                            </p>
                        </div>
                        <a
                            href="/analytics"
                            className="mt-6 inline-block text-center font-semibold text-emerald-900 bg-white px-5 py-3 rounded-full hover:bg-opacity-90 transition-colors"
                        >
                            Get Analytics
                        </a>
                    </motion.div>
                </div>


                {/* Get Started Section */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                    {/* Text Content */}
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-4 text-[#9DE2E2]">
                            Get started by adding integrations
                        </h2>
                        <p className="text-gray-300 mb-6">
                            To start working with your data, use one of our many ingest options. Collect data from an app or service,
                            or upload a file. If you're not ready to use your own data, try our sample dataset.
                        </p>
                        <Link
                            to="/integrations"
                            className="inline-block px-6 py-3 rounded-lg bg-[#00F0FF] text-[#0B0C20] font-semibold hover:bg-[#00dde9] transition-colors"
                        >
                            Add Integrations!
                        </Link>
                    </div>

                    {/* Image Placeholder - Replace with actual image */}
                    <div className="flex-1 flex justify-end">
                        <div className="w-96 h-64 bg-gray-700 rounded-xl opacity-.6 overflow-hidden relative">
                            <img
                                src="/analysis.gif"
                                alt="Analysis Animated Icon"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>



                </div>
            </motion.div>

            {/* Background Animations */}
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

export default Dashboard;