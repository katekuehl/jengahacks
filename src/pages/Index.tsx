import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import SEO from "@/components/SEO";
import SkipLink from "@/components/SkipLink";
import StructuredData from "@/components/StructuredData";
import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Lazy load below-fold components for better initial load performance
const About = lazy(() => import("@/components/About"));
const Sponsors = lazy(() => import("@/components/Sponsors"));
const Prizes = lazy(() => import("@/components/Prizes"));


const Schedule = lazy(() => import("@/components/Schedule"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  const location = useLocation();

  // Handle hash navigation from other pages
  useEffect(() => {
    if (location.hash) {
      // Wait for page to render, then scroll to section
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <>
      <SEO />
      <StructuredData />
      <SkipLink />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          <Hero />
          <Suspense fallback={null}>
            <ScrollReveal direction="up" delay={100}>
              <About />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <Sponsors />
            </ScrollReveal>
{/* 
            <ScrollReveal direction="up" delay={300}>
              <Prizes />
            </ScrollReveal> 
            */}

            <ScrollReveal direction="up" delay={400}>
              <Schedule />
            </ScrollReveal>
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <ScrollReveal direction="up" delay={500}>
            <Footer />
          </ScrollReveal>
        </Suspense>
      </div>
    </>
  );
};

export default Index;
