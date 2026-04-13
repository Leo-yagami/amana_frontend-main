import { useState } from "react";
import { Palette, Globe, Moon, Sun, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const presetColors = [
  { name: "Teal", value: "#14a085" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Orange", value: "#f97316" },
  { name: "Green", value: "#22c55e" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Amber", value: "#f59e0b" },
];

interface ThemeLanguageControlsProps {
  variant?: "navbar" | "settings";
}

const ThemeLanguageControls = ({ variant = "navbar" }: ThemeLanguageControlsProps) => {
  const { primaryColor, setPrimaryColor, isDark, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [customColor, setCustomColor] = useState(primaryColor);

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    setPrimaryColor(color);
  };

  if (variant === "settings") {
    return (
      <div className="space-y-6">
        {/* Theme Color */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("settings.themeColor")}</h3>
              <p className="text-sm text-muted-foreground">{t("settings.themeColorDesc")}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-4">
            {presetColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className={cn(
                  "w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center",
                  primaryColor === color.value && "ring-2 ring-offset-2 ring-foreground"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {primaryColor === color.value && <Check className="w-5 h-5 text-white" />}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Custom:</label>
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-12 h-10 rounded-lg cursor-pointer border border-border"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground w-28 uppercase"
            />
          </div>
        </div>

        {/* Language */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("settings.language")}</h3>
              <p className="text-sm text-muted-foreground">{t("settings.languageDesc")}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant={language === "en" ? "default" : "outline"}
              onClick={() => setLanguage("en")}
              className="flex-1"
            >
              🇺🇸 English
            </Button>
            <Button
              variant={language === "am" ? "default" : "outline"}
              onClick={() => setLanguage("am")}
              className="flex-1"
            >
              🇪🇹 አማርኛ
            </Button>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                {isDark ? <Moon className="w-6 h-6 text-primary" /> : <Sun className="w-6 h-6 text-primary" />}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("settings.darkMode")}</h3>
                <p className="text-sm text-muted-foreground">{t("settings.darkModeDesc")}</p>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={toggleDarkMode}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Navbar variant
  return (
    <div className="flex items-center gap-2">
      {/* Theme Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Palette className="w-5 h-5" />
            <span
              className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-card"
              style={{ backgroundColor: primaryColor }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="end">
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{t("settings.themeColor")}</p>
            <div className="grid grid-cols-4 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={cn(
                    "w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110",
                    primaryColor === color.value && "ring-2 ring-offset-2 ring-foreground"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {primaryColor === color.value && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-border"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground uppercase"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Language Switcher */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <Globe className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="end">
          <div className="space-y-1">
            <button
              onClick={() => setLanguage("en")}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                language === "en"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              )}
            >
              🇺🇸 English
            </button>
            <button
              onClick={() => setLanguage("am")}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                language === "am"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              )}
            >
              🇪🇹 አማርኛ
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Dark Mode Toggle */}
      <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
    </div>
  );
};

export default ThemeLanguageControls;
