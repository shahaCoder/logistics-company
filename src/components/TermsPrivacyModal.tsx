"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsPrivacyModal({
  isOpen,
  onClose,
  onAccept,
}: TermsPrivacyModalProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
      setAccepted(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Terms & Privacy Policy
                </h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 p-6 md:p-8">
                <div className="space-y-8">
                  {/* Terms Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Terms & Conditions
                    </h3>
                    <div className="text-gray-700 space-y-4 text-sm leading-relaxed">
                      <p>
                        By submitting a driver application to Global Cooperation LLC, you agree to
                        the following terms and conditions:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>
                          You agree to provide accurate and complete information in your application.
                        </li>
                        <li>
                          Submitting an application does not create an employment contract or
                          guarantee employment.
                        </li>
                        <li>
                          We reserve the right to accept or reject any application at our sole
                          discretion.
                        </li>
                        <li>
                          You understand that any information about pay, routes, or opportunities is
                          provided for informational purposes only and may vary.
                        </li>
                        <li>
                          You agree to comply with all applicable laws and regulations related to
                          commercial driving.
                        </li>
                      </ul>
                      <p className="mt-4">
                        <Link
                          href="/terms"
                          target="_blank"
                          className="text-red-600 hover:text-red-700 underline font-medium"
                        >
                          Read full Terms & Conditions
                        </Link>
                      </p>
                    </div>
                  </div>

                  {/* Privacy Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Privacy Policy
                    </h3>
                    <div className="text-gray-700 space-y-4 text-sm leading-relaxed">
                      <p>
                        <strong>Information We Collect:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>
                          <strong>Personal Information:</strong> Name, email address, phone number,
                          date of birth, and mailing address
                        </li>
                        <li>
                          <strong>Social Security Number (SSN):</strong> We collect your full SSN
                          for required DOT background checks, employment verification, and tax
                          purposes. Your SSN is encrypted using AES-256-GCM encryption and stored
                          securely. Only authorized personnel with proper clearance can access your
                          full SSN.
                        </li>
                        <li>
                          <strong>Driver License Information:</strong> License number, state, class,
                          expiration date, endorsements, and copies of your license
                        </li>
                        <li>
                          <strong>Medical Information:</strong> Medical card documentation and
                          expiration dates
                        </li>
                        <li>
                          <strong>Employment History:</strong> Previous employers, dates of
                          employment, positions held, and reasons for leaving
                        </li>
                        <li>
                          <strong>Background Check Information:</strong> Information required for
                          PSP, FMCSA Clearinghouse, and MVR checks
                        </li>
                        <li>
                          <strong>Legal Consents:</strong> Signatures and consent forms for
                          various background checks and disclosures
                        </li>
                      </ul>
                      <p className="mt-4">
                        <strong>How We Use Your Information:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>
                          To process and evaluate your driver application for employment
                        </li>
                        <li>
                          To conduct required DOT background checks, including PSP, FMCSA
                          Clearinghouse, and MVR checks
                        </li>
                        <li>
                          To verify your identity, driving qualifications, and employment history
                        </li>
                        <li>
                          To comply with federal and state regulations for commercial drivers
                        </li>
                        <li>
                          To contact you regarding your application and potential employment
                          opportunities
                        </li>
                        <li>
                          For tax and payroll purposes if you are hired
                        </li>
                      </ul>
                      <p className="mt-4">
                        <strong>Data Security:</strong> We use industry-standard encryption (AES-256-GCM)
                        to protect sensitive information, including your SSN. Access to your full SSN
                        is restricted to authorized personnel only and requires additional
                        authentication.
                      </p>
                      <p className="mt-4">
                        <Link
                          href="/privacy-policy"
                          target="_blank"
                          className="text-red-600 hover:text-red-700 underline font-medium"
                        >
                          Read full Privacy Policy
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with Checkbox */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-600 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-900">
                    I have read and agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-red-600 hover:text-red-700 underline font-medium"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      className="text-red-600 hover:text-red-700 underline font-medium"
                    >
                      Privacy Policy
                    </Link>
                    . I understand that my personal information, including my Social Security
                    Number, will be collected and used for employment and background check purposes.
                  </span>
                </label>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={!accepted}
                    className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
                      accepted
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Accept & Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

