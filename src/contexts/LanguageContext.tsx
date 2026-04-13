import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "am";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    "nav.aboutUs": "About Us",
    "nav.campaigns": "Campaigns",
    "nav.impact": "Impact",
    "nav.stories": "Stories",
    "nav.contact": "Contact",
    "nav.dashboard": "Dashboard",
    "nav.donateNow": "Donate Now",
    
    // Hero Section
    "hero.badge": "Trusted by 10,000+ donors worldwide",
    "hero.title1": "Together, We Can",
    "hero.title2": "Change Lives",
    "hero.subtitle": "Join our mission to provide hope, education, healthcare, and sustainable support to communities in need. Every contribution creates lasting impact.",
    "hero.startDonating": "Start Donating",
    "hero.watchStory": "Watch Our Story",
    "hero.fundsRaised": "Funds Raised",
    "hero.livesImpacted": "Lives Impacted",
    "hero.activeCampaigns": "Active Campaigns",
    "hero.transparencyScore": "Transparency Score",
    
    // Campaigns Section
    "campaigns.badge": "Active Campaigns",
    "campaigns.title": "Support a Cause Today",
    "campaigns.subtitle": "Every campaign represents real people with real needs. Your contribution directly impacts lives.",
    "campaigns.donors": "donors",
    "campaigns.daysLeft": "days left",
    "campaigns.donateNow": "Donate Now",
    "campaigns.viewAll": "View All Campaigns",
    "campaigns.of": "of",
    
    // Impact Section
    "impact.badge": "Our Impact",
    "impact.title": "Making Real Difference",
    "impact.subtitle": "Transparent reporting of how your donations create lasting change in communities worldwide.",
    "impact.livesChanged": "Lives Changed",
    "impact.livesChangedDesc": "Individuals directly impacted by our programs",
    "impact.studentsEducated": "Students Educated",
    "impact.studentsEducatedDesc": "Children receiving quality education support",
    "impact.medicalTreatments": "Medical Treatments",
    "impact.medicalTreatmentsDesc": "Life-saving procedures and healthcare access",
    "impact.homesBuilt": "Homes Built",
    "impact.homesBuiltDesc": "Families provided with safe shelter",
    "impact.mealsServed": "Meals Served",
    "impact.mealsServedDesc": "Nutritious meals distributed annually",
    "impact.waterWells": "Water Wells",
    "impact.waterWellsDesc": "Clean water sources serving communities",
    "impact.trustedBy": "Recognized & Verified By",
    
    // Stories Section
    "stories.badge": "Success Stories",
    "stories.title": "Real Stories, Real Impact",
    "stories.subtitle": "Behind every number is a person. Here are some of the lives transformed through your generosity.",
    "stories.cta.title": "Be Part of the Next Success Story",
    "stories.cta.subtitle": "Your support creates these life-changing moments. Start making a difference today.",
    "stories.browseCampaigns": "Browse Campaigns",
    "stories.partnerWithUs": "Partner With Us",
    
    // Footer
    "footer.tagline": "Connecting generous hearts with those in need. Together, we build bridges of hope for a better tomorrow.",
    "footer.about": "About",
    "footer.ourMission": "Our Mission",
    "footer.leadershipTeam": "Leadership Team",
    "footer.annualReports": "Annual Reports",
    "footer.careers": "Careers",
    "footer.programs": "Programs",
    "footer.education": "Education",
    "footer.healthcare": "Healthcare",
    "footer.cleanWater": "Clean Water",
    "footer.emergencyRelief": "Emergency Relief",
    "footer.getInvolved": "Get Involved",
    "footer.donate": "Donate",
    "footer.volunteer": "Volunteer",
    "footer.corporatePartners": "Corporate Partners",
    "footer.fundraise": "Fundraise",
    "footer.copyright": "HopeBridge Foundation. All rights reserved.",
    "footer.nonprofit": "501(c)(3) Nonprofit",
    
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome back! Here's what's happening today.",
    "dashboard.thisMonth": "This Month",
    "dashboard.generateReport": "Generate Report",
    "dashboard.totalBeneficiaries": "Total Beneficiaries",
    "dashboard.activeDonors": "Active Donors",
    "dashboard.fundsRaisedMTD": "Funds Raised (MTD)",
    "dashboard.activeCampaigns": "Active Campaigns",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.upcomingEvents": "Upcoming Events",
    "dashboard.topCampaigns": "Top Campaigns",
    "dashboard.viewAll": "View All",
    "dashboard.attendees": "attendees",
    "dashboard.donors": "donors",
    
    // Sidebar
    "sidebar.dashboard": "Dashboard",
    "sidebar.beneficiaries": "Beneficiaries",
    "sidebar.donors": "Donors",
    "sidebar.campaigns": "Campaigns",
    "sidebar.events": "Events",
    "sidebar.finances": "Finances",
    "sidebar.reports": "Reports",
    "sidebar.settings": "Settings",
    "sidebar.logout": "Log Out",
    
    // Header
    "header.search": "Search beneficiaries, donors, campaigns...",
    "header.admin": "Admin User",
    "header.role": "Administrator",
    
    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account and application preferences",
    "settings.profile": "Profile Settings",
    "settings.profileDesc": "Manage your personal information and preferences",
    "settings.organization": "Organization",
    "settings.organizationDesc": "Update organization details and branding",
    "settings.notifications": "Notifications",
    "settings.notificationsDesc": "Configure email and in-app notification preferences",
    "settings.security": "Security",
    "settings.securityDesc": "Password, two-factor authentication, and access logs",
    "settings.appearance": "Appearance",
    "settings.appearanceDesc": "Theme, language, and display preferences",
    "settings.integrations": "Integrations",
    "settings.integrationsDesc": "Connect payment gateways, email services, and APIs",
    "settings.quickActions": "Quick Actions",
    "settings.exportData": "Export All Data",
    "settings.auditLogs": "View Audit Logs",
    "settings.apiDocs": "API Documentation",
    "settings.deleteAccount": "Delete Account",
    "settings.themeColor": "Theme Color",
    "settings.themeColorDesc": "Choose your preferred primary color",
    "settings.language": "Language",
    "settings.languageDesc": "Select your preferred language",
    "settings.darkMode": "Dark Mode",
    "settings.darkModeDesc": "Toggle dark mode on or off",
    
    // Common
    "common.search": "Search",
    "common.filter": "Filter",
    "common.add": "Add",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.loading": "Loading...",
  },
  am: {
    // Navbar
    "nav.aboutUs": "ስለ እኛ",
    "nav.campaigns": "ዘመቻዎች",
    "nav.impact": "ተጽዕኖ",
    "nav.stories": "ታሪኮች",
    "nav.contact": "ያግኙን",
    "nav.dashboard": "ዳሽቦርድ",
    "nav.donateNow": "አሁን ይለግሱ",
    
    // Hero Section
    "hero.badge": "በ10,000+ ለጋሾች በዓለም አቀፍ ደረጃ የታመነ",
    "hero.title1": "አብረን እንችላለን",
    "hero.title2": "ህይወት መቀየር",
    "hero.subtitle": "ለሚያስፈልጋቸው ማህበረሰቦች ተስፋ፣ ትምህርት፣ ጤና አገልግሎት እና ዘላቂ ድጋፍ ለመስጠት ተልዕኮአችንን ይቀላቀሉ። እያንዳንዱ አስተዋጽኦ ዘላቂ ተጽዕኖ ይፈጥራል።",
    "hero.startDonating": "መለገስ ይጀምሩ",
    "hero.watchStory": "ታሪካችንን ይመልከቱ",
    "hero.fundsRaised": "የተሰበሰበ ገንዘብ",
    "hero.livesImpacted": "የተረዱ ህይወቶች",
    "hero.activeCampaigns": "ንቁ ዘመቻዎች",
    "hero.transparencyScore": "የግልጽነት ነጥብ",
    
    // Campaigns Section
    "campaigns.badge": "ንቁ ዘመቻዎች",
    "campaigns.title": "ዛሬ አንድ ዓላማ ይደግፉ",
    "campaigns.subtitle": "እያንዳንዱ ዘመቻ እውነተኛ ሰዎችን ከእውነተኛ ፍላጎቶች ጋር ይወክላል። የእርስዎ አስተዋጽኦ በቀጥታ ህይወትን ይጎዳል።",
    "campaigns.donors": "ለጋሾች",
    "campaigns.daysLeft": "ቀናት ቀሪ",
    "campaigns.donateNow": "አሁን ይለግሱ",
    "campaigns.viewAll": "ሁሉንም ዘመቻዎች ይመልከቱ",
    "campaigns.of": "ከ",
    
    // Impact Section
    "impact.badge": "ተጽዕኖአችን",
    "impact.title": "እውነተኛ ልዩነት መፍጠር",
    "impact.subtitle": "ልገሳዎችዎ በዓለም ዙሪያ ባሉ ማህበረሰቦች ውስጥ ዘላቂ ለውጥ እንዴት እንደሚፈጥሩ ግልጽ ሪፖርት ማድረግ።",
    "impact.livesChanged": "የተቀየሩ ህይወቶች",
    "impact.livesChangedDesc": "በፕሮግራሞቻችን በቀጥታ የተጎዱ ግለሰቦች",
    "impact.studentsEducated": "የተማሩ ተማሪዎች",
    "impact.studentsEducatedDesc": "ጥራት ያለው የትምህርት ድጋፍ የሚያገኙ ልጆች",
    "impact.medicalTreatments": "የህክምና አገልግሎቶች",
    "impact.medicalTreatmentsDesc": "ህይወት አድን ሕክምናዎች እና የጤና አገልግሎት ተደራሽነት",
    "impact.homesBuilt": "የተገነቡ ቤቶች",
    "impact.homesBuiltDesc": "ደህንነቱ የተጠበቀ መጠለያ የተሰጣቸው ቤተሰቦች",
    "impact.mealsServed": "የተቀረቡ ምግቦች",
    "impact.mealsServedDesc": "በየዓመቱ የሚከፋፈሉ ገንቢ ምግቦች",
    "impact.waterWells": "የውሃ ጉድጓዶች",
    "impact.waterWellsDesc": "ማህበረሰቦችን የሚያገለግሉ ንጹህ የውሃ ምንጮች",
    "impact.trustedBy": "የታወቀ እና የተረጋገጠ በ",
    
    // Stories Section
    "stories.badge": "የስኬት ታሪኮች",
    "stories.title": "እውነተኛ ታሪኮች፣ እውነተኛ ተጽዕኖ",
    "stories.subtitle": "ከእያንዳንዱ ቁጥር ጀርባ ሰው አለ። በልግስናዎ የተቀየሩ አንዳንድ ህይወቶች እነሆ።",
    "stories.cta.title": "የሚቀጥለው የስኬት ታሪክ አካል ይሁኑ",
    "stories.cta.subtitle": "የእርስዎ ድጋፍ እነዚህን ህይወት የሚቀይሩ ጊዜዎችን ይፈጥራል። ዛሬ ልዩነት ማድረግ ይጀምሩ።",
    "stories.browseCampaigns": "ዘመቻዎችን ያስሱ",
    "stories.partnerWithUs": "ከእኛ ጋር ይተባበሩ",
    
    // Footer
    "footer.tagline": "ለሚያስፈልጋቸው ሰዎች ልግስና ያላቸውን ልቦች ማገናኘት። አብረን ለተሻለ ነገ የተስፋ ድልድዮችን እንገነባለን።",
    "footer.about": "ስለ እኛ",
    "footer.ourMission": "ተልዕኮአችን",
    "footer.leadershipTeam": "የአመራር ቡድን",
    "footer.annualReports": "ዓመታዊ ሪፖርቶች",
    "footer.careers": "ሥራዎች",
    "footer.programs": "ፕሮግራሞች",
    "footer.education": "ትምህርት",
    "footer.healthcare": "ጤና አገልግሎት",
    "footer.cleanWater": "ንጹህ ውሃ",
    "footer.emergencyRelief": "የአደጋ ጊዜ እርዳታ",
    "footer.getInvolved": "ይሳተፉ",
    "footer.donate": "ይለግሱ",
    "footer.volunteer": "በፈቃደኝነት ይስሩ",
    "footer.corporatePartners": "የድርጅት አጋሮች",
    "footer.fundraise": "ገንዘብ ያሰባስቡ",
    "footer.copyright": "ሆፕብሪጅ ፋውንዴሽን። መብቱ በህግ የተጠበቀ ነው።",
    "footer.nonprofit": "501(c)(3) ለትርፍ ያልተቋቋመ",
    
    // Dashboard
    "dashboard.title": "ዳሽቦርድ",
    "dashboard.welcome": "እንኳን ደህና መጡ! ዛሬ የሚሆነው ይኸውና።",
    "dashboard.thisMonth": "በዚህ ወር",
    "dashboard.generateReport": "ሪፖርት ያዘጋጁ",
    "dashboard.totalBeneficiaries": "ጠቅላላ ተጠቃሚዎች",
    "dashboard.activeDonors": "ንቁ ለጋሾች",
    "dashboard.fundsRaisedMTD": "የተሰበሰበ ገንዘብ (MTD)",
    "dashboard.activeCampaigns": "ንቁ ዘመቻዎች",
    "dashboard.recentActivity": "የቅርብ ጊዜ እንቅስቃሴ",
    "dashboard.upcomingEvents": "መጪ ክስተቶች",
    "dashboard.topCampaigns": "ዋና ዘመቻዎች",
    "dashboard.viewAll": "ሁሉንም ይመልከቱ",
    "dashboard.attendees": "ተሳታፊዎች",
    "dashboard.donors": "ለጋሾች",
    
    // Sidebar
    "sidebar.dashboard": "ዳሽቦርድ",
    "sidebar.beneficiaries": "ተጠቃሚዎች",
    "sidebar.donors": "ለጋሾች",
    "sidebar.campaigns": "ዘመቻዎች",
    "sidebar.events": "ክስተቶች",
    "sidebar.finances": "ፋይናንስ",
    "sidebar.reports": "ሪፖርቶች",
    "sidebar.settings": "ቅንብሮች",
    "sidebar.logout": "ይውጡ",
    
    // Header
    "header.search": "ተጠቃሚዎች፣ ለጋሾች፣ ዘመቻዎችን ይፈልጉ...",
    "header.admin": "አስተዳዳሪ ተጠቃሚ",
    "header.role": "አስተዳዳሪ",
    
    // Settings
    "settings.title": "ቅንብሮች",
    "settings.subtitle": "መለያዎን እና የመተግበሪያ ምርጫዎችዎን ያስተዳድሩ",
    "settings.profile": "የመገለጫ ቅንብሮች",
    "settings.profileDesc": "የግል መረጃዎን እና ምርጫዎችዎን ያስተዳድሩ",
    "settings.organization": "ድርጅት",
    "settings.organizationDesc": "የድርጅት ዝርዝሮችን እና ብራንዲንግን ያዘምኑ",
    "settings.notifications": "ማሳወቂያዎች",
    "settings.notificationsDesc": "የኢሜይል እና የመተግበሪያ ውስጥ ማሳወቂያ ምርጫዎችን ያዋቅሩ",
    "settings.security": "ደህንነት",
    "settings.securityDesc": "የይለፍ ቃል፣ ባለ ሁለት ደረጃ ማረጋገጫ እና የመዳረሻ ምዝግብ ማስታወሻዎች",
    "settings.appearance": "ገጽታ",
    "settings.appearanceDesc": "ገጽታ፣ ቋንቋ እና የማሳያ ምርጫዎች",
    "settings.integrations": "ውህደቶች",
    "settings.integrationsDesc": "የክፍያ መግቢያዎችን፣ የኢሜይል አገልግሎቶችን እና APIዎችን ያገናኙ",
    "settings.quickActions": "ፈጣን ድርጊቶች",
    "settings.exportData": "ሁሉንም ውሂብ ላክ",
    "settings.auditLogs": "የኦዲት ምዝግብ ማስታወሻዎችን ይመልከቱ",
    "settings.apiDocs": "የAPI ሰነድ",
    "settings.deleteAccount": "መለያ ሰርዝ",
    "settings.themeColor": "የገጽታ ቀለም",
    "settings.themeColorDesc": "የመረጡትን ዋና ቀለም ይምረጡ",
    "settings.language": "ቋንቋ",
    "settings.languageDesc": "የመረጡትን ቋንቋ ይምረጡ",
    "settings.darkMode": "ጨለማ ሁነታ",
    "settings.darkModeDesc": "ጨለማ ሁነታን ያብሩ ወይም ያጥፉ",
    
    // Common
    "common.search": "ፈልግ",
    "common.filter": "አጣራ",
    "common.add": "ጨምር",
    "common.edit": "አርም",
    "common.delete": "ሰርዝ",
    "common.save": "አስቀምጥ",
    "common.cancel": "ሰርዝ",
    "common.loading": "በመጫን ላይ...",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("language") as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr"; // Amharic uses LTR
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
