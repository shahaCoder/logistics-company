"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
// Lazy load heavy PDF libraries - only load when user clicks "Download PDF"
let jsPDF: any = null;
let html2canvas: any = null;

const loadPDFLibraries = async () => {
  if (!jsPDF || !html2canvas) {
    const [jsPDFModule, html2canvasModule] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);
    jsPDF = jsPDFModule.default;
    html2canvas = html2canvasModule.default;
  }
  return { jsPDF, html2canvas };
};

/**
 * Format date in American format (MM/DD/YYYY)
 * Handles date strings from database (ISO format) and Date objects
 * Parses dates correctly to avoid timezone shifts (e.g., 01/01/1950 becoming 12/31/1949)
 */
function formatDateUS(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    let year: number, month: number, day: number;
    
    if (typeof date === 'string') {
      // Parse ISO date string (e.g., "1950-01-01T00:00:00.000Z" or "1950-01-01")
      // Extract date components directly to avoid UTC timezone conversion
      const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        year = parseInt(isoMatch[1], 10);
        month = parseInt(isoMatch[2], 10);
        day = parseInt(isoMatch[3], 10);
      } else {
        // Fallback to Date parsing if format is unexpected
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          return 'Invalid Date';
        }
        year = dateObj.getFullYear();
        month = dateObj.getMonth() + 1;
        day = dateObj.getDate();
      }
    } else {
      // Date object - use it directly
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = date.getDate();
    }
    
    // Format as MM/DD/YYYY (American format)
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    
    return `${monthStr}/${dayStr}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  currentAddressLine1: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  livedAtCurrentMoreThan3Years: boolean;
  ssnLast4: string;
  status: string;
  internalNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  previousAddresses: Array<{
    addressLine1: string;
    city: string;
    state: string;
    zip: string;
    fromDate: string | null;
    toDate: string | null;
  }>;
  license: {
    licenseNumber: string;
    state: string;
    class: string;
    expiresAt: string;
    endorsements: string | null;
    hasOtherLicensesLast3Years: boolean;
    otherLicensesJson: any;
    frontImageUrl: string | null;
    backImageUrl: string | null;
  } | null;
  medicalCard: {
    expiresAt: string | null;
    documentUrl: string | null;
    documentPublicId: string | null;
  } | null;
  employmentRecords: Array<{
    employerName: string;
    employerPhone: string | null;
    employerFax: string | null;
    employerEmail: string | null;
    addressLine1: string;
    city: string;
    state: string;
    zip: string;
    positionHeld: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    reasonForLeaving: string | null;
    equipmentClass: string | null;
    wasSubjectToFMCSR: boolean;
    wasSafetySensitive: boolean;
  }>;
  legalConsents: Array<{
    type: string;
    accepted: boolean;
    signedAt: string | null;
    signatureUrl: string | null;
  }>;
  reviewedBy: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  } | null;
}

const CONSENT_LABELS: Record<string, string> = {
  AUTHORIZATION: "Authorization & Certification",
  ALCOHOL_DRUG: "Alcohol & Drug Test Statement",
  SAFETY_PERFORMANCE: "Safety Performance Statement",
  PSP: "PSP Driver Disclosure & Authorization",
  CLEARINGHOUSE: "FMCSA Clearinghouse Consent",
  MVR: "MVR Release Consent",
};

export default function ApplicationDetailPage() {
  // ВСЕ хуки должны быть вызваны ПЕРВЫМИ, до любых условных возвратов
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const routerRef = useRef(router);

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [decryptedSSN, setDecryptedSSN] = useState<string | null>(null);
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [decryptPassword, setDecryptPassword] = useState("");
  const [decryptError, setDecryptError] = useState("");
  const [decrypting, setDecrypting] = useState(false);
  const [status, setStatus] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Calculate age function - должна быть определена до useMemo
  const calculateAge = (dateOfBirth: string): number => {
    // Parse date components directly to avoid UTC timezone conversion
    const isoMatch = dateOfBirth.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!isoMatch) {
      // Fallback to Date parsing if format is unexpected
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    
    const birthYear = parseInt(isoMatch[1], 10);
    const birthMonth = parseInt(isoMatch[2], 10);
    const birthDay = parseInt(isoMatch[3], 10);
    
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    
    let age = todayYear - birthYear;
    if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) {
      age--;
    }
    
    return age;
  };
  
  const age = useMemo(() => {
    return application ? calculateAge(application.dateOfBirth) : 0;
  }, [application]);

  // Обновляем ref при изменении router
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // Helper function to load signature as base64 - simple and reliable
  const loadSignatureAsBase64 = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          // Create canvas with original size (no compression for reliability)
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return reject(new Error("No canvas context"));
          }

          // Fill white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw image
          ctx.drawImage(img, 0, 0);
          
          // Convert to PNG for best quality (larger but reliable)
          const dataUrl = canvas.toDataURL("image/png");

          if (!dataUrl || !dataUrl.startsWith("data:image/png")) {
            return reject(new Error("Invalid dataUrl from canvas"));
          }

          console.log(`Signature loaded: ${img.width}x${img.height}px, dataUrl length: ${dataUrl.length}`);
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
      };

      img.onerror = (err) => {
        console.error("Error loading signature image:", url, err);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
  };

  const handleDownloadPDF = useCallback(async () => {
    if (!application) {
      alert("Application data not loaded yet. Please wait.");
      return;
    }

    setGeneratingPDF(true);
    try {
      // Lazy load PDF libraries only when needed
      const { jsPDF: PDF, html2canvas: h2c } = await loadPDFLibraries();
      // Get full SSN - use decrypted SSN if available, otherwise use last 4 digits
      // Note: For PDF generation, if SSN is not already decrypted, we'll use last 4 digits
      // User should decrypt SSN using the modal before generating PDF if full SSN is needed
      let fullSSN = decryptedSSN;
      if (!fullSSN) {
        // If SSN is not decrypted, use last 4 digits for PDF
        // User should use the decrypt button/modal before generating PDF if full SSN is required
        console.warn("SSN not decrypted. Using last 4 digits for PDF. Decrypt SSN first if full SSN is needed.");
      }

      // Load ALL signatures first using Promise.all
      console.log('Loading signature images...');
      const signaturesEntries = await Promise.all(
        application.legalConsents.map(async (consent) => {
          if (!consent.signatureUrl) {
            console.log(`No signature URL for ${consent.type}`);
            return [consent.type, null] as const;
          }

          try {
            console.log(`Loading signature for ${consent.type}:`, consent.signatureUrl);
            const dataUrl = await loadSignatureAsBase64(consent.signatureUrl);
            console.log(`✓ Signature loaded for ${consent.type}, length:`, dataUrl.length);
            return [consent.type, dataUrl] as const;
          } catch (error) {
            console.error(`✗ Failed to load signature for ${consent.type}:`, error);
            return [consent.type, null] as const;
          }
        })
      );

      const signatureImages = Object.fromEntries(
        signaturesEntries.filter(([_, value]) => value !== null)
      ) as Record<string, string>;
      
      console.log('All signatures processed. Loaded:', Object.keys(signatureImages).length, 'of', application.legalConsents.length);

      // Create PDF directly with jsPDF (no html2canvas = smaller file)
      const pdf = new PDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      let yPos = margin;
      const lineHeight = 7; // Increased from 6
      const sectionSpacing = 10; // Increased from 8

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPos + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
      };

      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number, isBold: boolean = false, x: number = margin) => {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          checkPageBreak(lineHeight);
          pdf.text(line, x, yPos);
          yPos += lineHeight;
        });
      };

      // Title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Driver Application", margin, yPos);
      yPos += lineHeight * 1.5;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Global Cooperation LLC`, margin, yPos);
      yPos += lineHeight;
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);
      yPos += sectionSpacing * 2;

      // Applicant Information
      addText("Applicant Information", 15, true);
      yPos += sectionSpacing;
      addText(`Name: ${application.firstName} ${application.lastName}`, 11);
      addText(`Date of Birth: ${formatDateUS(application.dateOfBirth)}`, 11);
      addText(`Phone: ${application.phone}`, 11);
      addText(`Email: ${application.email}`, 11);
      if (fullSSN) {
        // Format SSN as XXX-XX-XXXX (remove any existing dashes first)
        const cleanSSN = fullSSN.replace(/-/g, '');
        const formattedSSN = cleanSSN.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
        addText(`SSN: ${formattedSSN}`, 11);
      } else if (application.ssnLast4 && application.ssnLast4.trim() !== "") {
        addText(`SSN: ***-**-${application.ssnLast4}`, 11);
      } else {
        addText("SSN: Not provided by applicant", 11);
      }
      addText(`Current Address: ${application.currentAddressLine1}, ${application.currentCity}, ${application.currentState} ${application.currentZip}`, 11);
      
      if (!application.livedAtCurrentMoreThan3Years && application.previousAddresses.length > 0) {
        yPos += lineHeight;
        addText("Previous Addresses:", 11, true);
        application.previousAddresses.forEach(addr => {
          const addrText = `${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.zip}${addr.fromDate && addr.toDate ? ` (${formatDateUS(addr.fromDate)} - ${formatDateUS(addr.toDate)})` : ''}`;
          addText(addrText, 10);
        });
      }
      yPos += sectionSpacing * 2;

      // Driver's License
      if (application.license) {
        addText("Driver's License Information", 15, true);
        yPos += sectionSpacing;
        addText(`License Number: ${application.license.licenseNumber}`, 11);
        addText(`State: ${application.license.state}`, 11);
        addText(`Class: ${application.license.class}`, 11);
        addText(`Expires: ${application.license.expiresAt ? formatDateUS(application.license.expiresAt) : 'N/A'}`, 11);
        if (application.license.endorsements) {
          addText(`Endorsements: ${application.license.endorsements}`, 11);
        }
        if (application.license.hasOtherLicensesLast3Years) {
          addText("Other Licenses (Last 3 Years): Yes", 11);
        }
        yPos += sectionSpacing * 2;
      }

      // Medical Card
      if (application.medicalCard) {
        addText("Medical Card", 15, true);
        yPos += sectionSpacing;
        if (application.medicalCard.expiresAt) {
          addText(`Expiration Date: ${formatDateUS(application.medicalCard.expiresAt)}`, 11);
        }
        yPos += sectionSpacing * 2;
      }

      // Employment History
      if (application.employmentRecords.length > 0) {
        addText("Employment History (Last 3 Years)", 15, true);
        yPos += sectionSpacing;
        application.employmentRecords.forEach((record, idx) => {
          checkPageBreak(lineHeight * 10);
          addText(`${idx + 1}. ${record.employerName}`, 11, true);
          addText(`Address: ${record.addressLine1}, ${record.city}, ${record.state} ${record.zip}`, 10);
          if (record.employerPhone) addText(`Phone: ${record.employerPhone}`, 10);
          if (record.employerEmail) addText(`Email: ${record.employerEmail}`, 10);
          if (record.positionHeld) addText(`Position: ${record.positionHeld}`, 10);
          if (record.dateFrom && record.dateTo) {
            addText(`Employment Period: ${formatDateUS(record.dateFrom)} - ${formatDateUS(record.dateTo)}`, 10);
          }
          if (record.reasonForLeaving) addText(`Reason for Leaving: ${record.reasonForLeaving}`, 10);
          if (record.equipmentClass) addText(`Equipment Class: ${record.equipmentClass}`, 10);
          addText(`Subject to FMCSR: ${record.wasSubjectToFMCSR ? 'Yes' : 'No'}`, 10);
          addText(`Safety Sensitive: ${record.wasSafetySensitive ? 'Yes' : 'No'}`, 10);
          yPos += sectionSpacing;
        });
        yPos += sectionSpacing;
      }

      // Legal Consents
      addText("Legal Consents & Signatures", 15, true);
      yPos += sectionSpacing;

      const consentTexts: Record<string, string> = {
        'ALCOHOL_DRUG': 'I understand that as a commercial driver, I am subject to alcohol and drug testing as required by the Federal Motor Carrier Safety Regulations (FMCSR). I certify that the information provided below is true and accurate to the best of my knowledge.',
        'SAFETY_PERFORMANCE': 'I understand that as a commercial driver, I am subject to safety performance requirements as mandated by the Federal Motor Carrier Safety Regulations (FMCSR).',
        'PSP': 'In connection with your application for employment with Global Cooperation LLC (the "Company"), the Company may obtain information about you from the Federal Motor Carrier Safety Administration (FMCSA) Pre-Employment Screening Program (PSP). This information may include, but is not limited to, your crash history and inspection history from the FMCSA Motor Carrier Management Information System (MCMIS). By signing below, you authorize the Company to access your PSP record and use the information contained therein for employment purposes. You understand that this authorization will remain in effect for the duration of your employment relationship with the Company. You also understand that you have the right to review the information obtained from the PSP and to dispute any inaccurate information directly with the FMCSA.',
        'CLEARINGHOUSE': 'In accordance with the Federal Motor Carrier Safety Administration (FMCSA) Drug and Alcohol Clearinghouse regulations, I understand that: The Company may query the Clearinghouse to determine whether drug or alcohol violation information about me exists in the Clearinghouse. The Company may report drug or alcohol violations to the Clearinghouse as required by law. I have the right to review information about me in the Clearinghouse and to request corrections of any inaccurate information. By signing below, I consent to the Company\'s access to my Clearinghouse record for employment purposes.',
        'MVR': 'I hereby authorize Global Cooperation LLC (the "Company") to obtain my Motor Vehicle Record (MVR) from any state in which I hold or have held a driver\'s license. I understand that the Company will use this information to evaluate my qualifications for employment as a commercial driver and to ensure compliance with Federal Motor Carrier Safety Regulations (FMCSR). I authorize the release of my MVR information to the Company and understand that this authorization will remain in effect for the duration of my employment relationship with the Company. I certify that the information I have provided regarding my driving history is true and accurate to the best of my knowledge.'
      };

      const consentTypeNames: Record<string, string> = {
        'ALCOHOL_DRUG': 'Alcohol & Drug Test Statement',
        'SAFETY_PERFORMANCE': 'Safety Performance Statement',
        'PSP': 'PSP Driver Disclosure & Authorization',
        'CLEARINGHOUSE': 'FMCSA Drug & Alcohol Clearinghouse Consent',
        'MVR': 'MVR Release Consent'
      };

      for (const consent of application.legalConsents) {
        checkPageBreak(lineHeight * 15);
        const consentName = consentTypeNames[consent.type] || CONSENT_LABELS[consent.type] || consent.type;
        const consentText = consentTexts[consent.type] || '';
        const signatureImg = signatureImages[consent.type];

        addText(consentName, 12, true);
        addText(`Status: ${consent.accepted ? 'ACCEPTED' : 'NOT ACCEPTED'}`, 10);
        yPos += lineHeight;

        if (consentText) {
          addText(consentText, 9);
          yPos += lineHeight;
        }

        if (consent.signedAt) {
          addText(`Signed: ${formatDateUS(consent.signedAt)}`, 9);
        }

        if (signatureImg) {
          yPos += lineHeight;
          try {
            console.log(`Processing signature for ${consent.type}`);
            
            // Create a temporary container with the signature image
            const signatureContainer = document.createElement('div');
            signatureContainer.style.position = 'absolute';
            signatureContainer.style.left = '-9999px';
            signatureContainer.style.width = '300px';
            signatureContainer.style.height = '150px';
            signatureContainer.style.backgroundColor = '#FFFFFF';
            signatureContainer.style.display = 'flex';
            signatureContainer.style.alignItems = 'center';
            signatureContainer.style.justifyContent = 'center';
            
            const img = document.createElement('img');
            img.src = signatureImg;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'contain';
            
            signatureContainer.appendChild(img);
            document.body.appendChild(signatureContainer);
            
            // Wait for image to load
            await new Promise<void>((resolve) => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
                setTimeout(() => resolve(), 2000);
              }
            });
            
            // Use html2canvas to render the signature container
            const canvas = await h2c(signatureContainer, {
              scale: 2,
              useCORS: true,
              backgroundColor: '#FFFFFF',
              logging: false,
            });
            
            // Remove temporary container
            document.body.removeChild(signatureContainer);
            
            // Convert canvas to data URL
            const canvasDataUrl = canvas.toDataURL('image/png');
            
            // Calculate dimensions for PDF
            const mmPerPixel = 25.4 / 96; // Convert pixels to mm
            let imgWidthMm = (canvas.width / 2) * mmPerPixel; // Divide by 2 because scale=2
            let imgHeightMm = (canvas.height / 2) * mmPerPixel;
            
            // Scale to max 70mm width
            const maxWidthMm = 70;
            if (imgWidthMm > maxWidthMm) {
              const scaleMm = maxWidthMm / imgWidthMm;
              imgWidthMm = maxWidthMm;
              imgHeightMm = imgHeightMm * scaleMm;
            }
            
            checkPageBreak(imgHeightMm);
            
            console.log(`Adding signature to PDF: ${imgWidthMm.toFixed(1)}x${imgHeightMm.toFixed(1)}mm`);
            
            // Extract base64
            const base64Data = canvasDataUrl.split(',')[1];
            
            // Add to PDF
            pdf.addImage(base64Data, 'PNG', margin, yPos, imgWidthMm, imgHeightMm);
            console.log(`✓ Signature added successfully for ${consent.type}`);
            
            yPos += imgHeightMm + lineHeight;
          } catch (error) {
            console.error(`✗ Error processing signature for ${consent.type}:`, error);
            if (error instanceof Error) {
              console.error('Error details:', error.message);
            }
          }
        } else {
          console.log(`⚠ No signature image available for ${consent.type}`);
        }
        yPos += sectionSpacing * 1.5;
      }

      // Internal Notes
      if (application.internalNotes) {
        yPos += sectionSpacing;
        addText("Internal Notes", 15, true);
        yPos += sectionSpacing;
        addText(application.internalNotes, 10);
        yPos += sectionSpacing * 2;
      }

      // Download
      const fileName = `driver-application-${application.firstName}-${application.lastName}-${application.id.substring(0, 8)}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Error generating PDF: ${error instanceof Error ? error.message : "Unknown error"}. Please check the console for details.`);
    } finally {
      setGeneratingPDF(false);
    }
  }, [application, decryptedSSN]);

  const fetchApplication = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/admin/applications/${id}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        routerRef.current.push("/internal-driver-portal-7v92nx/login");
        return;
      }

      const data = await response.json();
      setApplication(data);
      setStatus(data.status);
      setInternalNotes(data.internalNotes || "");
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
    }
  }, [id]); // Убрали router из зависимостей, используем ref

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id, fetchApplication]);

  const handleDecryptSSN = async () => {
    if (!id) return;
    
    setDecryptError("");
    setDecrypting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(
        `${apiUrl}/api/admin/applications/${id}/decrypt-ssn`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ password: decryptPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setDecryptError(data.error || "Failed to decrypt SSN");
        return;
      }

      setDecryptedSSN(data.ssn);
      setShowDecryptModal(false);
      setDecryptPassword("");
    } catch (error) {
      setDecryptError("Network error");
    } finally {
      setDecrypting(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(
        `${apiUrl}/api/admin/applications/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status, internalNotes }),
        }
      );

      if (response.ok) {
        await fetchApplication();
        alert("Status updated successfully");
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      alert("Error updating status");
    } finally {
      setSaving(false);
    }
  };

  // Теперь можно делать условные возвраты ПОСЛЕ всех хуков
  if (!id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Invalid application ID</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Application not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Header */}
      <div className="mb-5">
        <button
          onClick={() => router.push("/internal-driver-portal-7v92nx/applications")}
          className="text-xs text-slate-600 hover:text-slate-900:text-slate-100 mb-3 inline-flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Applications
        </button>
        <h1 className="text-xl font-semibold text-slate-900">
          {application.firstName} {application.lastName}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submitted: {new Date(application.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Applicant Info */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Applicant Information
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500">First Name</label>
                <p className="text-xs text-slate-900 mt-0.5">{application.firstName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Last Name</label>
                <p className="text-xs text-slate-900 mt-0.5">{application.lastName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Date of Birth</label>
                <p className="text-xs text-slate-900 mt-0.5">
                  {formatDateUS(application.dateOfBirth)} (Age: {age})
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Phone</label>
                <p className="text-xs text-slate-900 mt-0.5">{application.phone}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Email</label>
                <p className="text-xs text-slate-900 mt-0.5">{application.email}</p>
              </div>
            <div>
              <label className="text-xs font-medium text-slate-500">SSN</label>
              {application.ssnLast4 && application.ssnLast4.trim() !== "" ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-900 font-mono">
                    {decryptedSSN || `***-**-${application.ssnLast4}`}
                  </p>
                  {!decryptedSSN && (
                    <button
                      onClick={() => setShowDecryptModal(true)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Decrypt
                    </button>
                  )}
                  {decryptedSSN && (
                    <button
                      onClick={() => setDecryptedSSN(null)}
                      className="text-xs text-slate-600 hover:text-slate-700"
                    >
                      Hide
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic mt-0.5">
                  SSN was not provided by the applicant
                </p>
              )}
            </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="text-xs font-medium text-slate-500">Current Address</label>
              <p className="text-xs text-slate-900 mt-0.5">
                {application.currentAddressLine1}, {application.currentCity},{" "}
                {application.currentState} {application.currentZip}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Lived at current address more than 3 years:{" "}
                {application.livedAtCurrentMoreThan3Years ? "Yes" : "No"}
              </p>
            </div>

            {application.previousAddresses.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="text-xs font-medium text-slate-500">
                  Previous Addresses
                </label>
                {application.previousAddresses.map((addr, idx) => (
                  <div key={idx} className="mt-2 text-xs text-slate-900">
                    {addr.addressLine1}, {addr.city}, {addr.state} {addr.zip}
                    {addr.fromDate && addr.toDate && (
                      <span className="text-slate-500 ml-2">
                        ({formatDateUS(addr.fromDate)} -{" "}
                        {formatDateUS(addr.toDate)})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* License Info */}
          {application.license && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Driver's License
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    License Number
                  </label>
                  <p className="text-xs text-slate-900 mt-0.5">{application.license.licenseNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">State</label>
                  <p className="text-xs text-slate-900 mt-0.5">{application.license.state}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Class</label>
                  <p className="text-xs text-slate-900 mt-0.5">{application.license.class}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Expires</label>
                  <p className="text-xs text-slate-900 mt-0.5">
                    {formatDateUS(application.license.expiresAt)}
                  </p>
                </div>
                {application.license.endorsements && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">
                      Endorsements
                    </label>
                    <p className="text-xs text-slate-900 mt-0.5">
                      {application.license.endorsements.split(",").join(", ")}
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {application.license.frontImageUrl && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Front
                    </label>
                    {(() => {
                      const url = application.license.frontImageUrl!;
                      // Check if it's a PDF by URL pattern or resource type
                      const isPDF = url.toLowerCase().includes('.pdf') || 
                                   url.toLowerCase().includes('/raw/upload/') ||
                                   url.toLowerCase().endsWith('.pdf') ||
                                   url.includes('/v1/raw/upload/');
                      
                      if (isPDF) {
                        // Extract filename from URL
                        let fileName = 'license-front.pdf';
                        try {
                          const urlObj = new URL(url);
                          const pathParts = urlObj.pathname.split('/');
                          // Try to find filename in path
                          for (let i = pathParts.length - 1; i >= 0; i--) {
                            if (pathParts[i] && pathParts[i].includes('.')) {
                              fileName = pathParts[i];
                              break;
                            }
                          }
                          // If no extension found, add .pdf
                          if (!fileName.toLowerCase().endsWith('.pdf')) {
                            fileName = fileName + '.pdf';
                          }
                        } catch (e) {
                          // If URL parsing fails, use default
                          fileName = 'license-front.pdf';
                        }
                        
                        return (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={fileName}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{fileName}</span>
                          </a>
                        );
                      } else {
                        return (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Image
                              src={url}
                              alt="License Front"
                              width={300}
                              height={200}
                              className="rounded border"
                              loading="lazy"
                              quality={85}
                            />
                          </a>
                        );
                      }
                    })()}
                  </div>
                )}
                {application.license.backImageUrl && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      Back
                    </label>
                    {(() => {
                      const url = application.license.backImageUrl!;
                      // Check if it's a PDF by URL pattern or resource type
                      const isPDF = url.toLowerCase().includes('.pdf') || 
                                   url.toLowerCase().includes('/raw/upload/') ||
                                   url.toLowerCase().endsWith('.pdf') ||
                                   url.includes('/v1/raw/upload/');
                      
                      if (isPDF) {
                        // Extract filename from URL
                        let fileName = 'license-back.pdf';
                        try {
                          const urlObj = new URL(url);
                          const pathParts = urlObj.pathname.split('/');
                          // Try to find filename in path
                          for (let i = pathParts.length - 1; i >= 0; i--) {
                            if (pathParts[i] && pathParts[i].includes('.')) {
                              fileName = pathParts[i];
                              break;
                            }
                          }
                          // If no extension found, add .pdf
                          if (!fileName.toLowerCase().endsWith('.pdf')) {
                            fileName = fileName + '.pdf';
                          }
                        } catch (e) {
                          // If URL parsing fails, use default
                          fileName = 'license-back.pdf';
                        }
                        
                        return (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={fileName}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{fileName}</span>
                          </a>
                        );
                      } else {
                        return (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Image
                              src={url}
                              alt="License Back"
                              width={300}
                              height={200}
                              className="rounded border"
                              loading="lazy"
                              quality={85}
                            />
                          </a>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medical Card */}
          {application.medicalCard && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Medical Card
              </h2>
              {application.medicalCard.expiresAt && (
                <div className="mb-3">
                  <label className="text-xs font-medium text-slate-500">
                    Expiration Date
                  </label>
                  <p className="text-xs text-slate-900 mt-0.5">
                    {formatDateUS(application.medicalCard.expiresAt)}
                  </p>
                </div>
              )}
              {application.medicalCard.documentUrl && (
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                    Document
                  </label>
                  {(() => {
                    const url = application.medicalCard.documentUrl!;
                    // Check if it's a PDF by URL pattern or resource type
                    const isPDF = url.toLowerCase().includes('.pdf') || 
                                 url.toLowerCase().includes('/raw/upload/') ||
                                 url.toLowerCase().endsWith('.pdf') ||
                                 url.includes('/v1/raw/upload/');
                    
                    if (isPDF) {
                      // Extract filename from URL
                      let fileName = 'medical-card.pdf';
                      try {
                        const urlObj = new URL(url);
                        const pathParts = urlObj.pathname.split('/');
                        // Try to find filename in path
                        for (let i = pathParts.length - 1; i >= 0; i--) {
                          if (pathParts[i] && pathParts[i].includes('.')) {
                            fileName = pathParts[i];
                            break;
                          }
                        }
                        // If no extension found, add .pdf
                        if (!fileName.toLowerCase().endsWith('.pdf')) {
                          fileName = fileName + '.pdf';
                        }
                      } catch (e) {
                        // If URL parsing fails, use default
                        fileName = 'medical-card.pdf';
                      }
                      
                      return (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={fileName}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{fileName}</span>
                        </a>
                      );
                    } else {
                      return (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Image
                            src={url}
                            alt="Medical Card"
                            width={400}
                            height={300}
                            className="rounded border border-slate-200"
                            loading="lazy"
                            quality={85}
                          />
                        </a>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Employment History */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Employment History
            </h2>
            {application.employmentRecords.map((record, idx) => (
              <div key={idx} className="mb-4 pb-4 border-b border-slate-200 last:border-0 last:mb-0 last:pb-0">
                <h3 className="text-xs font-semibold text-slate-900 mb-2">
                  {idx + 1}. {record.employerName}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Address: </span>
                    <span className="text-slate-900">
                      {record.addressLine1}, {record.city}, {record.state} {record.zip}
                    </span>
                  </div>
                  {record.employerPhone && (
                    <div>
                      <span className="text-slate-500">Phone: </span>
                      <span className="text-slate-900">{record.employerPhone}</span>
                    </div>
                  )}
                  {record.positionHeld && (
                    <div>
                      <span className="text-slate-500">Position: </span>
                      <span className="text-slate-900">{record.positionHeld}</span>
                    </div>
                  )}
                  {record.dateFrom && record.dateTo && (
                    <div>
                      <span className="text-slate-500">Dates: </span>
                      <span className="text-slate-900">
                        {formatDateUS(record.dateFrom)} -{" "}
                        {formatDateUS(record.dateTo)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Subject to FMCSR: </span>
                    <span className="text-slate-900">
                      {record.wasSubjectToFMCSR ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Safety Sensitive: </span>
                    <span className="text-slate-900">
                      {record.wasSafetySensitive ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legal Consents */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Legal Consents</h2>
            {application.legalConsents.map((consent, idx) => (
              <div key={idx} className="mb-3 pb-3 border-b border-slate-200 last:border-0 last:mb-0 last:pb-0">
                <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                {CONSENT_LABELS[consent.type] || consent.type}
              </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      consent.accepted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {consent.accepted ? "Accepted" : "Not Accepted"}
                  </span>
                </div>
                {consent.signedAt && (
                  <p className="text-xs text-slate-500 mt-1">
                    Signed: {formatDateUS(consent.signedAt)}
                  </p>
                )}
              {consent.signatureUrl ? (
                <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-1">Signature:</p>
                  <div className="border border-slate-200 rounded p-2 bg-slate-50">
                    <Image
                      src={consent.signatureUrl}
                      alt={`${CONSENT_LABELS[consent.type] || consent.type} signature`}
                      width={300}
                      height={150}
                      className="max-w-full h-auto"
                      loading="lazy"
                      quality={85}
                    />
                  </div>
                  <a
                    href={consent.signatureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-600 hover:text-red-700 mt-1 inline-block font-medium"
                  >
                    Open in new tab
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-1 italic">
                  Signature file is not available (applicant may have typed their name or this is an older record).
                </p>
              )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Actions</h2>
            
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={generatingPDF || !application}
              className={`w-full mb-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                generatingPDF || !application
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {generatingPDF ? "Generating PDF..." : "Download PDF"}
            </button>

            <div className="mb-3">
              <label htmlFor="application-status" className="block text-xs font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                id="application-status"
                name="application-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="NEW">New</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="application-notes" className="block text-xs font-medium text-slate-700 mb-1.5">
                Internal Notes
              </label>
              <textarea
                id="application-notes"
                name="application-notes"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={5}
                className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                placeholder="Add internal notes..."
              />
            </div>

            <button
              onClick={handleSaveStatus}
              disabled={saving}
              className={`w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                saving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            {application.reviewedBy && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                <p>
                  Was edited by {application.reviewedBy.name || application.reviewedBy.email}
                  {application.reviewedAt && (
                    <> · {new Date(application.reviewedAt).toLocaleString()}</>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decrypt SSN Modal */}
      {showDecryptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl p-5 max-w-md w-full mx-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Decrypt SSN
            </h3>
            <label htmlFor="decrypt-password" className="block text-xs text-slate-600 mb-1.5">
              Type your admin password to decrypt SSN:
            </label>
            <input
              id="decrypt-password"
              name="decrypt-password"
              type="password"
              value={decryptPassword}
              onChange={(e) => setDecryptPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Admin password"
              autoFocus
            />
            {decryptError && (
              <p className="text-xs text-red-600 mb-3">{decryptError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleDecryptSSN}
                disabled={decrypting || !decryptPassword}
                className={`flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  decrypting || !decryptPassword
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {decrypting ? "Decrypting..." : "Decrypt"}
              </button>
              <button
                onClick={() => {
                  setShowDecryptModal(false);
                  setDecryptPassword("");
                  setDecryptError("");
                }}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-2 rounded-md text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

