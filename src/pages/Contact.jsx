const ContactSupport = () => {
  return (
    <section className="mt-8 min-h-screen bg-[#0B0C20] text-white py-12 px-4 sm:px-6 lg:py-16">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#9DE2E2] mb-4">
            We're Here to Help
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Whether you need technical support, have product questions, or want to collaborate, our team is ready to assist.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Email Card */}
          <div className="bg-[#1A1B2F] rounded-xl p-8 border border-[#2A2B45] hover:border-[#9DE2E2] transition duration-300">
            <div className="text-3xl mb-4">✉️</div>
            <h2 className="text-2xl font-bold text-[#9DE2E2] mb-4">Email Support</h2>
            <p className="text-gray-300 mb-6">
              For direct assistance from our support team, send us an email.
            </p>
            <a 
              href="mailto:support@opsentra.dev" 
              className="inline-flex items-center justify-center w-full bg-[#9DE2E2] hover:bg-[#7acccc] text-[#0B0C20] font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              <span>support@opsentra.dev</span>
            </a>
          </div>

          {/* Community Card */}
          <div className="bg-[#1A1B2F] rounded-xl p-8 border border-[#2A2B45] hover:border-[#9DE2E2] transition duration-300">
            <div className="text-3xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-[#9DE2E2] mb-4">Community Support</h2>
            <p className="text-gray-300 mb-6">
              Join our growing community of users and contributors for peer-to-peer help.
            </p>
            <div className="space-y-3">
              <a 
                href="https://discord.gg/your-invite-link" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
              >
                Join Our Discord
              </a>
              <a 
                href="https://github.com/your-repo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-[#333] hover:bg-[#222] text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
              >
                GitHub Discussions
              </a>
            </div>
          </div>

          {/* Documentation Card */}
          <div className="bg-[#1A1B2F] rounded-xl p-8 border border-[#2A2B45] hover:border-[#9DE2E2] transition duration-300">
            <div className="text-3xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-[#9DE2E2] mb-4">Resources</h2>
            <p className="text-gray-300 mb-6">
              Check out our documentation and FAQs for self-service help.
            </p>
            <div className="space-y-3">
              <a 
                href="/docs" 
                className="inline-flex items-center justify-center w-full bg-[#2A2B45] hover:bg-[#3A3B55] text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
              >
                Documentation
              </a>
              <a 
                href="/faq" 
                className="inline-flex items-center justify-center w-full bg-[#2A2B45] hover:bg-[#3A3B55] text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
              >
                FAQ Center
              </a>
            </div>
          </div>
        </div>

        {/* Additional Contact Info */}
        <div className="max-w-4xl mx-auto bg-[#1A1B2F] rounded-xl p-8 border border-[#2A2B45]">
          <h2 className="text-2xl font-bold text-[#9DE2E2] mb-6 text-center">Other Ways to Connect</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">💼 Business Inquiries</h3>
              <a 
                href="mailto:partners@opsentra.dev" 
                className="text-[#00C2FF] hover:text-[#9DE2E2] transition duration-300"
              >
                partners@opsentra.dev
              </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">🤝 Partnerships</h3>
              <a 
                href="mailto:collaborate@opsentra.dev" 
                className="text-[#00C2FF] hover:text-[#9DE2E2] transition duration-300"
              >
                collaborate@opsentra.dev
              </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">📢 Press</h3>
              <a 
                href="mailto:press@opsentra.dev" 
                className="text-[#00C2FF] hover:text-[#9DE2E2] transition duration-300"
              >
                press@opsentra.dev
              </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">💻 Careers</h3>
              <a 
                href="mailto:careers@opsentra.dev" 
                className="text-[#00C2FF] hover:text-[#9DE2E2] transition duration-300"
              >
                careers@opsentra.dev
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSupport;