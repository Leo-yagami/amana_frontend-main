import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer1";
import PageHero from "@/components/landing/PageHero";
import { Button } from "@/components/ui/button";
import Copy from "@/components/Copy";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const HOURS = [
  { dayKey: "contact.hours.weekday", dayFallback: "Monday - Friday", time: "9:00 AM - 5:00 PM" },
  { dayKey: "contact.hours.saturday", dayFallback: "Saturday", time: "10:00 AM - 2:00 PM" },
  { dayKey: "contact.hours.sunday", dayFallback: "Sunday", time: "Closed" },
];

export default function Contact() {
  const { t } = useTranslation();
  const mainRef = useRef<HTMLElement>(null);
  useScrollReveal(mainRef);

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: wire this up to your backend / email service
    setSubmitted(true);
  };

  return (
    <>
      {/* <Navbar /> */}
      <main ref={mainRef}>
        <PageHero
          title={t("contact.title", "Contact Us")}
          description={t("contact.description", "Have questions about our charity work or want to get involved? Reach out to us using the form below.")}
          // titleReveal={false}
          // descReveal={false}
        />

        <section className="py-12 sm:py-16 lg:py-20 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Form */}
            <div data-reveal="left" className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-10">
                  <p className="font-display text-lg font-bold text-primary mb-2">
                    {t("contact.success.title", "Message sent")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("contact.success.body", "Thanks for reaching out — we'll get back to you soon.")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t("contact.form.name", "Full Name")}</label>
                    <input
                      required
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder={t("contact.form.namePlaceholder", "Your name")}
                      className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t("contact.form.email", "Email")}</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder={t("contact.form.emailPlaceholder", "your@email.com")}
                      className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t("contact.form.phone", "Phone Number")}</label>
                    <input
                      value={form.phone}
                      onChange={handleChange("phone")}
                      placeholder={t("contact.form.phonePlaceholder", "+251 91 234 5678")}
                      className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t("contact.form.message", "Message")}</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange("message")}
                      placeholder={t("contact.form.messagePlaceholder", "How can we help you?")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl text-sm sm:text-base">
                    {t("contact.form.submit", "Send Message")}
                  </Button>
                </form>
              )}
            </div>

            {/* Get in touch + hours */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8">
                <Copy>
                  <h2 className="font-display text-lg font-bold text-primary mb-5">{t("contact.getInTouch", "Get in Touch")}</h2>
                </Copy>
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Copy delay={0}>
                        <div className="font-semibold text-sm">{t("contact.location.title", "Our Location")}</div>
                      </Copy>
                      <Copy delay={0.05}>
                        <div className="text-sm text-muted-foreground">
                          {t("contact.location.value", "123 Charity Street, Addis Ababa, Ethiopia")}
                        </div>
                      </Copy>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Copy delay={0.1}>
                        <div className="font-semibold text-sm">{t("contact.phone.title", "Phone Number")}</div>
                      </Copy>
                      <Copy delay={0.15}>
                        <div className="text-sm text-muted-foreground">{t("contact.phone.value", "+251 912 345 678")}</div>
                      </Copy>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Copy delay={0.2}>
                        <div className="font-semibold text-sm">{t("contact.email.title", "Email")}</div>
                      </Copy>
                      <Copy delay={0.25}>
                        <div className="text-sm text-muted-foreground">{t("contact.email.value", "info@amanacharity.org")}</div>
                      </Copy>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8">
                <Copy>
                  <h2 className="font-display text-lg font-bold text-primary mb-4">{t("contact.hours.title", "Our Hours")}</h2>
                </Copy>
                <ul className="space-y-2.5 text-sm">
                  {HOURS.map((h) => (
                    <li key={h.dayKey} className="flex items-center justify-between">
                      <span className="text-foreground/80">{t(h.dayKey, h.dayFallback)}</span>
                      <span className="text-muted-foreground">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* <Footer /> */}
    </>
  );
}