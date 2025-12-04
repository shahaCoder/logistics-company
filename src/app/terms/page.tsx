"use client";

import React from "react";

const TermsPage = () => {
  return (
    <section className="bg-gray-100 py-20">

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().getFullYear()}
          </p>

          <p className="text-gray-700 mb-6">
            These Terms &amp; Conditions (“Terms”) govern your use of the website{" "}
            <span className="font-mono text-sm">glco.us</span> (the “Website”) operated by{" "}
            <strong>Global Cooperation LLC</strong> (“we”, “us”, “our”). By accessing or using the
            Website, you agree to be bound by these Terms. If you do not agree, please do not use
            the Website.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            1. Use of the Website
          </h2>
          <p className="text-gray-700 mb-4">
            You agree to use the Website only for lawful purposes and in a way that does not infringe
            the rights of, restrict or inhibit anyone else&apos;s use of the Website. You must not
            attempt to gain unauthorized access to any part of the site, its servers, or any connected
            systems.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            2. Contact and Application Forms
          </h2>
          <p className="text-gray-700 mb-4">
            When you submit a contact form or job application through the Website, you agree to
            provide accurate and complete information. Submitting a form does not create an
            employment contract or guarantee that you will be hired or contacted. We reserve the
            right to accept or reject any application at our sole discretion.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            3. No Employment Guarantee
          </h2>
          <p className="text-gray-700 mb-4">
            Any information about pay, routes, equipment or opportunities presented on the Website
            is provided for general informational purposes only and may vary based on experience,
            location, market conditions and other factors. Nothing on this Website should be
            interpreted as a binding offer of employment or a guarantee of specific earnings.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            4. Intellectual Property
          </h2>
          <p className="text-gray-700 mb-4">
            All content on the Website, including logos, text, images, graphics, and layout, is
            owned by or licensed to Global Cooperation LLC and is protected by applicable
            intellectual property laws. You may not copy, reproduce, modify or distribute any
            content without our prior written consent, except for personal, non-commercial use.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            5. Third-Party Links
          </h2>
          <p className="text-gray-700 mb-4">
            The Website may contain links to third-party websites or services that are not owned or
            controlled by us. We are not responsible for the content, privacy policies, or practices
            of any third-party sites. Accessing such links is at your own risk.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            6. Limitation of Liability
          </h2>
          <p className="text-gray-700 mb-4">
            To the fullest extent permitted by law, Global Cooperation LLC shall not be liable for
            any indirect, incidental, special, consequential or punitive damages arising out of or
            related to your use of the Website, including but not limited to loss of data, loss of
            profits, or business interruption.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            7. Disclaimer
          </h2>
          <p className="text-gray-700 mb-4">
            The Website and its content are provided on an “as is” and “as available” basis without
            warranties of any kind, either express or implied. We do not warrant that the Website
            will be uninterrupted, secure or error-free, or that any defects will be corrected.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            8. Changes to the Website and Terms
          </h2>
          <p className="text-gray-700 mb-4">
            We may update, modify or discontinue any part of the Website at any time without notice.
            We may also revise these Terms from time to time. The updated version will be posted on
            this page with a revised “Last updated” date. Your continued use of the Website after
            changes are posted constitutes your acceptance of the new Terms.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            9. Governing Law
          </h2>
          <p className="text-gray-700 mb-4">
            These Terms are governed by and construed in accordance with the laws of the State of
            Ohio, United States, without regard to its conflict of law principles. Any disputes
            arising out of or in connection with these Terms shall be subject to the exclusive
            jurisdiction of the state and federal courts located in Ohio.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            10. Contact Information
          </h2>
          <p className="text-gray-700 mb-1">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-gray-700 mb-1">
            <strong>Global Cooperation LLC</strong>
          </p>
          <p className="text-gray-700 mb-1">Email: operations@glco.us</p>
          <p className="text-gray-700 mb-4">Website: www.glco.us</p>

          <p className="text-xs text-gray-500 mt-6">
            These Terms &amp; Conditions are provided as a general template and do not constitute
            legal advice. For specific legal requirements or questions, please consult a qualified
            attorney.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TermsPage;
