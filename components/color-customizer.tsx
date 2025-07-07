"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Check, Palette, Sparkles, Zap, Heart, Star } from "lucide-react"

interface ColorTheme {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  mutedForeground: string
  cardForeground: string
  name: string
  description: string
  gradient: string
  shadow: string
}

interface ColorCustomizerProps {
  themes: ColorTheme[]
  currentTheme: ColorTheme
  onThemeChange: (theme: ColorTheme) => void
  onClose: () => void
}

const themeIcons = {
  "Ocean Breeze": "🌊",
  "Sunset Fire": "🔥",
  "Purple Galaxy": "🌌",
  "Forest Mint": "🌿",
}

export function ColorCustomizer({ themes, currentTheme, onThemeChange, onClose }: ColorCustomizerProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto glass-morphism animate-zoom-in">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-2xl">
            <span className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg animate-pulse-glow">
                <Palette className="h-6 w-6 text-white animate-spin-slow" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                Choose Your Perfect Theme
              </span>
              <Sparkles className="h-5 w-5 text-purple-500 animate-twinkle" />
            </span>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover-lift glow-on-hover">
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          <div className="text-center animate-fade-in-up">
            <p className="text-lg text-muted-foreground mb-2">
              Transform your mathematical experience with stunning visual themes
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              <span>Designed for focus, creativity, and mathematical inspiration</span>
              <Star className="h-4 w-4 text-yellow-500 animate-twinkle" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {themes.map((theme, index) => (
              <Card
                key={theme.name}
                className={`cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl group relative overflow-hidden animate-fade-in-up ${
                  currentTheme.name === theme.name ? "ring-4 ring-offset-4 shadow-2xl scale-105" : "hover:shadow-xl"
                }`}
                style={{
                  ringColor: currentTheme.name === theme.name ? `rgb(${theme.primary})` : undefined,
                  animationDelay: `${index * 150}ms`,
                }}
                onClick={() => onThemeChange(theme)}
              >
                {/* Animated Background */}
                <div
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ background: theme.gradient }}
                />

                {/* Floating Elements */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {currentTheme.name === theme.name ? (
                    <div className="p-2 bg-green-100 rounded-full animate-bounce-in">
                      <Check className="h-4 w-4 text-green-600 animate-check" />
                    </div>
                  ) : (
                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                      <Zap className="h-4 w-4 text-white animate-flash" />
                    </div>
                  )}
                </div>

                <CardHeader className="pb-4 relative z-10">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold">
                      <span className="text-2xl animate-bounce-subtle">
                        {themeIcons[theme.name as keyof typeof themeIcons]}
                      </span>
                      {theme.name}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">{theme.description}</p>
                </CardHeader>

                <CardContent className="pt-0 relative z-10">
                  <div className="space-y-4">
                    {/* Primary Color Showcase */}
                    <div
                      className="h-16 rounded-xl flex items-center justify-center text-white font-bold shadow-lg relative overflow-hidden group-hover:shadow-xl transition-shadow duration-300"
                      style={{ background: theme.gradient }}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 text-lg animate-pulse-glow">Primary</span>
                      <Sparkles className="ml-2 h-4 w-4 animate-twinkle" />
                    </div>

                    {/* Color Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className="h-10 rounded-lg flex items-center justify-center text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                        style={{
                          backgroundColor: `rgb(${theme.secondary})`,
                          color: `rgb(${theme.foreground})`,
                        }}
                      >
                        Secondary
                      </div>
                      <div
                        className="h-10 rounded-lg flex items-center justify-center text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                        style={{
                          backgroundColor: `rgb(${theme.accent})`,
                          color: `rgb(${theme.foreground})`,
                        }}
                      >
                        Accent
                      </div>
                    </div>

                    {/* Sample Card Preview */}
                    <div
                      className="p-4 rounded-xl border-2 shadow-lg relative overflow-hidden group-hover:shadow-xl transition-shadow duration-300"
                      style={{
                        backgroundColor: `rgb(${theme.background})`,
                        borderColor: `rgb(${theme.primary})`,
                        color: `rgb(${theme.foreground})`,
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 w-full h-1 opacity-50"
                        style={{ background: theme.gradient }}
                      />
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        Sample Card
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: `rgb(${theme.primary})` }}
                        />
                      </h4>
                      <p className="text-sm mb-3 leading-relaxed" style={{ color: `rgb(${theme.mutedForeground})` }}>
                        Experience mathematical beauty with this stunning theme design.
                      </p>
                      <div className="flex gap-2">
                        <div
                          className="px-3 py-1 rounded-full text-white text-xs font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                          style={{ background: theme.gradient }}
                        >
                          Button
                        </div>
                        <div
                          className="px-3 py-1 rounded-full border text-xs font-medium hover:shadow-md transition-shadow duration-200"
                          style={{
                            borderColor: `rgb(${theme.primary})`,
                            color: `rgb(${theme.primary})`,
                          }}
                        >
                          Outline
                        </div>
                      </div>
                    </div>

                    {/* Color Palette Dots */}
                    <div className="flex justify-center gap-2 pt-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: `rgb(${theme.primary})` }}
                        title="Primary"
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: `rgb(${theme.secondary})` }}
                        title="Secondary"
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: `rgb(${theme.accent})` }}
                        title="Accent"
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: `rgb(${theme.foreground})` }}
                        title="Text"
                      />
                    </div>
                  </div>
                </CardContent>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            ))}
          </div>

          {/* Theme Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl animate-fade-in-up">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 animate-count-up">4</div>
              <div className="text-sm text-muted-foreground">Beautiful Themes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 animate-count-up">∞</div>
              <div className="text-sm text-muted-foreground">Possibilities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 animate-count-up">100%</div>
              <div className="text-sm text-muted-foreground">Customizable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 animate-count-up">✨</div>
              <div className="text-sm text-muted-foreground">Pure Magic</div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Theme automatically saved</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="hover-lift bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover-lift glow-on-hover"
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Theme
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
