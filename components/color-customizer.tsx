"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Palette, Moon, Sun, X, Sparkles } from "lucide-react"

const themes = [
  {
    name: "Default",
    value: "",
    description: "Clean and professional",
    colors: {
      light: { primary: "#3b82f6", secondary: "#f1f5f9", accent: "#e2e8f0" },
      dark: { primary: "#60a5fa", secondary: "#1e293b", accent: "#334155" },
    },
  },
  {
    name: "Midnight Ocean",
    value: "theme-midnight",
    description: "Deep blues with sophisticated gradients",
    colors: {
      light: { primary: "#4285f4", secondary: "#f0f4ff", accent: "#e1ecff" },
      dark: { primary: "#5b9eff", secondary: "#0a1628", accent: "#1a2332" },
    },
  },
  {
    name: "Sunset Coral",
    value: "theme-coral",
    description: "Warm coral and orange energy",
    colors: {
      light: { primary: "#ff6b35", secondary: "#fff5f0", accent: "#ffe8e1" },
      dark: { primary: "#ff8c5a", secondary: "#2d1b13", accent: "#3d2318" },
    },
  },
  {
    name: "Forest Sage",
    value: "theme-sage",
    description: "Natural greens for calm calculations",
    colors: {
      light: { primary: "#059669", secondary: "#f0fdf4", accent: "#dcfce7" },
      dark: { primary: "#10b981", secondary: "#0f2419", accent: "#1a2e23" },
    },
  },
  {
    name: "Royal Amethyst",
    value: "theme-amethyst",
    description: "Rich purples for creative exploration",
    colors: {
      light: { primary: "#8b5cf6", secondary: "#faf5ff", accent: "#f3e8ff" },
      dark: { primary: "#a78bfa", secondary: "#1e1b3a", accent: "#2d2a4a" },
    },
  },
  {
    name: "Golden Honey",
    value: "theme-honey",
    description: "Warm golds bringing brightness to equations",
    colors: {
      light: { primary: "#f59e0b", secondary: "#fffbeb", accent: "#fef3c7" },
      dark: { primary: "#fbbf24", secondary: "#1f1611", accent: "#2d1f17" },
    },
  },
  {
    name: "Strawberry Milk",
    value: "theme-pink",
    description: "Soft pink tones adding a calm, cozy vibe to equations",
    colors: {
      light: { primary: "#f9a8d4", secondary: "#fdf2f8", accent: "#fce7f3" },
      dark: { primary: "#f472b6", secondary: "#2b1c23", accent: "#3b2a35" },
    },
  },
{
  name: "Cotton Candy Sky",
  value: "theme-cyan",
  description: "Gentle cyan hues bringing a fresh, breezy feeling to equations",
  colors: {
    light: { primary: "#7dd3fc", secondary: "#ecfeff", accent: "#cffafe" },
    dark: { primary: "#38bdf8", secondary: "#16303a", accent: "#1e3a47" },
  },
},
{
  name: "Cherry Blossom",
  value: "theme-cherry",
  description: "Gentle cherry red tones with a soft, romantic pastel feel",
  colors: {
    light: { primary: "#f28b82", secondary: "#fdecea", accent: "#fad2d0" },
    dark: { primary: "#e57373", secondary: "#2c1a1a", accent: "#3b2222" }
  },
},

{
  name: "Mint Mojito",
  value: "theme-green",
  description: "Light green shades adding a natural and soothing vibe",
  colors: {
    light: { primary: "#86efac", secondary: "#f0fdf4", accent: "#dcfce7" },
    dark: { primary: "#4ade80", secondary: "#1b2e1f", accent: "#233727" },
  },
},
{
  name: "Sunflower Fields",
  value: "theme-yellow",
  description: "Cheerful pastel yellows bringing brightness and positivity",
  colors: {
    light: { primary: "#fde68a", secondary: "#fffbeb", accent: "#fef9c3" },
    dark: { primary: "#facc15", secondary: "#332f1a", accent: "#423b21" },
  },
},
{
  name: "Lavender Dreams",
  value: "theme-purple",
  description: "Dreamy lavender tones adding a calm, magical touch",
  colors: {
    light: { primary: "#d8b4fe", secondary: "#faf5ff", accent: "#f3e8ff" },
    dark: { primary: "#a855f7", secondary: "#2b1f38", accent: "#3a2947" },
  },
},

  
]

interface ColorCustomizerProps {
  onClose: () => void
}

