import { Bell, Search, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { t } = useTranslation();
  return (
    <header className="h-14 sm:h-16 lg:h-20 bg-card border-b border-border flex items-center justify-between px-3 sm:px-4 lg:px-8">
      {/* Left side */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10"
          onClick={onMenuClick}
        >
          <Menu className="w-4 sm:w-5 h-4 sm:h-5" />
        </Button>
        
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder={t("dashboard.header.searchPlaceholder")}
            className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
        </Button>

        {/* Theme & Language */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:block text-right">
            <p className="text-xs sm:text-sm font-medium text-foreground">{t("dashboard.header.adminUser")}</p>
            <p className="text-xs text-muted-foreground">{t("dashboard.header.administrator")}</p>
          </div>
          <Avatar className="h-9 sm:h-10 w-9 sm:w-10 border-2 border-primary/20">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">AU</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
