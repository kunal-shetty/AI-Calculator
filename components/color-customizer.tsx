"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Palette, Check, Type, Eye } from "lucide-react"

interface ColorTheme {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  mutedForeground: string
  cardForeground: string
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
    foreground: "0 0% 0%",
    mutedForeground: "0 0% 45%",
    cardForeground: "0 0% 0%",
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

  const textColorPresets = [
    { name: "Black", value: "0 0% 0%" },
    { name: "Dark Gray", value: "0 0% 20%" },
    { name: "Medium Gray", value: "0 0% 45%" },
    { name: "Light Gray", value: "0 0% 70%" },
    { name: "White", value: "0 0% 100%" },
    { name: "Navy", value: "222.2 84% 4.9%" },
  ]

  const backgroundPresets = [
    { name: "White", value: "0 0% 100%" },
    { name: "Light Gray", value: "0 0% 98%" },
    { name: "Off White", value: "60 9% 98%" },
    { name: "Dark", value: "222.2 84% 4.9%" },
    { name: "Dark Gray", value: "240 10% 3.9%" },
    { name: "Black", value: "0 0% 0%" },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color & Font Customization
          </DialogTitle>
          <DialogDescription>
            Choose from preset themes or create your own custom color and font scheme
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preset Themes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Preset Themes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <h4 className="font-medium text-sm">{theme.name}</h4>
                      {currentTheme.name === theme.name && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex gap-1 mb-3">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.primary})` }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.secondary})` }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.background})` }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.foreground})` }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Primary: {theme.primary}</div>
                      <div className="text-xs text-muted-foreground">Text: {theme.foreground}</div>
                    </div>
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
                <CardTitle className="text-base flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Create Your Own Theme
                </CardTitle>
                <CardDescription>
                  Customize colors and text colors using HSL values (Hue Saturation Lightness)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                </div>

                {/* Background Settings */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Background Colors
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="background-color">Background Color (HSL)</Label>
                      <Input
                        id="background-color"
                        value={customTheme.background}
                        onChange={(e) => handleCustomThemeChange("background", e.target.value)}
                        placeholder="0 0% 100%"
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
                </div>

                {/* Text Color Settings */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Text Colors
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="foreground-color">Main Text Color (HSL)</Label>
                      <Input
                        id="foreground-color"
                        value={customTheme.foreground}
                        onChange={(e) => handleCustomThemeChange("foreground", e.target.value)}
                        placeholder="0 0% 0%"
                      />
                    </div>
                    <div>
                      <Label htmlFor="muted-foreground-color">Muted Text Color (HSL)</Label>
                      <Input
                        id="muted-foreground-color"
                        value={customTheme.mutedForeground}
                        onChange={(e) => handleCustomThemeChange("mutedForeground", e.target.value)}
                        placeholder="0 0% 45%"
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-foreground-color">Card Text Color (HSL)</Label>
                      <Input
                        id="card-foreground-color"
                        value={customTheme.cardForeground}
                        onChange={(e) => handleCustomThemeChange("cardForeground", e.target.value)}
                        placeholder="0 0% 0%"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Quick Text Colors</Label>
                    <div className="flex flex-wrap gap-2">
                      {textColorPresets.map((color, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleCustomThemeChange("foreground", color.value)}
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

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Quick Backgrounds</Label>
                    <div className="flex flex-wrap gap-2">
                      {backgroundPresets.map((color, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleCustomThemeChange("background", color.value)}
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
                </div>

                {/* Preview */}
                <div>
                  <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </Label>
                  <div
                    className="p-6 border rounded-lg"
                    style={{
                      backgroundColor: `hsl(${customTheme.background})`,
                      color: `hsl(${customTheme.foreground})`,
                    }}
                  >
                    <div className="space-y-4">
                      <div className="flex gap-3 mb-4">
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

                      <h3 className="text-lg font-semibold" style={{ color: `hsl(${customTheme.foreground})` }}>
                        Sample Heading Text
                      </h3>

                      <p className="text-sm" style={{ color: `hsl(${customTheme.mutedForeground})` }}>
                        This is how your muted text will look in the interface
                      </p>

                      <div
                        className="inline-block px-3 py-1 rounded text-white text-sm font-medium"
                        style={{
                          backgroundColor: `hsl(${customTheme.primary})`,
                        }}
                      >
                        Sample Badge
                      </div>

                      <div
                        className="p-3 rounded border mt-3"
                        style={{
                          backgroundColor: `hsl(${customTheme.secondary})`,
                          color: `hsl(${customTheme.cardForeground})`,
                        }}
                      >
                        Card content with custom text color
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={applyCustomTheme} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
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
                        foreground: "0 0% 0%",
                        mutedForeground: "0 0% 45%",
                        cardForeground: "0 0% 0%",
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
