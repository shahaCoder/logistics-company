// Structured data utilities for Schema.org JSON-LD

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Global Cooperation LLC",
  url: "https://glco.us",
  logo: "https://glco.us/images/logo.png",
  description:
    "Professional trucking and logistics company providing nationwide freight transportation across the United States. Specializing in dry van, power only, reefer, and flatbed services.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "10901 Reed Hartman Hwy",
    addressLocality: "Blue Ash",
    addressRegion: "OH",
    postalCode: "45242",
    addressCountry: "US",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-513-993-0921",
    contactType: "customer service",
    email: "operations@glco.us",
    availableLanguage: "English",
  },
  sameAs: [
    "https://www.instagram.com/global.cooperation",
    "https://www.facebook.com/share/15qAmEpgQj/",
  ],
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://glco.us/#localbusiness",
  name: "Global Cooperation LLC",
  image: "https://glco.us/images/logo.png",
  url: "https://glco.us",
  telephone: "+1-513-993-0921",
  email: "operations@glco.us",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "10901 Reed Hartman Hwy",
    addressLocality: "Blue Ash",
    addressRegion: "OH",
    postalCode: "45242",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "39.264187",
    longitude: "-84.381871",
  },
  areaServed: {
    "@type": "Country",
    name: "United States",
  },
  serviceType: [
    "Trucking Services",
    "Freight Transportation",
    "Logistics Services",
    "Dry Van Transportation",
    "Power Only Services",
    "Reefer Transportation",
    "Flatbed Transportation",
  ],
  openingHours: "Mo-Su 00:00-23:59",
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Global Cooperation LLC",
  url: "https://glco.us",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://glco.us/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export function createFAQSchema(questions: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

