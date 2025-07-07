"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Palette, Check } from "lucide-react"

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

export function ColorCustomizer({ themes, currentTheme, onThemeChange, onClose }: ColorCustomizerProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)

  const handleThemeSelect = (theme: ColorTheme) => {
    setSelectedTheme(theme)
    onThemeChange(theme)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] glass-morphism border-0 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
              <Palette className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">Theme Customizer</CardTitle>
              <CardDescription className="text-gray-300">
                Choose your perfect color scheme for the calculator
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 text-white h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {themes.map((theme, index) => (
                <div
                  key={theme.name}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedTheme.name === theme.name
                      ? "border-white/40 bg-white/10"
                      : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/8"
                  }`}
                  onClick={() => handleThemeSelect(theme)}
                >
                  {selectedTheme.name === theme.name && (
                    <div className="absolute top-3 right-3 p-1 bg-green-500 rounded-full">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">{theme.name}</h3>
                      <Badge variant="outline" className="border-white/30 text-white/80">
                        Theme {index + 1}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-300">{theme.description}</p>

                    {/* Theme Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-16">Primary:</span>
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: `rgb(${theme.primary})` }}
                        />
                        <div className="flex-1 h-3 rounded-full" style={{ background: theme.gradient }} />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-16">Secondary:</span>
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: `rgb(${theme.secondary})` }}
                        />
                        <div
                          className="flex-1 h-3 rounded-full"
                          style={{ backgroundColor: `rgb(${theme.secondary})` }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-16">Accent:</span>
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: `rgb(${theme.accent})` }}
                        />
                        <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: `rgb(${theme.accent})` }} />
                      </div>
                    </div>

                    {/* Mini Calculator Preview */}
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                      <div className="text-xs text-gray-400 mb-2">Preview:</div>
                      <div className="space-y-2">
                        <div
                          className="p-2 rounded text-xs text-white"
                          style={{ backgroundColor: `rgb(${theme.primary})` }}
                        >
                          Calculate Button
                        </div>
                        <div
                          className="p-2 rounded text-xs"
                          style={{
                            backgroundColor: `rgb(${theme.secondary})`,
                            color: `rgb(${theme.foreground})`,
                          }}
                        >
                          Input Field
                        </div>
                        <div
                          className="p-2 rounded text-xs"
                          style={{
                            backgroundColor: `rgb(${theme.accent})`,
                            color: `rgb(${theme.foreground})`,
                          }}
                        >
                          Result Display
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              Selected: <span className="text-white font-medium">{selectedTheme.name}</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              >
                Apply Theme
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
