import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import { useTranslation } from "@/hooks/useTranslation";
import ScrollReveal from "@/components/ScrollReveal";

const FAQ = () => {
  const { t } = useTranslation();

  // Get FAQ items from translations
  const faqItems = [
    {
      id: "what-is-jengahacks",
      question: t("faq.whatIsJengahacks.question"),
      answer: t("faq.whatIsJengahacks.answer"),
    },
    {
      id: "when-where",
      question: t("faq.whenWhere.question"),
      answer: t("faq.whenWhere.answer"),
    },
    {
      id: "who-can-participate",
      question: t("faq.whoCanParticipate.question"),
      answer: t("faq.whoCanParticipate.answer"),
    },
    {
      id: "team-size",
      question: t("faq.teamSize.question"),
      answer: t("faq.teamSize.answer"),
    },
    {
      id: "what-to-bring",
      question: t("faq.whatToBring.question"),
      answer: t("faq.whatToBring.answer"),
    },
    {
      id: "cost",
      question: t("faq.cost.question"),
      answer: t("faq.cost.answer"),
    },
    {
      id: "prizes",
      question: t("faq.prizes.question"),
      answer: t("faq.prizes.answer"),
    },
    {
      id: "registration-deadline",
      question: t("faq.registrationDeadline.question"),
      answer: t("faq.registrationDeadline.answer"),
    },
    {
      id: "waitlist",
      question: t("faq.waitlist.question"),
      answer: t("faq.waitlist.answer"),
    },
    {
      id: "more-questions",
      question: t("faq.moreQuestions.question"),
      answer: t("faq.moreQuestions.answer"),
    },
  ];

  return (
    <>
      <SEO 
        title="Frequently Asked Questions | JengaHacks 2026"
        description="Everything you need to know about JengaHacks 2026. Find answers about participation, registration, prizes, team formation, and more."
        url="https://jengahacks.com/faq"
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-16 sm:pt-20">
          {/* Hero Section */}
          <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden" aria-labelledby="faq-heading">
            <div className="absolute inset-0 circuit-pattern opacity-20" aria-hidden="true" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" aria-hidden="true" />
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <ScrollReveal direction="up" delay={0}>
                <header className="text-center max-w-3xl mx-auto">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mb-6 mx-auto">
                    <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" aria-hidden="true" />
                  </div>
                  <h1 id="faq-heading" className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 px-4">
                    <span className="text-gradient">{t("faq.title")}</span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
                    {t("faq.subtitle")}
                  </p>
                </header>
              </ScrollReveal>
            </div>
          </section>

          {/* FAQ Accordion Section */}
          <section className="py-12 sm:py-16" aria-labelledby="faq-questions-heading">
            <div className="container mx-auto px-4 sm:px-6">
              <ScrollReveal direction="up" delay={100}>
                <h2 id="faq-questions-heading" className="sr-only">FAQ Questions</h2>
                <div className="max-w-4xl mx-auto">
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqItems.map((item) => (
                      <AccordionItem 
                        key={item.id} 
                        value={item.id}
                        className="border border-border rounded-lg px-4 sm:px-6 bg-card hover:bg-card/80 transition-colors"
                      >
                        <AccordionTrigger className="text-left text-base sm:text-lg font-semibold py-4 sm:py-6 hover:no-underline">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm sm:text-base text-muted-foreground pb-4 sm:pb-6 pt-0">
                          <div className="whitespace-pre-line leading-relaxed">{item.answer}</div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Contact CTA Section */}
          <section className="py-12 sm:py-16 bg-card/50" aria-labelledby="contact-cta-heading">
            <div className="container mx-auto px-4 sm:px-6">
              <ScrollReveal direction="up" delay={200}>
                <div className="max-w-2xl mx-auto text-center">
                  <h2 id="contact-cta-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                    {t("faq.moreQuestions.question")}
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                    {t("faq.moreQuestions.answer")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" size="lg" asChild>
                      <a 
                        href="mailto:hello@siliconsavannahsolutions.com"
                        className="flex items-center gap-2"
                        aria-label="Email us at hello@siliconsavannahsolutions.com"
                      >
                        <Mail className="w-5 h-5" aria-hidden="true" />
                        Email Us
                      </a>
                    </Button>
                    <Button variant="hero" size="lg" asChild>
                      <a 
                        href="https://discord.gg/jengahacks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                        aria-label="Join our Discord community - Opens in new tab"
                      >
                        <MessageCircle className="w-5 h-5" aria-hidden="true" />
                        Join Discord
                      </a>
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </main>
        
        <footer className="border-t border-border py-6 sm:py-8" role="contentinfo">
          <div className="container mx-auto px-4 sm:px-6 text-center text-muted-foreground">
            <p className="text-xs sm:text-sm">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default FAQ;

