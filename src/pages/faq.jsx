import { motion } from "framer-motion";
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const faqCategories = [
    {
        name: "Linux Logging",
        items: [
            {
                question: "How do I collect system logs from Linux servers?",
                answer: "Opsentra automatically collects logs from systemd-journald, syslog, and custom log files. Our agent installs in seconds and begins streaming logs to your dashboard immediately."
            },
            {
                question: "Can I filter logs by severity level?",
                answer: "Yes, you can filter by emergency, alert, critical, error, warning, notice, info, and debug levels. Create custom views for different severity thresholds."
            },
            {
                question: "How secure is Linux log collection?",
                answer: "All logs are encrypted in transit and at rest. We support role-based access control and integration with your existing security protocols."
            }
        ]
    },
    {
        name: "AWS Integration",
        items: [
            {
                question: "Which AWS services are supported?",
                answer: "We support CloudWatch Logs, EC2, Lambda, ECS, S3, API Gateway, and more. Full list of 25+ services available in our documentation."
            },
            {
                question: "How do I connect my AWS account?",
                answer: "Use our CloudFormation template for secure IAM role creation. Connection takes <2 minutes with guided setup."
            },
            {
                question: "Can I reduce CloudWatch costs?",
                answer: "Yes, our smart filtering helps eliminate redundant logs before they reach CloudWatch, reducing storage costs by up to 70%."
            }
        ]
    },
    {
        name: "Docker & Kubernetes",
        items: [
            {
                question: "How are container logs collected?",
                answer: "We collect stdout/stderr from all containers via Docker log drivers. Kubernetes deployments automatically discover pods and namespaces."
            },
            {
                question: "Do you support ephemeral containers?",
                answer: "Yes, we capture logs from short-lived containers and retain them based on your retention policies."
            },
            {
                question: "Can I monitor cluster health?",
                answer: "Integrated dashboard shows node metrics, pod status, and cluster events alongside logs for full observability."
            }
        ]
    },
    {
        name: "General",
        items: [
            {
                question: "What's the retention period?",
                answer: "Configurable from 7 days to 7 years. Enterprise plans include cold storage archiving."
            },
            {
                question: "How is access controlled?",
                answer: "RBAC with SSO/SAML support. Define team permissions at organization, project, or log stream level."
            },
            {
                question: "Do you comply with GDPR/HIPAA?",
                answer: "Yes, we're SOC 2 Type II certified with options for EU/US data residency. Full compliance documentation available."
            }
        ]
    }
];

const Faq = () => {
    return (
        <section className="min-h-screen bg-gradient-to-br from-[#0B0C20] to-[#1D1F3A] text-white py-20 px-6">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold text-center mb-6 text-[#9DE2E2]">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-gray-300 text-center mb-12 max-w-3xl mx-auto">
                        Everything you need to know about centralized logging with Opsentra. Can't find an answer?
                        <a href="/contact" className="text-[#00C2FF] hover:underline ml-2">
                            Contact our team
                        </a>
                    </p>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2">
                    {faqCategories.map((category, categoryIndex) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: categoryIndex * 0.2 }}
                            className="bg-[#13152D] border border-[#2A2B45] rounded-xl"
                        >
                            <h2 className="text-2xl font-semibold p-6 border-b border-[#2A2B45] text-[#9DE2E2]">
                                {category.name}
                            </h2>
                            <div className="p-6 space-y-4">
                                {category.items.map((item, itemIndex) => (
                                    <Disclosure key={item.question}>
                                        {({ open }) => (
                                            <div className="border-b border-[#2A2B45] last:border-0 pb-4">
                                                <Disclosure.Button className="flex w-full items-center justify-between text-left">
                                                    <span className="text-lg font-medium text-gray-100">
                                                        {item.question}
                                                    </span>
                                                    <ChevronDownIcon
                                                        className={`${open ? 'rotate-180 transform' : ''
                                                            } h-5 w-5 text-[#9DE2E2] transition-transform`}
                                                    />
                                                </Disclosure.Button>
                                                <Disclosure.Panel className="mt-2 text-gray-300">
                                                    {item.answer}
                                                </Disclosure.Panel>
                                            </div>
                                        )}
                                    </Disclosure>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional CTA */}
                <motion.div
                    className="mt-20 text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h3 className="text-2xl font-bold text-[#9DE2E2] mb-4">
                        Still have questions?
                    </h3>
                    <p className="text-gray-300 mb-8">
                        Our support team is available 24/7 to help with your logging needs
                    </p>
                    <a
                        href="/contact"
                        className="inline-block bg-[#9DE2E2] hover:bg-[#7acccc] text-[#0B0C20] font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
                    >
                        Contact Support
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default Faq;