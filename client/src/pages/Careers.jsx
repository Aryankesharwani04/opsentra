const Careers = () => {
  return (
    <section className="mt-16 min-h-screen bg-[#0B0C20] text-white py-12 px-4 sm:px-6 lg:py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#9DE2E2] mb-6">
            Building Opsentra 🚀
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Opsentra is a personal project focused on creating an open-source,
            centralized logging platform — built by developers, for developers.
          </p>
        </div>

        {/* Current Project Status */}
        <div className="bg-[#1A1B2F] rounded-xl p-8 mb-16 border border-[#2A2B45]">
          <h2 className="text-2xl font-bold text-[#9DE2E2] mb-4">Where We Are</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">🛠️ In Development</h3>
              <p className="text-gray-300">
                Opsentra is actively being built. We’re experimenting, iterating, and crafting a strong foundation for the platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">🎯 Focused Mission</h3>
              <p className="text-gray-300">
                The goal is simple: make infrastructure logs accessible, unified, and developer-friendly — all with open source.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">🔓 Open Source First</h3>
              <p className="text-gray-300">
                Opsentra will remain fully open source. Collaboration, transparency, and community input are at the heart of this journey.
              </p>
            </div>
          </div>
        </div>

        {/* Invitation to Connect */}
        <div className="max-w-3xl mx-auto text-center bg-[#1A1B2F] rounded-xl p-8 border border-[#2A2B45]">
          <h2 className="text-2xl font-bold text-[#9DE2E2] mb-4">Want to Follow the Journey?</h2>
          <p className="text-gray-300 mb-6">
            This project is being built in public. If you're interested in how it evolves, want to give feedback, or collaborate in the future —
            feel free to reach out.
          </p>

          <div className="relative inline-block group">
            <a
              href="mailto:support@opsentra.dev"
              className="inline-flex items-center bg-[#9DE2E2] hover:bg-[#7acccc] text-[#0B0C20] font-semibold py-3 px-8 rounded-lg text-lg transition duration-300"
            >
              Get in Touch
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
