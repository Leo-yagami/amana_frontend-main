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

const footerLinks = {
  about: [
    { label: "Our Mission", href: "#about" },
    { label: "Leadership Team", href: "#" },
    { label: "Annual Reports", href: "#" },
    { label: "Careers", href: "#" },
  ],
  programs: [
    { label: "Education", href: "#" },
    { label: "Healthcare", href: "#" },
    { label: "Clean Water", href: "#" },
    { label: "Emergency Relief", href: "#" },
  ],
  getInvolved: [
    { label: "Donate", href: "#campaigns" },
    { label: "Volunteer", href: "#" },
    { label: "Corporate Partners", href: "#" },
    { label: "Fundraise", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent-foreground fill-current" />
              </div>
              <span className="text-lg sm:text-xl font-bold">
                Hope<span className="text-accent">Bridge</span>
              </span>
            </Link>
            <p className="text-background/70 mb-4 sm:mb-6 max-w-sm text-sm sm:text-base">
              Connecting generous hearts with those in need. Together, we build
              bridges of hope for a better tomorrow.
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

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">About</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-accent transition-colors text-xs sm:text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Programs</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.programs.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-accent transition-colors text-xs sm:text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Get Involved</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.getInvolved.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-accent transition-colors text-xs sm:text-sm"
                  >
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
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-background/60 text-xs sm:text-sm text-center sm:text-left">
              &copy; {currentYear} HopeBridge Foundation. All rights reserved.
              <span className="hidden sm:inline"> | 501(c)(3) Nonprofit</span>
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
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
