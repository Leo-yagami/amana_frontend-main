import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Twitter } from "lucide-react";
import {FaFacebook} from "react-icons/fa"
import {FiInstagram} from "react-icons/fi"
import {FaXTwitter} from "react-icons/fa6"

import { Button } from "@/components/ui/button";

const QUICK_LINKS = [
  { labelKey: "nav.home", fallback: "Home", to: "/" },
  { labelKey: "nav.events", fallback: "Events", to: "/events" },
  { labelKey: "nav.about", fallback: "About Us", to: "/about" },
  { labelKey: "nav.contact", fallback: "Contact", to: "/contact" },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="font-display text-lg font-bold text-primary mb-3">
              {t("footer.brand", "Amana Charity")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
              {t("footer.description", "Empowering communities through transparent charity and support for those in need.")}
            </p>
            <div className="flex items-center gap-3">
              {[FaFacebook, FiInstagram, FaXTwitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">{t("footer.quickLinks", "Quick Links")}</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.labelKey}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {t(link.labelKey, link.fallback)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">{t("footer.contactUs", "Contact Us")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>{t("footer.address1", "123 Charity Street")}</li>
              <li>{t("footer.address2", "Addis Ababa, Ethiopia")}</li>
              <li>{t("footer.phone", "Phone: +251 912 345 678")}</li>
              <li>{t("footer.email", "Email: info@amanacharity.org")}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">{t("footer.newsletter", "Newsletter")}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t("footer.newsletterDesc", "Subscribe to our newsletter for updates on our charity work and events.")}
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder", "Your email")}
                className="flex-1 min-w-0 h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" className="h-10 px-4 text-sm shrink-0">
                {t("footer.subscribe", "Subscribe")}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          {t("footer.copyright", "© {{year}} Amana Charity & Edir. All rights reserved.", {
            year: new Date().getFullYear(),
          })}
        </div>
      </div>
    </footer>
  );
}