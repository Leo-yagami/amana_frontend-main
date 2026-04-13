import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    about: [
      { label: t("footer.ourMission"), href: "#about" },
      { label: t("footer.leadershipTeam"), href: "#" },
      { label: t("footer.annualReports"), href: "#" },
      { label: t("footer.careers"), href: "#" },
    ],
    programs: [
      { label: t("footer.education"), href: "#" },
      { label: t("footer.healthcare"), href: "#" },
      { label: t("footer.cleanWater"), href: "#" },
      { label: t("footer.emergencyRelief"), href: "#" },
    ],
    getInvolved: [
      { label: t("footer.donate"), href: "#campaigns" },
      { label: t("footer.volunteer"), href: "#" },
      { label: t("footer.corporatePartners"), href: "#" },
      { label: t("footer.fundraise"), href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer id="contact" className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 lg:py-20">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent-foreground fill-current" />
              </div>
              <span className="text-xl font-bold">
                Hope<span className="text-accent">Bridge</span>
              </span>
            </Link>
            <p className="text-background/70 mb-6 max-w-sm">
              {t("footer.tagline")}
            </p>
            <div className="space-y-3 text-background/70">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent" />
                <span>contact@hopebridge.org</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-accent" />
                <span>123 Hope Street, Charity City</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.about")}</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-accent transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.programs")}</h4>
            <ul className="space-y-3">
              {footerLinks.programs.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-accent transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.getInvolved")}</h4>
            <ul className="space-y-3">
              {footerLinks.getInvolved.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-accent transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/60 text-sm">
              © {currentYear} {t("footer.copyright")} | {t("footer.nonprofit")}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <social.icon className="w-5 h-5" />
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
