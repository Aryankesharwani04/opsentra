const Careers = () => {
  return (
    <section className="min-h-screen bg-[#0B0C20] text-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-[#9DE2E2] mb-6">Careers at Opsentra</h1>
        <p className="text-lg text-gray-300 mb-4">
          We believe in the power of community and open-source innovation. Whether you're a contributor,
          maintainer, or a first-time coder, Opsentra welcomes you to collaborate with us.
        </p>
        <p className="text-lg text-gray-300 mb-6">
          Join our mission to simplify observability across modern infrastructure. We offer remote collaboration,
          mentorship, and a space to build solutions that impact developers worldwide.
        </p>
        <ul className="list-disc list-inside text-gray-300">
          <li>Contribute to our core logging platform</li>
          <li>Help maintain integrations for AWS, Docker, Jenkins, etc.</li>
          <li>Work on our UI dashboards using React and Tailwind</li>
          <li>Gain experience in real-world DevOps tooling</li>
        </ul>
      </div>
    </section>
  );
};

export default Careers;