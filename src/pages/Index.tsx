import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Sponsors from "@/components/Sponsors";
import BlogPreview from "@/components/BlogPreview";
import Registration from "@/components/Registration";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import ScrollReveal from "@/components/ScrollReveal";

const Index = () => {
  return (
    <>
      <SEO />
      <StructuredData />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <ScrollReveal direction="up" delay={100}>
            <About />
          </ScrollReveal>
          <ScrollReveal direction="up" delay={200}>
            <Sponsors />
          </ScrollReveal>
          <ScrollReveal direction="up" delay={300}>
            <BlogPreview />
          </ScrollReveal>
          <ScrollReveal direction="up" delay={400}>
            <Registration />
          </ScrollReveal>
        </main>
        <ScrollReveal direction="up" delay={500}>
          <Footer />
        </ScrollReveal>
      </div>
    </>
  );
};

export default Index;
