import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeName =
  | "default"
  | "paper"
  | "cyberpunk"
  | "glassmorphism"
  | "terminal"
  | "discord";

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  previewColor: string;
}

export const themes: Theme[] = [
  {
    name: "default",
    displayName: "Default",
    description: "Clean and minimal",
    previewColor: "bg-gray-100 border-gray-300",
  },
  {
    name: "paper",
    displayName: "Paper",
    description: "Notebook and ink",
    previewColor: "bg-gray-50 border-blue-500",
  },
  {
    name: "cyberpunk",
    displayName: "Cyberpunk",
    description: "Neon and electric",
    previewColor: "bg-gradient-to-r from-cyan-400 to-pink-500",
  },
  {
    name: "glassmorphism",
    displayName: "Glass",
    description: "Frosted glass effects",
    previewColor:
      "bg-gradient-to-r from-blue-200/30 to-purple-200/30 backdrop-blur",
  },
  {
    name: "terminal",
    displayName: "Terminal",
    description: "Retro computing",
    previewColor: "bg-black border-green-400",
  },
  {
    name: "discord",
    displayName: "Discord",
    description: "Familiar chat style",
    previewColor: "bg-slate-800 border-purple-500",
  },
];

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  getTheme: (name: ThemeName) => Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("default");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("chat-theme") as ThemeName;
    if (savedTheme && themes.find((t) => t.name === savedTheme)) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    themes.forEach((theme) => {
      root.classList.remove(`theme-${theme.name}`);
    });

    // Add current theme class
    root.classList.add(`theme-${currentTheme}`);
  }, [currentTheme]);

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
    localStorage.setItem("chat-theme", theme);
  };

  const getTheme = (name: ThemeName) => {
    return themes.find((t) => t.name === name) || themes[0];
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, getTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
