import { Button } from "@/components/ui/button";
import { themes, useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ChevronDown, Palette } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function ThemeSwitcher() {
  const { currentTheme, setTheme, getTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentThemeData = getTheme(currentTheme);

  return (
    <div className='relative' ref={dropdownRef}>
      <Button
        variant='outline'
        size='sm'
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2'
      >
        <Palette className='h-4 w-4' />
        <span className='hidden sm:inline'>{currentThemeData.displayName}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 w-64 border rounded-lg shadow-lg z-50 overflow-hidden",
            // Glassmorphism theme - glass effect with blur
            currentTheme === "glassmorphism" &&
              "bg-white/10 backdrop-blur-xl backdrop-saturate-150 border-white/20",
            // Default theme - solid white/dark
            currentTheme === "default" &&
              "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700",
            // Paper theme - clean notebook background
            currentTheme === "paper" && "bg-white border-blue-200",
            // Cyberpunk theme - dark solid background
            currentTheme === "cyberpunk" && "bg-slate-900 border-purple-500/50",
            // Terminal theme - dark solid background
            currentTheme === "terminal" && "bg-black border-green-600",
            // Discord theme - solid discord background
            currentTheme === "discord" && "bg-gray-800 border-gray-600"
          )}
          style={
            currentTheme === "glassmorphism"
              ? {
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                }
              : undefined
          }
        >
          <div className='p-2'>
            <div className='text-sm font-medium text-foreground mb-2 px-2'>
              Choose Theme
            </div>
            <div className='space-y-1'>
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => {
                    setTheme(theme.name);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors
                    hover:bg-muted/50
                    ${currentTheme === theme.name ? "bg-muted" : ""}
                  `}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${theme.previewColor}`}
                    style={{
                      background:
                        theme.name === "glassmorphism"
                          ? "linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))"
                          : theme.name === "paper"
                            ? "#ffffff"
                            : theme.name === "cyberpunk"
                              ? "linear-gradient(45deg, #22d3ee, #ec4899)"
                              : theme.name === "terminal"
                                ? "#000000"
                                : theme.name === "discord"
                                  ? "#2f3349"
                                  : "#f3f4f6",
                      border:
                        theme.name === "paper"
                          ? "2px solid #1e40af"
                          : undefined,
                    }}
                  />
                  <div className='flex-1'>
                    <div className='text-sm font-medium text-foreground'>
                      {theme.displayName}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {theme.description}
                    </div>
                  </div>
                  {currentTheme === theme.name && (
                    <div className='w-2 h-2 bg-primary rounded-full' />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
