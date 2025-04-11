const About = () => {
    return (
      <section className="min-h-screen bg-[#0B0C20] text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-[#9DE2E2] mb-6">About Opsentra</h1>
          <p className="text-lg text-gray-300 mb-6">
            Opsentra is a centralized logging platform designed to unify logs from AWS, Docker,
            Linux, Jenkins, and Kubernetes — all in one place. We make it easier for developers
            and DevOps teams to monitor, debug, and optimize infrastructure with clear, readable,
            and actionable log data.
          </p>
          <p className="text-lg text-gray-300">
            With AI-powered parsing and an intuitive dashboard, Opsentra reduces noise and highlights
            what truly matters. Say goodbye to hopping across services — and hello to unified visibility.
          </p>
        </div>
      </section>
    );
  };
  
  export default About;
  