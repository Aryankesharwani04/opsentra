const About = () => {
  return (
    <section className="mt-14 min-h-screen bg-[#0B0C20] text-white py-12 px-4 sm:px-6 lg:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section with Image */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          <div className="lg:w-1/2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#9DE2E2] mb-6 leading-tight">
              See Everything. Secure Everything.<br />
              <span className="text-white">All with Open Source.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Opsentra is a centralized logging platform designed to unify logs from all your infrastructure — all in one place.
            </p>
          </div>
          <div className="lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
              alt="Dashboard visualization" 
              className="rounded-xl shadow-2xl border border-[#2A2B45]"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-[#9DE2E2] mb-8">About Opsentra</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <p className="text-lg text-gray-300 mb-6">
                Opsentra unifies logs from AWS, Docker, Linux, Jenkins, and Kubernetes — all in one place. We make it easier for developers
                and DevOps teams to monitor, debug, and optimize infrastructure with clear, readable, and actionable log data.
              </p>
              <p className="text-lg text-gray-300">
                With AI-powered parsing and an intuitive dashboard, Opsentra reduces noise and highlights
                what truly matters. Say goodbye to hopping across services — and hello to unified visibility.
              </p>
            </div>
            <div>
              <p className="text-lg text-gray-300 mb-6">
                Our open-source approach ensures transparency and allows the community to contribute to making logging better for everyone.
              </p>
              <p className="text-lg text-gray-300">
                Built by DevOps engineers for DevOps engineers, we understand the pain points of managing complex infrastructure logs.
              </p>
            </div>
          </div>
        </div>

        {/* Features with Icons */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#9DE2E2] mb-12 text-center">Integrated with Your Favorite Tools</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: 'AWS', icon: '☁️' },
              { name: 'Docker', icon: '🐳' },
              { name: 'Linux', icon: '🐧' },
              { name: 'Jenkins', icon: '⚙️' },
              { name: 'Kubernetes', icon: '⎈' },
              { name: 'Terraform', icon: '🏗️' },
              { name: 'Ansible', icon: '🔄' },
              { name: 'GitHub', icon: '🐙' },
              { name: 'GitLab', icon: '🦊' },
              { name: 'Prometheus', icon: '📊' },
              { name: 'Grafana', icon: '📈' },
              { name: 'Elasticsearch', icon: '🔍' },
            ].map((tool) => (
              <div key={tool.name} className="flex flex-col items-center p-4 bg-[#1A1B2F] rounded-lg hover:bg-[#2A2B45] transition duration-300">
                <span className="text-3xl mb-2">{tool.icon}</span>
                <span className="font-medium">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <h2 className="text-3xl font-bold text-[#9DE2E2] mb-6">Ready to Simplify Your Logging?</h2>
          <p className="text-3xl font-bold text-[#9DE2E2] mb-6">
            Join thousands of developers and DevOps teams who trust Opsentra for their logging needs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;