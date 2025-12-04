"use client";

import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <section className="bg-gray-100 py-20">

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().getFullYear()}
          </p>

          <p className="text-gray-700 mb-6">
            This Privacy Policy explains how <strong>Global Cooperation LLC</strong> (“we”, “us”, “our”)
            collects, uses and protects your personal information when you use our website{" "}
            <span className="font-mono text-sm">glco.us</span>, contact us, or submit a job application.
            By using our website or providing your information, you agree to this Privacy Policy.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            1. Information We Collect
          </h2>
          <p className="text-gray-700 mb-2">
            We may collect the following types of information:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            <li>Contact details (name, email address, phone number)</li>
            <li>Information you provide in our contact forms or job applications</li>
            <li>Driver-related details such as experience, type of equipment, and preferences</li>
            <li>Technical data such as IP address, browser type, and basic analytics data</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            2. How We Use Your Information
          </h2>
          <p className="text-gray-700 mb-2">
            We use your information for purposes such as:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            <li>Responding to your inquiries and messages</li>
            <li>Reviewing and processing job applications</li>
            <li>Contacting you about potential opportunities with our company</li>
            <li>Operating, maintaining and improving our website and services</li>
            <li>Complying with legal obligations and protecting our legal rights</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            3. Legal Basis for Processing
          </h2>
          <p className="text-gray-700 mb-4">
            We process your personal information based on one or more of the following:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            <li>Your consent (e.g., when you submit a form)</li>
            <li>Our legitimate interest in operating and growing our business</li>
            <li>Performance of a potential contract or working relationship with you</li>
            <li>Compliance with applicable laws and regulations</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            4. Sharing of Information
          </h2>
          <p className="text-gray-700 mb-4">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            <li>Service providers that help us operate our business (e.g., hosting, communication tools)</li>
            <li>Professional advisors (lawyers, accountants) where necessary</li>
            <li>Government authorities or law enforcement when required by law</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            5. Data Retention
          </h2>
          <p className="text-gray-700 mb-4">
            We keep your information only for as long as necessary for the purposes described in this
            Privacy Policy or as required by law. If you submit a job application, we may retain your
            details for a reasonable period in case future opportunities arise, unless you request that
            we delete your data.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            6. Your Rights
          </h2>
          <p className="text-gray-700 mb-2">
            Depending on your location, you may have rights such as:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            <li>Accessing the personal data we hold about you</li>
            <li>Requesting correction or deletion of your data</li>
            <li>Objecting to certain types of processing</li>
            <li>Withdrawing your consent where processing is based on consent</li>
          </ul>
          <p className="text-gray-700 mb-4">
            To exercise any of these rights, please contact us using the details below.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            7. Cookies & Analytics
          </h2>
          <p className="text-gray-700 mb-4">
            Our website may use basic cookies or analytics tools to understand how visitors use the
            site and to improve performance. This information is generally aggregated and does not
            directly identify you.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            8. Security
          </h2>
          <p className="text-gray-700 mb-4">
            We take reasonable technical and organizational measures to protect your personal
            information from unauthorized access, loss or misuse. However, no method of transmission
            over the internet is completely secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            9. Children&apos;s Privacy
          </h2>
          <p className="text-gray-700 mb-4">
            Our website and services are not directed to children under 18, and we do not knowingly
            collect personal information from children.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            10. Changes to This Policy
          </h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. The updated version will be posted
            on this page with a revised “Last updated” date.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            11. Contact Us
          </h2>
          <p className="text-gray-700 mb-1">
            If you have any questions about this Privacy Policy or how we handle your data, you can
            contact us at:
          </p>
          <p className="text-gray-700 mb-1">
            <strong>Global Cooperation LLC</strong>
          </p>
          <p className="text-gray-700 mb-1">Email: operations@glco.us</p>
          <p className="text-gray-700 mb-4">Website: www.glco.us</p>

          <p className="text-xs text-gray-500 mt-6">
            This Privacy Policy template is provided for general informational purposes only and does
            not constitute legal advice. For specific legal requirements, please consult a qualified
            attorney.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyPage;