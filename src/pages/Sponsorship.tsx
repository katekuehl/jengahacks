import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Sparkles, Zap, Crown, Gem } from "lucide-react";
import { Link } from "react-router-dom";
import icon from "@/assets/jengahacks-icon.svg";
import SEO from "@/components/SEO";
import { useTranslation } from "@/hooks/useTranslation";

const Sponsorship = () => {
  const { t } = useTranslation();
  
  const packages = [
    {
      name: t("sponsorship.packages.bronze.name"),
      price: "$100",
      icon: Zap,
      color: "from-amber-700 to-amber-500",
      description: t("sponsorship.packages.bronze.description"),
      features: [
        t("sponsorship.packages.bronze.features.logo"),
        t("sponsorship.packages.bronze.features.socialMedia"),
        t("sponsorship.packages.bronze.features.mentorPass"),
      ],
    },
    {
      name: t("sponsorship.packages.silver.name"),
      price: "$200",
      icon: Sparkles,
      color: "from-slate-400 to-slate-300",
      description: t("sponsorship.packages.silver.description"),
      features: [
        t("sponsorship.packages.silver.features.everythingBronze"),
        t("sponsorship.packages.silver.features.banners"),
        t("sponsorship.packages.silver.features.mentorPasses"),
        t("sponsorship.packages.silver.features.pitch"),
        t("sponsorship.packages.silver.features.swag"),
      ],
    },
    {
      name: t("sponsorship.packages.gold.name"),
      price: "$500",
      icon: Crown,
      color: "from-yellow-500 to-yellow-300",
      popular: true,
      description: t("sponsorship.packages.gold.description"),
      features: [
        t("sponsorship.packages.gold.features.everythingSilver"),
        t("sponsorship.packages.gold.features.booth"),
        t("sponsorship.packages.gold.features.mentorPasses"),
        t("sponsorship.packages.gold.features.keynote"),
        t("sponsorship.packages.gold.features.tshirts"),
        t("sponsorship.packages.gold.features.priority"),
        t("sponsorship.packages.gold.features.resumes"),
      ],
    },
    {
      name: t("sponsorship.packages.platinum.name"),
      price: "$1,000",
      icon: Gem,
      color: "from-violet-500 to-fuchsia-400",
      description: t("sponsorship.packages.platinum.description"),
      features: [
        t("sponsorship.packages.platinum.features.everythingGold"),
        t("sponsorship.packages.platinum.features.titleSponsor"),
        t("sponsorship.packages.platinum.features.mentorPasses"),
        t("sponsorship.packages.platinum.features.workshop"),
        t("sponsorship.packages.platinum.features.hiring"),
        t("sponsorship.packages.platinum.features.marketing"),
        t("sponsorship.packages.platinum.features.vipDinner"),
      ],
    },
  ];
  return (
    <>
      <SEO 
        title="Become a Sponsor | JengaHacks 2026"
        description="Partner with JengaHacks 2026 and connect with 200+ talented developers, designers, and innovators. Choose from Bronze, Silver, Gold, or Platinum sponsorship packages."
        url="https://jengahacks.com/sponsorship"
      />
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{t("sponsorship.backToHome")}</span>
            <span className="sm:hidden">{t("sponsorship.back")}</span>
          </Link>
          <Link to="/" className="flex items-center gap-2" aria-label="JengaHacks Home">
            <img src={icon} alt="JengaHacks - East Africa's Premier Hackathon" className="h-8 sm:h-10 w-auto" width="40" height="40" />
            <span className="font-londrina text-xl sm:text-2xl">
              <span className="text-white">JENGA</span>
              <span style={{ color: '#65bb3a' }}>HACKS</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 circuit-pattern opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 px-4">
              <span className="text-gradient">{t("sponsorship.partner")}</span> {t("sponsorship.withJengahacks")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              {t("sponsorship.connectDescription")}
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>{t("sponsorship.participants")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>{t("sponsorship.hoursInnovation")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>{t("sponsorship.topTalent")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {packages.map((pkg) => (
              <Card 
                key={pkg.name} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  pkg.popular ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-2 sm:px-3 py-1 rounded-bl-lg">
                    {t("sponsorship.mostPopular")}
                  </div>
                )}
                <CardHeader className="text-center pb-2 p-4 sm:p-6">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${pkg.color} flex items-center justify-center`}>
                    <pkg.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl">{pkg.name}</CardTitle>
                  <div className="text-3xl sm:text-4xl font-bold text-gradient mt-2">{pkg.price}</div>
                  <CardDescription className="mt-2 text-sm">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={pkg.popular ? "hero" : "outline"} 
                    className="w-full"
                    asChild
                  >
                    <a href={`mailto:hello@siliconsavannahsolutions.com?subject=Sponsorship Inquiry - ${pkg.name} Package`}>
                      {t("sponsorship.getStarted")}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Sponsor Section */}
      <section className="py-12 sm:py-16 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 px-4">
            {t("sponsorship.whySponsor")} <span className="text-gradient">{t("sponsorship.sponsorJengahacks")}</span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">🎯</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t("sponsorship.talentPipeline")}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("sponsorship.talentPipelineDesc")}
              </p>
            </div>
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">🚀</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t("sponsorship.brandVisibility")}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("sponsorship.brandVisibilityDesc")}
              </p>
            </div>
            <div className="text-center p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">💡</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t("sponsorship.freshIdeas")}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("sponsorship.freshIdeasDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">
            {t("sponsorship.readyToImpact")} <span className="text-gradient">{t("sponsorship.makeImpact")}</span>?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            {t("sponsorship.questionsDescription")}
          </p>
          <Button variant="hero" size="lg" className="sm:size-xl" asChild>
            <a href="mailto:hello@siliconsavannahsolutions.com">
              {t("sponsorship.contactUs")}
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 text-center text-muted-foreground">
          <p className="text-xs sm:text-sm">{t("sponsorship.copyright")}</p>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Sponsorship;
