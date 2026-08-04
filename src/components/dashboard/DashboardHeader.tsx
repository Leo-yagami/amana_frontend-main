import { Bell, Search, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "../ui/NotificationBell";
import GlobalSearchBar from "@/components/dashboard/GlobalSearchBar";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAvatarClick = () => {
    navigate("/dashboard/settings");
  };

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
        {false && (<div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder={t("dashboard.header.searchPlaceholder")}
            className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>)}
        <GlobalSearchBar />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
        {/* Notifications */}
        {false && (<Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
        </Button>)}
        <NotificationBell  />

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
            <p className="text-xs sm:text-sm font-medium text-foreground">{user?.fullName || ""}</p>
            <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
          </div>
          <div
            className="cursor-pointer rounded-full hover:shadow-glow transition-shadow"
            onClick={handleAvatarClick}
          >
            <Avatar className="h-9 sm:h-10 w-9 sm:w-10 border-2 border-primary/20">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user?.fullName ? initials(user.fullName) : ""}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
