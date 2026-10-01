"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTenantPrimaryColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This code will only run on the client side
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "light"; // Default to light theme

    setTheme(initialTheme);
    setIsInitialized(true);
    
    // Also load any saved tenant color
    const savedColor = localStorage.getItem("tenantColor");
    if (savedColor) {
      applyTenantColor(savedColor);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const applyTenantColor = (color: string) => {
    document.documentElement.style.setProperty("--color-brand-500", color);
    // Simple dark shade for hover
    document.documentElement.style.setProperty("--color-brand-600", color);
    // Hex to RGB for rgba usage if needed, or simple opacity logic
    localStorage.setItem("tenantColor", color);
  };

  const setTenantPrimaryColor = (color: string) => {
    if (color) {
      applyTenantColor(color);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTenantPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

