import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Quote - ComplianceDrone",
  description: "Get a custom quote for professional thermal inspection services. Save thousands with early problem detection using our AI-powered drone technology.",
};

export default function ContactPage() {
  return (
    <section className="pb-20 pt-35 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-8 xl:px-0">
        <div className="text-center">
          <h1 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-heading-2">
            Request Your Thermal Inspection Quote
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-waterloo">
            Get professional thermal inspection services that save thousands through early problem detection. 
            Our certified pilots use AI-powered drone technology to identify issues before they become costly failures.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <form className="rounded-lg bg-white bg-opacity-[0.08] p-8 backdrop-blur-md">
            <div className="mb-6">
              <label htmlFor="company" className="mb-3 block text-sm font-medium text-white">
                Company Name *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                className="w-full rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm focus:border-primary focus:outline-none"
                placeholder="Your Company"
              />
            </div>

            <div className="mb-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-3 block text-sm font-medium text-white">
                  Contact Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm focus:border-primary focus:outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-3 block text-sm font-medium text-white">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm focus:border-primary focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="facility" className="mb-3 block text-sm font-medium text-white">
                Facility Type
              </label>
              <select 
                id="facility"
                name="facility"
                className="w-full rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 px-4 py-3 text-white backdrop-blur-sm focus:border-primary focus:outline-none"
              >
                <option value="">Select facility type</option>
                <option value="solar">Solar Installation</option>
                <option value="electrical">Electrical Infrastructure</option>
                <option value="industrial">Industrial Facility</option>
                <option value="commercial">Commercial Building</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="location" className="mb-3 block text-sm font-medium text-white">
                Facility Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="w-full rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm focus:border-primary focus:outline-none"
                placeholder="City, State"
              />
            </div>

            <div className="mb-8">
              <label htmlFor="message" className="mb-3 block text-sm font-medium text-white">
                Project Details
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm focus:border-primary focus:outline-none"
                placeholder="Tell us about your inspection needs, timeline, and any specific concerns..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Request Quote
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}