const Docs = () => {
  return (
    <section className="min-h-screen bg-[#0B0C20] text-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-[#9DE2E2] mb-6">Getting Started</h1>
        <p className="text-lg text-gray-300 mb-4">
          Welcome to the Opsentra documentation. Here you’ll find everything you need to connect your
          infrastructure and start logging in minutes.
        </p>
        <h2 className="text-2xl text-[#9DE2E2] mt-6 mb-2">Integrations</h2>
        <ul className="list-disc list-inside text-gray-300 mb-6">
          <li>✅ AWS CloudWatch Integration</li>
          <li>🐳 Docker Logging via Log Drivers</li>
          <li>💻 Linux Syslog/Journal Integration</li>
          <li>🧪 Jenkins Job + Build Logs</li>
          <li>☸️ Kubernetes Pod & Cluster Logging</li>
        </ul>
        <h2 className="text-2xl text-[#9DE2E2] mt-6 mb-2">Dashboard</h2>
        <p className="text-lg text-gray-300">
          Filter logs by service, severity, time, and more. Set up alerts for anomalies, search for errors,
          and visualize activity trends in real-time.
        </p>
      </div>
    </section>
  );
};

export default Docs;