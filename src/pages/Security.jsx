const Security = () => {
    return (
      <section className="min-h-screen bg-[#0B0C20] text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-[#9DE2E2] mb-6">Security & Compliance</h1>
          <p className="text-lg text-gray-300 mb-4">
            We take security seriously. Opsentra uses encryption in transit and at rest to protect
            all log data. Our platform is designed with privacy and compliance in mind.
          </p>
          <ul className="list-disc list-inside text-gray-300">
            <li>✅ End-to-End Encryption</li>
            <li>✅ Role-Based Access Control</li>
            <li>✅ GDPR & SOC2 Readiness</li>
            <li>✅ Audit Trails and Log Integrity</li>
          </ul>
        </div>
      </section>
    );
  };
  
  export default Security;