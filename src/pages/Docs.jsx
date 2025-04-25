const Docs = () => {
  // Integration features
  const integrations = [
    {
      name: "AWS CloudWatch",
      icon: "☁️",
      description: "Collect logs from all AWS services including EC2, Lambda, ECS, and more",
      features: [
        "Automatic log group discovery",
        "Cross-account logging",
        "CloudTrail integration"
      ],
      docsLink: "/docs/aws"
    },
    {
      name: "Docker",
      icon: "🐳",
      description: "Capture container stdout/stderr and system logs",
      features: [
        "Support for all Docker log drivers",
        "Automatic container discovery",
        "Multi-host logging"
      ],
      docsLink: "/docs/docker"
    },
    {
      name: "Linux Systems",
      icon: "💻",
      description: "Centralize syslog, journald, and application logs",
      features: [
        "Systemd journal integration",
        "Custom log file parsing",
        "Host-level log aggregation"
      ],
      docsLink: "/docs/linux"
    },
    {
      name: "Jenkins",
      icon: "🧪",
      description: "Capture build logs, pipeline output, and system events",
      features: [
        "Real-time job logging",
        "Build failure analysis",
        "Plugin compatibility"
      ],
      docsLink: "/docs/jenkins"
    },
    {
      name: "Kubernetes",
      icon: "☸️",
      description: "Cluster-wide logging for pods, nodes, and control plane",
      features: [
        "Automatic pod discovery",
        "Namespace filtering",
        "CRD for custom log routing"
      ],
      docsLink: "/docs/kubernetes"
    }
  ];

  // Core features
  const features = [
    {
      title: "Unified Logging",
      description: "All your logs in one place, regardless of source",
      icon: "📊"
    },
    {
      title: "Smart Parsing",
      description: "Automatic structure detection for common log formats",
      icon: "🔍"
    },
    {
      title: "Real-time Search",
      description: "Find logs instantly with full-text search",
      icon: "🔎"
    },
    {
      title: "Custom Alerts",
      description: "Get notified about critical errors",
      icon: "🚨"
    },
    {
      title: "Team Collaboration",
      description: "Share log views and investigations",
      icon: "👥"
    },
    {
      title: "API Access",
      description: "Programmatic access to all your logs",
      icon: "⚙️"
    }
  ];

  return (
    <section className="min-h-screen bg-[#0B0C20] text-white py-12 px-4 sm:px-6 lg:py-16">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#9DE2E2] mb-6">
            Opsentra Documentation
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl">
            Everything you need to connect your infrastructure and start logging in minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a 
              href="#getting-started" 
              className="bg-[#9DE2E2] hover:bg-[#7acccc] text-[#0B0C20] font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              Quick Start Guide
            </a>
            <a 
              href="#integrations" 
              className="bg-[#2A2B45] hover:bg-[#3A3B55] text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              Integration Docs
            </a>
          </div>
        </div>

        {/* Getting Started */}
        <div id="getting-started" className="mb-16">
          <h2 className="text-3xl font-bold text-[#9DE2E2] mb-8">🚀 Getting Started</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#1A1B2F] rounded-xl p-6 border border-[#2A2B45]">
              <div className="text-3xl mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Create Account</h3>
              <p className="text-gray-300">
                Sign up for Opsentra and create your organization.
              </p>
            </div>
            <div className="bg-[#1A1B2F] rounded-xl p-6 border border-[#2A2B45]">
              <div className="text-3xl mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">Add Data Sources</h3>
              <p className="text-gray-300">
                Connect your AWS, Kubernetes, or other infrastructure.
              </p>
            </div>
            <div className="bg-[#1A1B2F] rounded-xl p-6 border border-[#2A2B45]">
              <div className="text-3xl mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">View Logs</h3>
              <p className="text-gray-300">
                Start exploring your unified log dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#9DE2E2] mb-8">✨ Core Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-[#1A1B2F] rounded-lg p-6 hover:bg-[#2A2B45] transition duration-300">
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div id="integrations" className="mb-16">
          <h2 className="text-3xl font-bold text-[#9DE2E2] mb-8">🔌 Integrations</h2>
          <div className="space-y-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-[#1A1B2F] rounded-xl p-6 border border-[#2A2B45] hover:border-[#9DE2E2] transition duration-300">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="text-4xl">{integration.icon}</div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-[#9DE2E2]">{integration.name}</h3>
                      {/* <a 
                        href={integration.docsLink} 
                        className="text-[#9DE2E2] hover:text-[#7acccc] font-medium transition duration-300"
                      >
                        View Documentation →
                      </a> */}
                    </div>
                    <p className="text-gray-300 mb-4">{integration.description}</p>
                    <ul className="space-y-2">
                      {integration.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-[#9DE2E2] mr-2">✓</span>
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#9DE2E2] mb-8">📊 Dashboard Features</h2>
          <div className="bg-[#1A1B2F] rounded-xl p-8 border border-[#2A2B45]">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-[#9DE2E2] mb-4">Log Exploration</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-[#9DE2E2] mr-2">•</span>
                    <span>Filter by service, severity, time range</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#9DE2E2] mr-2">•</span>
                    <span>Saved searches and filters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#9DE2E2] mr-2">•</span>
                    <span>Context-aware log highlighting</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#9DE2E2] mb-4">Alerting & Monitoring</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-[#9DE2E2] mr-2">•</span>
                    <span>Custom alert rules with thresholds</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#9DE2E2] mr-2">•</span>
                    <span>Slack, Email, and Webhook notifications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#9DE2E2] mr-2">•</span>
                    <span>Anomaly detection for unusual patterns</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#9DE2E2] mb-4">Need Help?</h2>
          <p className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
            Check our <a href="/faq" className="text-[#9DE2E2] hover:underline">FAQ</a> or contact our support team at <a href="mailto:support@opsentra.dev" className="text-[#9DE2E2] hover:underline">support@opsentra.dev</a>
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center bg-[#9DE2E2] hover:bg-[#7acccc] text-[#0B0C20] font-semibold py-3 px-8 rounded-lg text-lg transition duration-300"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};

export default Docs;