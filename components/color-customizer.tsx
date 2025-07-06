"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Palette, Check } from "lucide-react"

interface ColorTheme {
  primary: string
  secondary: string
  accent: string
  background: string
  name: string
}

interface ColorCustomizerProps {
  themes: ColorTheme[]
  currentTheme: ColorTheme
  onThemeChange: (theme: ColorTheme) => void
  onClose: () => void
}

export function ColorCustomizer({ themes, currentTheme, onThemeChange, onClose }: ColorCustomizerProps) {
  const [customTheme, setCustomTheme] = useState<ColorTheme>({
    name: "Custom Theme",
    primary: "221.2 83.2% 53.3%",
    secondary: "210 40% 96%",
    accent: "210 40% 96%",
    background: "0 0% 100%",
  })

  const handleCustomThemeChange = (field: keyof ColorTheme, value: string) => {
    setCustomTheme((prev) => ({ ...prev, [field]: value }))
  }

  const applyCustomTheme = () => {
    onThemeChange(customTheme)
  }

  const presetColors = [
    { name: "Blue", value: "221.2 83.2% 53.3%" },
    { name: "Green", value: "142.1 76.2% 36.3%" },
    { name: "Orange", value: "24.6 95% 53.1%" },
    { name: "Purple", value: "262.1 83.3% 57.8%" },
    { name: "Pink", value: "346.8 77.2% 49.8%" },
    { name: "Teal", value: "173.4 80.4% 40%" },
    { name: "Red", value: "0 84.2% 60.2%" },
    { name: "Indigo", value: "239.4 84.2% 67.1%" },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Customization
          </DialogTitle>
          <DialogDescription>Choose from preset themes or create your own custom color scheme</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preset Themes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Preset Themes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    currentTheme.name === theme.name ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => onThemeChange(theme)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{theme.name}</h4>
                      {currentTheme.name === theme.name && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.primary})` }}
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.secondary})` }}
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.accent})` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">Primary: {theme.primary}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Theme Builder */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Custom Theme Builder</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Create Your Own Theme</CardTitle>
                <CardDescription>Customize colors using HSL values (Hue Saturation Lightness)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme-name">Theme Name</Label>
                    <Input
                      id="theme-name"
                      value={customTheme.name}
                      onChange={(e) => handleCustomThemeChange("name", e.target.value)}
                      placeholder="My Custom Theme"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary-color">Primary Color (HSL)</Label>
                    <Input
                      id="primary-color"
                      value={customTheme.primary}
                      onChange={(e) => handleCustomThemeChange("primary", e.target.value)}
                      placeholder="221.2 83.2% 53.3%"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary-color">Secondary Color (HSL)</Label>
                    <Input
                      id="secondary-color"
                      value={customTheme.secondary}
                      onChange={(e) => handleCustomThemeChange("secondary", e.target.value)}
                      placeholder="210 40% 96%"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accent-color">Accent Color (HSL)</Label>
                    <Input
                      id="accent-color"
                      value={customTheme.accent}
                      onChange={(e) => handleCustomThemeChange("accent", e.target.value)}
                      placeholder="210 40% 96%"
                    />
                  </div>
                </div>

                {/* Quick Color Presets */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Quick Primary Colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map((color, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCustomThemeChange("primary", color.value)}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: `hsl(${color.value})` }}
                        />
                        {color.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Preview</Label>
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-muted/50 to-muted/30">
                    <div className="flex gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-lg shadow-sm border-2 border-white"
                        style={{ backgroundColor: `hsl(${customTheme.primary})` }}
                      />
                      <div
                        className="w-12 h-12 rounded-lg shadow-sm border-2 border-white"
                        style={{ backgroundColor: `hsl(${customTheme.secondary})` }}
                      />
                      <div
                        className="w-12 h-12 rounded-lg shadow-sm border-2 border-white"
                        style={{ backgroundColor: `hsl(${customTheme.accent})` }}
                      />
                    </div>
                    <Badge
                      className="mb-2"
                      style={{
                        backgroundColor: `hsl(${customTheme.primary})`,
                        color: "white",
                      }}
                    >
                      Sample Badge
                    </Badge>
                    <p className="text-sm text-muted-foreground">This is how your custom theme will look</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={applyCustomTheme} className="flex-1">
                    Apply Custom Theme
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCustomTheme({
                        name: "Custom Theme",
                        primary: "221.2 83.2% 53.3%",
                        secondary: "210 40% 96%",
                        accent: "210 40% 96%",
                        background: "0 0% 100%",
                      })
                    }
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
