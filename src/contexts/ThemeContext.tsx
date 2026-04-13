import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Convert hex to HSL
const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [primaryColor, setPrimaryColorState] = useState(() => {
    return localStorage.getItem("primaryColor") || "#14a085";
  });
  
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem("primaryColor", color);
  };

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      localStorage.setItem("darkMode", String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    const { h, s, l } = hexToHSL(primaryColor);
    
    // Set primary color and related properties
    root.style.setProperty("--primary", `${h} ${s}% ${l}%`);
    root.style.setProperty("--ring", `${h} ${s}% ${l}%`);
    root.style.setProperty("--sidebar-primary", `${h} ${s}% ${l}%`);
    root.style.setProperty("--sidebar-ring", `${h} ${s}% ${l}%`);
    
    // Update gradient-hero
    const lightL = Math.min(l + 8, 100);
    root.style.setProperty(
      "--gradient-hero",
      `linear-gradient(135deg, hsl(${h} ${s}% ${l}%) 0%, hsl(${h + 12} ${Math.max(s - 10, 0)}% ${l - 6}%) 100%)`
    );
    
    // Update glow shadow
    root.style.setProperty(
      "--shadow-glow",
      `0 0 40px hsl(${h} ${s}% ${l}% / 0.2)`
    );
  }, [primaryColor]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor, isDark, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
