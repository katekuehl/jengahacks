import Logo from "@/components/Logo";
import mimisirobotiLogo from "@/assets/mimisiroboti-logo.png";
import SocialShare from "@/components/SocialShare";
import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="py-8 sm:py-10 md:py-12 bg-card border-t border-border" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <Logo className="mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
          <div className="mb-4">
            <SocialShare variant="compact" className="justify-center" />
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
            <a 
              href="https://www.linkedin.com/company/mimisiroboti" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{t("footer.runBy")}</span>
              <img src={mimisirobotiLogo} alt="Mimi Si Roboti" className="h-6 w-auto" />
              <span className="font-medium">Mimi Si Roboti</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
