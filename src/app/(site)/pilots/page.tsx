import { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";

const NewsletterSignup = dynamic(() => import("@/components/NewsletterSignup"));

export const metadata: Metadata = {
  title: "Apply to Fly - ComplianceDrone Pilot Network",
  description: "Join our certified pilot network for thermal inspection services. Flexible work, professional training, and competitive compensation.",
};

export default function PilotsPage() {
  return (
    <section className="pb-20 pt-35 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-8 xl:px-0">
        <div className="text-center">
          <h1 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-heading-2">
            Join the ComplianceDrone Pilot Network
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-waterloo">
            Become part of our professional thermal inspection pilot network. Work flexible schedules, 
            receive comprehensive training, and earn competitive compensation using cutting-edge drone technology.
          </p>
        </div>

        <div className="mb-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white bg-opacity-[0.08] p-6 backdrop-blur-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Flexible Scheduling</h3>
            <p className="text-waterloo">
              Choose your own projects and work schedule. Perfect for full-time or part-time pilots.
            </p>
          </div>

          <div className="rounded-lg bg-white bg-opacity-[0.08] p-6 backdrop-blur-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Professional Training</h3>
            <p className="text-waterloo">
              Comprehensive training on thermal imaging, data analysis, and reporting standards.
            </p>
          </div>

          <div className="rounded-lg bg-white bg-opacity-[0.08] p-6 backdrop-blur-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Competitive Pay</h3>
            <p className="text-waterloo">
              Earn industry-leading rates for thermal inspection services with performance bonuses.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white bg-opacity-[0.08] p-8 backdrop-blur-md">
          <h2 className="mb-6 text-2xl font-bold text-white">Pilot Requirements</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-white">Required Certifications</h3>
              <ul className="space-y-2 text-waterloo">
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Part 107 Remote Pilot License
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Current FAA Medical (if applicable)
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Liability Insurance
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-white">Preferred Experience</h3>
              <ul className="space-y-2 text-waterloo">
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Thermal imaging experience
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Industrial/commercial work
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Construction background
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="mt-16 rounded-lg bg-gradient-blue p-8 backdrop-blur-md">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Join Our Nationwide Community</h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-white/90">
              Connect with drone pilots from coast to coast! Get the latest updates on solar panel inspections, 
              electrical infrastructure monitoring, and cutting-edge thermal imaging techniques. 
              Stay ahead with industry insights and exclusive opportunities.
            </p>
            
            <NewsletterSignup />
          </div>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Solar Insights</h3>
              <p className="text-sm text-white/80">Latest techniques in thermal solar panel inspection</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Electrical Monitoring</h3>
              <p className="text-sm text-white/80">Advanced thermal detection for electrical systems</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Pilot Network</h3>
              <p className="text-sm text-white/80">Connect with pilots across all 50 states</p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/pilot-registration"
            className="mr-4 inline-flex rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Start Application
          </Link>
          <Link
            href="/contact"
            className="inline-flex rounded-lg border border-white border-opacity-20 px-8 py-3 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white hover:bg-opacity-10"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}