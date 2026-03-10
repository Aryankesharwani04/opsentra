// const Blogs = () => {
//     const featuredPosts = [
//         {
//             title: "Debugging AWS Lambda Cold Starts",
//             excerpt: "Learn how to identify and mitigate cold start issues in serverless functions",
//             date: "March 15, 2024",
//             readTime: "5 min read",
//             image: "https://images.unsplash.com/photo-1623479322729-28b25c16b011?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" // AWS Lambda
//         },
//         {
//             title: "Kubernetes Pod Crash Analysis",
//             excerpt: "Step-by-step guide to diagnosing failing pods in production clusters",
//             date: "March 12, 2024",
//             readTime: "8 min read",
//             image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" // Kubernetes
//         },
//         {
//             title: "Jenkins Pipeline Failures",
//             excerpt: "Common pitfalls and solutions for CI/CD pipeline failures",
//             date: "March 10, 2024",
//             readTime: "6 min read",
//             image: "https://images.unsplash.com/photo-1623479322729-28b25c16b011?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" // Jenkins
//         }
//     ];

//     const bugScenarios = [
//         { 
//             title: "Timeout Errors",
//             description: "Identifying and resolving service timeouts",
//             image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" // Timeout
//         },
//         { 
//             title: "Memory Leaks",
//             description: "Detecting memory leaks in containerized apps",
//             image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" // Memory
//         },
//         { 
//             title: "Network Latency",
//             description: "Diagnosing network-related performance issues",
//             image: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" // Network
//         }
//     ];

//     return (
//         <section className="min-h-screen bg-[#0B0C20] text-white py-12 px-4 sm:px-6 lg:py-16 ">
//             <div className="max-w-7xl mx-auto ">
//                 {/* Blog Hero Section */}
//                 <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
//                     <div className="lg:w-1/2">
//                         <h1 className="text-4xl sm:text-5xl font-bold text-[#9DE2E2] mb-6">
//                             Opsentra Blog
//                         </h1>
//                         <p className="text-xl text-gray-300">
//                             Insights, tutorials, and war stories from the frontline of DevOps observability.
//                         </p>
//                     </div>
//                     <div className="lg:w-1/2 mt-8 pt-8 pl-8 pr-8">
//                         <img
//                             src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
//                             alt="DevOps visualization"
//                             className="rounded-xl shadow-2xl border border-[#2A2B45] hover:scale-105 transition-transform duration-300"
//                         />
//                     </div>
//                 </div>

