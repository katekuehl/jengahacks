import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, MessageSquare } from "lucide-react";
import icon from "@/assets/jengahacks-icon.svg";
import SocialShare from "@/components/SocialShare";
import { useTranslation } from "@/hooks/useTranslation";
import { trackButtonClick } from "@/lib/analytics";

const Hero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-14 sm:pt-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 circuit-pattern opacity-30" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float delay-200" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Logo */}
          <header className="animate-slide-up mb-6 sm:mb-8 relative">
            <img 
              src={icon} 
              alt="JengaHacks Logo - East Africa's Premier Hackathon" 
              className="w-48 sm:w-64 md:w-80 mx-auto mb-3 sm:mb-4"
              width="320"
              height="320"
              loading="eager"
            />
            <h1 className="font-londrina text-4xl sm:text-6xl md:text-8xl tracking-wider px-2">
              <span className="text-white">JENGA</span>
              <span style={{ color: '#65bb3a' }}>HACKS</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mt-2 tracking-wide px-4">
              {t("hero.tagline")}
            </p>
          </header>

          {/* Tagline */}
          <p className="animate-slide-up delay-100 text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl px-4">
            {t("hero.description")}{" "}
            <span className="text-primary font-semibold">{t("hero.cta")}</span>
          </p>

          {/* Event Details */}
          <div className="animate-slide-up delay-200 flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-10 px-4" itemScope itemType="https://schema.org/Event">
            <div className="flex items-center gap-2 text-foreground text-sm sm:text-base" itemProp="startDate" content="2026-02-21T00:00:00+03:00">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" aria-hidden="true" />
              <time dateTime="2026-02-21">{t("hero.date")}</time>
            </div>
            <div className="flex items-center gap-2 text-foreground text-sm sm:text-base" itemProp="location" itemScope itemType="https://schema.org/Place">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" aria-hidden="true" />
              <span itemProp="name">{t("hero.location")}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="animate-slide-up delay-300 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4">
            <Button variant="hero" size="lg" className="sm:size-xl w-full sm:w-auto" asChild>
              <a 
                href="#register" 
                className="flex items-center justify-center gap-2"
                onClick={() => trackButtonClick("Register Now", "hero")}
              >
                {t("common.register")}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="sm:size-xl w-full sm:w-auto" asChild>
              <a 
                href="#about"
                onClick={() => trackButtonClick("Learn More", "hero")}
              >
                {t("common.learnMore")}
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="sm:size-xl w-full sm:w-auto border-indigo-500/50 hover:bg-indigo-500/10 hover:border-indigo-500 hover:text-indigo-400" 
              asChild
            >
              <a 
                href={import.meta.env.VITE_DISCORD_URL || "https://discord.gg/jengahacks"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                Join Discord
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="animate-slide-up delay-400 mt-12 sm:mt-16 grid grid-cols-2 gap-6 sm:gap-8 md:gap-16 w-full max-w-md px-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">100+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{t("hero.hackers")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">48</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{t("hero.hours")}</div>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="animate-slide-up delay-500 mt-8 sm:mt-12">
            <SocialShare variant="compact" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