export function ColorCustomizer({ onClose }: ColorCustomizerProps) {
  const [currentTheme, setCurrentTheme] = useState("")
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check current theme on mount
    if (typeof window !== "undefined") {
      const html = document.documentElement
      const isDarkMode = html.classList.contains("dark")
      setIsDark(isDarkMode)

      // Find current theme
      const currentThemeClass = themes.find((theme) => theme.value && html.classList.contains(theme.value))
      setCurrentTheme(currentThemeClass?.value || "")
    }
  }, [])

  const applyTheme = (themeValue: string) => {
    if (typeof window === "undefined") return

    try {
      const html = document.documentElement

      // Remove all existing theme classes
      themes.forEach((theme) => {
        if (theme.value) {
          html.classList.remove(theme.value)
        }
      })

      // Apply new theme
      if (themeValue) {
        html.classList.add(themeValue)
      }

      setCurrentTheme(themeValue)

      // Save to localStorage
      localStorage.setItem("math-calculator-theme", themeValue)
    } catch (error) {
      console.error("Error applying theme:", error)
    }
  }

  const toggleDarkMode = () => {
    if (typeof window === "undefined") return

    try {
      const html = document.documentElement
      const newIsDark = !isDark

      if (newIsDark) {
        html.classList.add("dark")
      } else {
        html.classList.remove("dark")
      }

      setIsDark(newIsDark)

      // Save to localStorage
      localStorage.setItem("math-calculator-dark-mode", newIsDark.toString())
    } catch (error) {
      console.error("Error toggling dark mode:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[85vh] overflow-hidden glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 pulse-glow">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-headline flex items-center gap-2">
                Theme Gallery
                <Sparkles className="h-5 w-5 text-primary" />
              </CardTitle>
              <p className="text-caption mt-1">Choose your perfect mathematical workspace</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-xl">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-8 max-h-[calc(85vh-120px)] overflow-y-auto elegant-scrollbar">
          <div className="space-y-8">
            {/* Dark Mode Toggle */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="section-title flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Appearance Mode
                </CardTitle>
                <CardDescription>Switch between light and dark modes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant={!isDark ? "default" : "outline"}
                    onClick={() => !isDark || toggleDarkMode()}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={isDark ? "default" : "outline"}
                    onClick={() => isDark || toggleDarkMode()}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Theme Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="section-title mb-2">Color Themes</h3>
                <p className="text-caption">Choose from our carefully crafted color palettes</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {themes.map((theme) => {
                  const isSelected = currentTheme === theme.value
                  const colors = isDark ? theme.colors.dark : theme.colors.light

                  return (
                    <div
                      key={theme.name}
                      className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xl shadow-primary/20"
                          : "border-border/50 hover:border-primary/30 hover:shadow-lg"
                      }`}
                      onClick={() => applyTheme(theme.value)}
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.accent}20 100%)`
                          : undefined,
                      }}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-4 right-4 p-2 bg-primary rounded-full shadow-lg">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}

                      {/* Theme Header */}
                      <div className="mb-4">
                        <h3 className="text-title font-bold mb-2">{theme.name}</h3>
                        <p className="text-caption">{theme.description}</p>
                      </div>

                      {/* Color Palette Display */}
                      <div className="space-y-4 mb-6">
                        <div className="flex gap-3">
                          <div
                            className="w-12 h-12 rounded-xl border-2 border-white/20 shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}80 100%)`,
                            }}
                            title="Primary Gradient"
                          />
                          <div className="flex flex-col gap-2">
                            <div
                              className="w-16 h-5 rounded-lg border border-white/20"
                              style={{ backgroundColor: colors.secondary }}
                              title="Secondary"
                            />
                            <div
                              className="w-16 h-5 rounded-lg border border-white/20"
                              style={{ backgroundColor: colors.accent }}
                              title="Accent"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mini Calculator Preview */}
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Preview
                        </div>

                        {/* Mock Calculator Interface */}
                        <div
                          className="p-4 rounded-xl border"
                          style={{
                            backgroundColor: isDark ? colors.secondary : "#ffffff",
                            borderColor: colors.primary + "30",
                          }}
                        >
                          <div className="space-y-3">
                            {/* Mock Input */}
                            <div
                              className="px-3 py-2 rounded-lg text-xs border"
                              style={{
                                backgroundColor: colors.accent,
                                borderColor: colors.primary + "40",
                                color: colors.primary,
                              }}
                            >
                              2x + 5 = 11
                            </div>

                            {/* Mock Button */}
                            <div
                              className="px-4 py-2 rounded-lg text-xs font-semibold text-center text-white shadow-sm"
                              style={{
                                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}80 100%)`,
                              }}
                            >
                              Solve Problem
                            </div>

                            {/* Mock Result */}
                            <div
                              className="px-3 py-2 rounded-lg text-xs font-mono"
                              style={{
                                backgroundColor: colors.secondary,
                                color: colors.primary,
                              }}
                            >
                              x = 3
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Preview Section */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="section-title">Live Preview</CardTitle>
                <CardDescription>See how your selected theme looks with calculator elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="result-showcase">
                  <div className="math-display text-lg">x² + 5x + 6 = 0</div>
                  <p className="text-sm text-muted-foreground mt-2">Solution: x = -2, x = -3</p>
                </div>

                <div className="flex gap-2">
                  <Button className="gradient-button">Solve Problem</Button>
                  <Button variant="outline">Clear</Button>
                </div>

                <div className="step-card">
                  <p className="text-sm">Step 1: Factor the quadratic equation</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 text-caption">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Theme will be saved automatically</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="px-6 bg-transparent">
                Cancel
              </Button>
              <Button onClick={onClose} className="gradient-button px-6">
                Apply Theme
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