//                 {/* Bug Showcase Section */}
//                 <div className="mb-16">
//                     <h2 className="text-3xl font-bold text-[#9DE2E2] mb-8">Common Debugging Scenarios</h2>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {bugScenarios.map((scenario, index) => (
//                             <div key={index} className="group relative overflow-hidden rounded-xl border border-[#2A2B45] hover:border-[#9DE2E2] transition duration-300">
//                                 <img
//                                     src={scenario.image}
//                                     alt={scenario.title}
//                                     className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
//                                 />
//                                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B0C20] to-transparent p-6">
//                                     <h3 className="text-lg font-semibold text-white mb-2">
//                                         {scenario.title}
//                                     </h3>
//                                     <p className="text-gray-300 text-sm">
//                                         {scenario.description}
//                                     </p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Featured Blog Posts */}
//                 <div className="mb-16">
//                     <h2 className="text-3xl font-bold text-[#9DE2E2] mb-8">Latest Posts</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                         {featuredPosts.map((post, index) => (
//                             <article key={index} className="bg-[#1A1B2F] rounded-xl p-6 border border-[#2A2B45] hover:border-[#9DE2E2] transition duration-300">
//                                 <img
//                                     src={post.image}
//                                     alt={post.title}
//                                     className="w-full h-48 object-cover rounded-lg mb-4"
//                                 />
//                                 <div className="flex justify-between text-sm text-gray-400 mb-2">
//                                     <span>{post.date}</span>
//                                     <span>{post.readTime}</span>
//                                 </div>
//                                 <h3 className="text-xl font-bold text-[#9DE2E2] mb-2">{post.title}</h3>
//                                 <p className="text-gray-300">{post.excerpt}</p>
//                             </article>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Call to Action */}
//                 <div className="text-center">
//                     <h2 className="text-2xl font-bold text-[#9DE2E2] mb-4">Want More Content?</h2>
//                     <p className="text-2xl font-bold text-[#9DE2E2] mb-4">
//                         Explore our archive of technical guides, case studies, and best practices.
//                     </p>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default Blogs;
const Blogs = () => {
    const featuredPosts = [
        {
            title: "Debugging AWS Lambda Cold Starts",
            excerpt: "Learn how to identify and mitigate cold start issues in serverless functions",
            date: "March 15, 2024",
            readTime: "5 min read",
            image: "https://images.unsplash.com/photo-1623479322729-28b25c16b011?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
            link: "https://aws.amazon.com/blogs/compute/operating-lambda-performance-optimization-part-1/"
        },
        {
            title: "Kubernetes Pod Crash Analysis",
            excerpt: "Step-by-step guide to diagnosing failing pods in production clusters",
            date: "March 12, 2024",
            readTime: "8 min read",
            image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
            link: "https://sysdig.com/blog/debug-kubernetes-crashloopbackoff/"
        },
        {
            title: "Jenkins Pipeline Failures",
            excerpt: "Common pitfalls and solutions for CI/CD pipeline failures",
            date: "March 10, 2024",
            readTime: "6 min read",
            image: "https://images.unsplash.com/photo-1623479322729-28b25c16b011?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
            link: "https://stackoverflow.com/questions/37685958/failing-a-build-in-jenkinsfile"
        }
    ];

    const bugScenarios = [
        { 
            title: "Timeout Errors",
            description: "Identifying and resolving service timeouts",
            image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
            link: "https://awsfundamentals.com/blog/best-practices-to-avoid-and-troubleshoot-timeouts-in-aws-lambda"
        },
        { 
            title: "Memory Leaks",
            description: "Detecting memory leaks in containerized apps",
            image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
            link: "https://developer.ibm.com/articles/troubleshooting-memory-leaks-in-java-applications/"
        },
        { 
            title: "Network Latency",
            description: "Diagnosing network-related performance issues",
            image: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
            link: "https://www.datadoghq.com/blog/network-performance-monitoring/"
        }
    ];

    return (
        <section className="min-h-screen bg-[#0B0C20] text-white py-12 px-4 sm:px-6 lg:py-16">
            <div className="max-w-7xl mx-auto">
                {/* Blog Hero Section */}
                <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
                    <div className="lg:w-1/2">
                        <h1 className="text-4xl sm:text-5xl font-bold text-[#9DE2E2] mb-6">
                            Opsentra Blog
                        </h1>
                        <p className="text-xl text-gray-300">
                            Insights, tutorials, and war stories from the frontline of DevOps observability.
                        </p>
                    </div>
                    <div className="lg:w-1/2 mt-8 pt-8 pl-8 pr-8">
                        <img
                            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            alt="DevOps visualization"
                            className="rounded-xl shadow-2xl border border-[#2A2B45] hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </div>

                {/* Bug Showcase Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-[#9DE2E2] mb-8">Common Debugging Scenarios</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bugScenarios.map((scenario, index) => (
                            <a 
                                key={index} 
                                href={scenario.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group relative overflow-hidden rounded-xl border border-[#2A2B45] hover:border-[#9DE2E2] transition duration-300 block"
                            >
                                <img
                                    src={scenario.image}
                                    alt={scenario.title}
                                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B0C20] to-transparent p-6">
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {scenario.title}
                                    </h3>
                                    <p className="text-gray-300 text-sm">
                                        {scenario.description}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Featured Blog Posts */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-[#9DE2E2] mb-8">Latest Posts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredPosts.map((post, index) => (
                            <article 
                                key={index} 
                                className="bg-[#1A1B2F] rounded-xl p-6 border border-[#2A2B45] hover:border-[#9DE2E2] transition duration-300"
                            >
                                <a href={post.link} target="_blank" rel="noopener noreferrer" className="block">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                    />
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>{post.date}</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#9DE2E2] mb-2">{post.title}</h3>
                                    <p className="text-gray-300">{post.excerpt}</p>
                                </a>
                            </article>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[#9DE2E2] mb-4">Want More Content?</h2>
                    <p className="text-2xl font-bold text-[#9DE2E2] mb-4">
                        Explore our archive of technical guides, case studies, and best practices.
                    </p>
                    <a 
                        href="https://devops.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-[#9DE2E2] hover:bg-[#7acccc] text-[#0B0C20] font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
                    >
                        View All Articles
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Blogs;