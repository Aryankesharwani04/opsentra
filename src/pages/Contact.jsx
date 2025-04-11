const ContactSupport = () => {
    return (
      <section className="min-h-screen bg-[#0B0C20] text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-[#9DE2E2] mb-6">Contact Support</h1>
          <p className="text-lg text-gray-300 mb-4">
            Have questions, suggestions, or need help? We're here for you.
          </p>
          <p className="text-lg text-gray-300 mb-6">
            Email us at <a className="text-[#00C2FF] underline" href="mailto:support@opsentra.dev">support@opsentra.dev</a>
            or fill out our in-app feedback form.
          </p>
          <p className="text-lg text-gray-300">
            Join our community on Discord and stay connected with other Opsentra users and contributors.
          </p>
        </div>
      </section>
    );
  };
  
  export default ContactSupport;