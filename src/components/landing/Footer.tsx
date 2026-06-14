import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

const socialLinks = [
  { icon: Facebook, href: "#", labelKey: "Facebook" },
  { icon: Twitter, href: "#", labelKey: "Twitter" },
  { icon: Instagram, href: "#", labelKey: "Instagram" },
  { icon: Linkedin, href: "#", labelKey: "LinkedIn" },
  { icon: Youtube, href: "#", labelKey: "YouTube" },
];

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = useMemo(
    () => ({
      about: [
        { labelKey: "footer.mission", href: "#about" },
        { labelKey: "footer.leadership", href: "#" },
        { labelKey: "footer.annualReports", href: "#" },
        { labelKey: "footer.careers", href: "#" },
      ],
      programs: [
        { labelKey: "footer.education", href: "#" },
        { labelKey: "footer.healthcare", href: "#" },
        { labelKey: "footer.cleanWater", href: "#" },
        { labelKey: "footer.emergencyRelief", href: "#" },
      ],
      getInvolved: [
        { labelKey: "footer.donate", href: "#campaigns" },
        { labelKey: "footer.volunteer", href: "#" },
        { labelKey: "footer.corporatePartners", href: "#" },
        { labelKey: "footer.fundraise", href: "#" },
      ],
    }),
    []
  );

  return (
    <footer id="contact" className="bg-foreground text-background will-change-transform">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent-foreground fill-current" />
              </div>
              <span className="text-lg sm:text-xl font-bold">
                {t("brand.hope")}
                <span className="text-accent">{t("brand.bridge")}</span>
              </span>
            </Link>
            <p className="text-background/70 mb-4 sm:mb-6 max-w-sm text-sm sm:text-base">
              {t("footer.tagline")}
            </p>
            <div className="space-y-2 sm:space-y-3 text-background/70 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                <span>contact@hopebridge.org</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                <span>123 Hope Street, Charity City</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t("footer.about")}</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.labelKey}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-accent transition-colors text-xs sm:text-sm"
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t("footer.programs")}</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.programs.map((link) => (
                <li key={link.labelKey}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-accent transition-colors text-xs sm:text-sm"
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t("footer.getInvolved")}</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.getInvolved.map((link) => (
                <li key={link.labelKey}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-accent transition-colors text-xs sm:text-sm"
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-background/60 text-xs sm:text-sm text-center sm:text-left">
              &copy; {currentYear} {t("footer.copyright")}
              <span className="hidden sm:inline"> | {t("footer.nonprofit")}</span>
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.labelKey}
                  href={social.href}
                  aria-label={social.labelKey}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
