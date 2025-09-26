import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | ComplianceDrone - Thermal Inspection Platform",
  description: "ComplianceDrone documentation for thermal inspection platform setup and usage",
  // other metadata
};

export default function DocsPage() {
  return (
    <article>
      <h1>ComplianceDrone Documentation</h1>

      <p className='font-medium'>
        Welcome to ComplianceDrone&apos;s documentation. This comprehensive platform
        provides AI-powered thermal inspection services for solar installations
        and electrical infrastructure.
      </p>
      <p className='font-medium'>
        Please visit:{' '}
        <a
          className='underline'
          target='_blank'
          href='https://nextjstemplates.com/docs'
        >
          nextjstemplates.com/docs
        </a>{' '}
        to check out the real docs, setup guide and even video instructions
      </p>
    </article>
  );
}
