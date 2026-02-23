import { useEffect, useRef } from "react";

// Static structured data objects - moved outside component to avoid recreation on each render
const eventStructuredData = {
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "JengaHacks 2026",
  "description": "East Africa's premier hackathon. Join developers, designers, and entrepreneurs to build innovative solutions across FinTech, HealthTech, AgriTech, EdTech, Climate Tech, JobTech, AI/ML, and Open Innovation tracks.",
  "startDate": "2026-02-28T08:00:00+03:00",
  "endDate": "2026-02-28T23:59:59+03:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Nairobi, Kenya",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Nairobi",
      "addressCountry": "KE"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "JengaHacks",
    "url": "https://jengahacks.com"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "KES",
    "availability": "https://schema.org/InStock",
    "url": "https://jengahacks.com#register"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Developers, Designers, Entrepreneurs"
  }
};

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "JengaHacks",
  "url": "https://jengahacks.com",
  "logo": "https://jengahacks.com/jengahacks-logo.png",
  "description": "East Africa's premier hackathon event, bringing together developers, designers, and entrepreneurs to build innovative solutions.",
  "foundingLocation": {
    "@type": "Place",
    "addressLocality": "Nairobi",
    "addressCountry": "KE"
  },
  "sameAs": [
    // Add social media links when available
  ]
};

const StructuredData = () => {
  const eventScriptRef = useRef<HTMLScriptElement>(null);
  const organizationScriptRef = useRef<HTMLScriptElement>(null);

  useEffect(() => {
    // Safely set JSON-LD content using textContent instead of dangerouslySetInnerHTML
    if (eventScriptRef.current) {
      eventScriptRef.current.textContent = JSON.stringify(eventStructuredData);
    }
    if (organizationScriptRef.current) {
      organizationScriptRef.current.textContent = JSON.stringify(organizationStructuredData);
    }
  }, []);

  return (
    <>
      <script
        ref={eventScriptRef}
        type="application/ld+json"
      />
      <script
        ref={organizationScriptRef}
        type="application/ld+json"
      />
    </>
  );
};

export default StructuredData;


