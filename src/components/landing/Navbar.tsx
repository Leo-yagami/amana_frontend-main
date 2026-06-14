import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLenis } from "lenis/react";

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const lenis = useLenis();

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    lenis?.scrollTo(href);
  };

  const navLinks = [
    { labelKey: "navbar.aboutUs", href: "#about" },
    { labelKey: "navbar.campaigns", href: "#campaigns" },
    { labelKey: "navbar.impact", href: "#impact" },
    { labelKey: "navbar.stories", href: "#stories" },
    { labelKey: "navbar.contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border will-change-transform">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
              <Heart className="w-5 h-5 text-primary-foreground fill-current" />
            </div>
            <span className="text-xl font-bold text-foreground">
              {t("brand.hope")}
              <span className="text-primary">{t("brand.bridge")}</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.labelKey}
                href={link.href}
                onClick={handleNavClick(link.href)}
                className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <Link to="/dashboard">
              <Button variant="ghost">{t("navbar.dashboard")}</Button>
            </Link>
            <Link to="/payment">
              <Button variant="default">{t("navbar.donateNow")}</Button>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            type="button"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.labelKey}
                  href={link.href}
                  onClick={handleNavClick(link.href)}
                  className="px-4 py-3 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg font-medium transition-all duration-200"
                >
                  {t(link.labelKey)}
                </a>
              ))}
              <div className="flex gap-2 mt-4 px-4">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              <div className="flex flex-col gap-2 mt-4 px-4">
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t("navbar.dashboard")}
                  </Button>
                </Link>
                <Link to="/payment" onClick={() => setIsOpen(false)}>
                  <Button variant="default" className="w-full">
                    {t("navbar.donateNow")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
