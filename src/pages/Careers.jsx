const Careers = () => {
  // Current open positions (can be fetched from API later)
  const openPositions = [
    {
      title: "Frontend Developer (React)",
      type: "Full-time/Contract",
      description: "Help build our dashboard UI with React and Tailwind CSS. Experience with data visualization a plus.",
      status: "Hiring soon"
    },
    {
      title: "DevOps Engineer",
      type: "Full-time/Contract",
      description: "Work on our core logging platform and infrastructure integrations. Strong Kubernetes and cloud experience preferred.",
      status: "Hiring soon"
    },
    {
      title: "Open Source Contributor",
      type: "Part-time/Volunteer",
      description: "Contribute to any part of our stack. Great for building your portfolio and gaining real-world experience.",
      status: "Accepting applications"
    }
  ];

  // Benefits/Perks
  const benefits = [
    { icon: "🌍", title: "Remote First", description: "Work from anywhere in the world" },
    { icon: "🚀", title: "Cutting Edge Tech", description: "Work with modern DevOps tools" },
    { icon: "🧠", title: "Mentorship", description: "Learn from experienced engineers" },
    { icon: "🛠️", title: "Build in Public", description: "Contribute to meaningful OSS" },
    { icon: "⏱️", title: "Flexible Hours", description: "Work when you're most productive" },
    { icon: "📈", title: "Growth Potential", description: "Early team member advantages" }
  ];

  return (
    <section className="mt-16 min-h-screen bg-[#0B0C20] text-white py-12 px-4 sm:px-6 lg:py-16">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#9DE2E2] mb-6">
            Help Build Opsentra
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're assembling our founding team to revolutionize infrastructure logging.
            Join us in this early stage and help shape the product from the ground up.
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-[#1A1B2F] rounded-xl p-8 mb-16 border border-[#2A2B45]">
          <h2 className="text-2xl font-bold text-[#9DE2E2] mb-4">Where We Are</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">🚧 Building Phase</h3>
              <p className="text-gray-300">
                We're currently developing the core platform. This is your chance to get in early and influence the architecture.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">🧑‍💻 Small Team</h3>
              <p className="text-gray-300">
                You'll work directly with the founders and have significant ownership over your work.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">🌱 Growth Potential</h3>
              <p className="text-gray-300">
                Early contributors will have opportunities to grow into leadership roles as we scale.
              </p>
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-[#9DE2E2] mb-8 text-center">Potential Roles</h2>
          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-[#1A1B2F] rounded-lg p-6 border border-[#2A2B45] hover:border-[#9DE2E2] transition duration-300">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{position.title}</h3>
                    <p className="text-gray-400">{position.type}</p>
                  </div>
                  <span className="px-3 py-1 bg-[#0B0C20] text-[#9DE2E2] rounded-full text-sm font-medium">
                    {position.status}
                  </span>
                </div>
                <p className="mt-4 text-gray-300">{position.description}</p>
                <button className="mt-4 text-[#9DE2E2] hover:text-[#7acccc] font-medium transition duration-300">
                  Express Interest →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-[#9DE2E2] mb-8 text-center">Why Join Now?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-[#1A1B2F] rounded-lg p-6 hover:bg-[#2A2B45] transition duration-300">
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-3xl mx-auto text-center bg-[#1A1B2F] rounded-xl p-8 border border-[#2A2B45]">
          <h2 className="text-2xl font-bold text-[#9DE2E2] mb-4">Not Seeing Your Perfect Role?</h2>
          <p className="text-gray-300 mb-6">
            We're always interested in hearing from passionate engineers and open source contributors.
            Even if we're not actively hiring for your specialty, reach out and tell us how you'd like to contribute.
          </p>

          <div className="relative inline-block group">
            <a
              href="mailto:support@opsentra.dev"
              className="inline-flex items-center bg-[#9DE2E2] hover:bg-[#7acccc] text-[#0B0C20] font-semibold py-3 px-8 rounded-lg text-lg transition duration-300"
            >
              Contact Us
            </a>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              support@opsentra.dev
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-gray-800 border-solid border-transparent border-t-gray-800"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Careers;