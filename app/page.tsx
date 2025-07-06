"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Calculator,
  Lightbulb,
  AlertCircle,
  Upload,
  History,
  Star,
  Download,
  Copy,
  Share2,
  Trash2,
  X,
  Palette,
  Settings,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { EquationBuilder } from "@/components/equation-builder"
import { HistoryPanel } from "@/components/history-panel"
import { ColorCustomizer } from "@/components/color-customizer"

interface MathResult {
  input: string
  solution: string
  steps?: string[]
  type: string
  images?: string[]
  plots?: string[]
  assumptions?: string[]
  warnings?: string[]
  success: boolean
  queryresult?: any
}

interface HistoryItem {
  id: string
  input: string
  result: MathResult
  timestamp: Date
  favorite: boolean
}

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

const defaultThemes: ColorTheme[] = [
  {
    name: "Ocean Blue",
    primary: "221.2 83.2% 53.3%",
    secondary: "210 40% 96%",
    accent: "210 40% 96%",
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    mutedForeground: "215.4 16.3% 46.9%",
    cardForeground: "222.2 84% 4.9%",
  },
  {
    name: "Forest Green",
    primary: "142.1 76.2% 36.3%",
    secondary: "138 76% 97%",
    accent: "138 76% 97%",
    background: "0 0% 100%",
    foreground: "240 10% 3.9%",
    mutedForeground: "240 3.8% 46.1%",
    cardForeground: "240 10% 3.9%",
  },
  {
    name: "Sunset Orange",
    primary: "24.6 95% 53.1%",
    secondary: "24 100% 97%",
    accent: "24 100% 97%",
    background: "0 0% 100%",
    foreground: "20 14.3% 4.1%",
    mutedForeground: "25 5.3% 44.7%",
    cardForeground: "20 14.3% 4.1%",
  },
  {
    name: "Royal Purple",
    primary: "262.1 83.3% 57.8%",
    secondary: "270 100% 98%",
    accent: "270 100% 98%",
    background: "0 0% 100%",
    foreground: "224 71.4% 4.1%",
    mutedForeground: "215.3 19.3% 34.5%",
    cardForeground: "224 71.4% 4.1%",
  },
  {
    name: "Rose Pink",
    primary: "346.8 77.2% 49.8%",
    secondary: "355 100% 97%",
    accent: "355 100% 97%",
    background: "0 0% 100%",
    foreground: "240 10% 3.9%",
    mutedForeground: "240 5% 64.9%",
    cardForeground: "240 10% 3.9%",
  },
  {
    name: "Cyber Teal",
    primary: "173.4 80.4% 40%",
    secondary: "180 100% 97%",
    accent: "180 100% 97%",
    background: "0 0% 100%",
    foreground: "185 6% 8%",
    mutedForeground: "184 5% 48%",
    cardForeground: "185 6% 8%",
  },
  {
    name: "Dark Ocean",
    primary: "221.2 83.2% 53.3%",
    secondary: "217.2 32.6% 17.5%",
    accent: "217.2 32.6% 17.5%",
    background: "222.2 84% 4.9%",
    foreground: "210 40% 98%",
    mutedForeground: "215 20.2% 65.1%",
    cardForeground: "210 40% 98%",
  },
  {
    name: "Dark Forest",
    primary: "142.1 76.2% 36.3%",
    secondary: "240 3.7% 15.9%",
    accent: "240 3.7% 15.9%",
    background: "240 10% 3.9%",
    foreground: "0 0% 98%",
    mutedForeground: "240 5% 64.9%",
    cardForeground: "0 0% 98%",
  },
]

export default function Home() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<MathResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [favorites, setFavorites] = useState<HistoryItem[]>([])
  const [inputMethod, setInputMethod] = useState<"text" | "builder" | "upload">("text")
  const [showHistory, setShowHistory] = useState(false)
  const [showColorCustomizer, setShowColorCustomizer] = useState(false)
  const [outputFormat, setOutputFormat] = useState<"simple" | "detailed" | "step-by-step">("detailed")
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(defaultThemes[0])

  // Load saved preferences
  useEffect(() => {
    const savedHistory = localStorage.getItem("math-calculator-history")
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      setHistory(
        parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })),
      )
    }

    const savedFavorites = localStorage.getItem("math-calculator-favorites")
    if (savedFavorites) {
      const parsed = JSON.parse(savedFavorites)
      setFavorites(
        parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })),
      )
    }

    const savedTheme = localStorage.getItem("math-calculator-theme")
    if (savedTheme) {
      const theme = JSON.parse(savedTheme)
      setCurrentTheme(theme)
      applyTheme(theme)
    }
  }, [])

  // Apply theme to CSS variables
  const applyTheme = (theme: ColorTheme) => {
    const root = document.documentElement
    root.style.setProperty("--primary", theme.primary)
    root.style.setProperty("--secondary", theme.secondary)
    root.style.setProperty("--accent", theme.accent)
    root.style.setProperty("--background", theme.background)
    root.style.setProperty("--foreground", theme.foreground)
    root.style.setProperty("--muted-foreground", theme.mutedForeground)
    root.style.setProperty("--card-foreground", theme.cardForeground)
  }

  const handleThemeChange = (theme: ColorTheme) => {
    setCurrentTheme(theme)
    applyTheme(theme)
    localStorage.setItem("math-calculator-theme", JSON.stringify(theme))
  }

  // Save history to localStorage
  const saveToHistory = (input: string, result: MathResult) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      input,
      result,
      timestamp: new Date(),
      favorite: false,
    }

    const updatedHistory = [newItem, ...history.slice(0, 49)] // Keep last 50 items
    setHistory(updatedHistory)
    localStorage.setItem("math-calculator-history", JSON.stringify(updatedHistory))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/wolfram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: input,
          format: outputFormat,
          includesteps: outputFormat === "step-by-step",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to solve the problem")
      }

      const data = await response.json()
      setResult(data)
      saveToHistory(input, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleEquationBuilt = (equation: string) => {
    setInput(equation)
  }

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setInput(data.equation)
      }
    } catch (err) {
      setError("Failed to process uploaded file")
    }
  }

  const toggleFavorite = (item: HistoryItem) => {
    const updatedItem = { ...item, favorite: !item.favorite }
    const updatedHistory = history.map((h) => (h.id === item.id ? updatedItem : h))
    setHistory(updatedHistory)
    localStorage.setItem("math-calculator-history", JSON.stringify(updatedHistory))

    if (updatedItem.favorite) {
      const updatedFavorites = [...favorites, updatedItem]
      setFavorites(updatedFavorites)
      localStorage.setItem("math-calculator-favorites", JSON.stringify(updatedFavorites))
    } else {
      const updatedFavorites = favorites.filter((f) => f.id !== item.id)
      setFavorites(updatedFavorites)
      localStorage.setItem("math-calculator-favorites", JSON.stringify(updatedFavorites))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportResult = (format: "txt" | "json") => {
    if (!result) return

    const data = {
      input: result.input,
      solution: result.solution,
      steps: result.steps,
      timestamp: new Date().toISOString(),
    }

    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "math-solution.json"
      a.click()
    } else if (format === "txt") {
      const text = `Problem: ${data.input}\n\nSolution: ${data.solution}\n\nSteps:\n${data.steps?.join("\n") || "N/A"}`
      const blob = new Blob([text], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "math-solution.txt"
      a.click()
    }
  }

  const mathCategories = [
    { name: "Algebra", examples: ["solve x^2 + 5x + 6 = 0", "factor x^2 - 9", "expand (x+2)^3"] },
    { name: "Calculus", examples: ["integrate sin(x) dx", "derivative of x^3", "limit x->0 sin(x)/x"] },
    { name: "Statistics", examples: ["mean of 1,2,3,4,5", "standard deviation", "normal distribution"] },
    { name: "Geometry", examples: ["area of circle radius 5", "volume of sphere", "pythagorean theorem"] },
    { name: "Number Theory", examples: ["prime factorization 100", "gcd(48, 18)", "fibonacci 10"] },
    { name: "Linear Algebra", examples: ["matrix inverse", "eigenvalues", "determinant"] },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-lg">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Advanced AI Math Calculator
              </h1>
              <p className="text-muted-foreground text-lg">
                Powered by Wolfram Alpha - Solve any math problem with step-by-step solutions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowColorCustomizer(true)}
              className="hover:bg-primary/10 transition-colors"
            >
              <Palette className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="hover:bg-primary/10 transition-colors"
            >
              <History className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Input Methods */}
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Enter Your Math Problem
                  </span>
                  <div className="flex items-center gap-2">
                    <Select value={outputFormat} onValueChange={(value: any) => setOutputFormat(value)}>
                      <SelectTrigger className="w-40 border-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="step-by-step">Step-by-step</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
                <CardDescription className="text-muted-foreground/80">
                  Choose your preferred input method and output format
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={inputMethod} onValueChange={(value: any) => setInputMethod(value)}>
                  <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                    <TabsTrigger
                      value="text"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Text
                    </TabsTrigger>
                    <TabsTrigger
                      value="builder"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Builder
                    </TabsTrigger>
                    <TabsTrigger
                      value="upload"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 mt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="e.g., solve x^2 + 5x + 6 = 0, integrate sin(x) dx, plot y = x^2"
                          className="min-h-[120px] border-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm resize-none"
                          disabled={loading}
                        />
                        {input && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setInput("")}
                            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Solving with Wolfram Alpha...
                          </>
                        ) : (
                          <>
                            <Calculator className="h-5 w-5 mr-2" />
                            Solve Problem
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="builder" className="mt-6">
                    <EquationBuilder onEquationBuilt={handleEquationBuilt} />
                    {input && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-muted-foreground">Built equation:</p>
                        <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm border border-primary/20">
                          {input}
                        </div>
                        <Button
                          onClick={handleSubmit}
                          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          disabled={loading}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Solve Problem
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="upload" className="mt-6">
                    <div className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-colors">
                      <Upload className="h-16 w-16 mx-auto mb-4 text-primary/60" />
                      <p className="text-xl font-medium mb-2">Upload Image or PDF</p>
                      <p className="text-muted-foreground mb-6">
                        Upload an image containing mathematical equations for OCR recognition
                      </p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file)
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button
                          variant="outline"
                          className="cursor-pointer border-primary/30 hover:bg-primary/10 bg-transparent"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </label>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="relative">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                      <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full border-2 border-primary/20"></div>
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">Processing with Wolfram Alpha...</p>
                    <p className="text-sm text-muted-foreground mt-2">This may take a few seconds</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Display */}
            {result && (
              <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Calculator className="h-5 w-5 text-primary" />
                      </div>
                      Solution
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {result.type}
                      </Badge>
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(result.solution)}
                        className="hover:bg-primary/10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="hover:bg-primary/10 bg-transparent">
                            <Download className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Export Solution</DialogTitle>
                            <DialogDescription>Choose export format</DialogDescription>
                          </DialogHeader>
                          <div className="flex gap-2">
                            <Button onClick={() => exportResult("txt")} variant="outline" className="flex-1">
                              <Download className="h-4 w-4 mr-2" />
                              Text File
                            </Button>
                            <Button onClick={() => exportResult("json")} variant="outline" className="flex-1">
                              <Download className="h-4 w-4 mr-2" />
                              JSON
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" className="hover:bg-primary/10 bg-transparent">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-3">Problem:</h4>
                    <div className="p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg font-mono text-sm border border-primary/10">
                      {result.input}
                    </div>
                  </div>

                  <Separator className="bg-primary/20" />

                  {result.assumptions && result.assumptions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-3">Assumptions:</h4>
                      <div className="space-y-2">
                        {result.assumptions.map((assumption, index) => (
                          <div
                            key={index}
                            className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm border border-blue-200/50 dark:border-blue-800/50"
                          >
                            {assumption}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.steps && result.steps.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-3">Solution Steps:</h4>
                      <div className="space-y-3">
                        {result.steps.map((step, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg text-sm border-l-4 border-primary/40"
                          >
                            <span className="font-semibold text-primary mr-2 bg-primary/10 px-2 py-1 rounded">
                              Step {index + 1}
                            </span>
                            <span className="ml-2">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-3">Final Answer:</h4>
                    <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl">
                      <div className="font-mono text-xl font-bold text-primary">{result.solution}</div>
                    </div>
                  </div>

                  {result.images && result.images.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-3">Visual Results:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.images.map((image, index) => (
                          <div key={index} className="border-2 border-primary/20 rounded-lg overflow-hidden">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Result ${index + 1}`}
                              className="w-full h-auto"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.warnings && result.warnings.length > 0 && (
                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {result.warnings.map((warning, index) => (
                            <div key={index}>{warning}</div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Examples */}
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Quick Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {mathCategories.map((category, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-sm mb-2 text-primary">{category.name}</h4>
                        <div className="space-y-2">
                          {category.examples.map((example, exIndex) => (
                            <Badge
                              key={exIndex}
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-xs block w-full text-left p-2 h-auto whitespace-normal"
                              onClick={() => setInput(example)}
                            >
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent History */}
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Recent History
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistory([])}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-60">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No history yet</p>
                  ) : (
                    <div className="space-y-2">
                      {history.slice(0, 10).map((item) => (
                        <div
                          key={item.id}
                          className="p-3 border border-primary/10 rounded-lg hover:bg-primary/5 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0" onClick={() => setInput(item.input)}>
                              <p className="text-xs font-medium truncate text-primary">{item.input}</p>
                              <p className="text-xs text-muted-foreground truncate mt-1">{item.result.solution}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.timestamp.toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(item)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                            >
                              <Star className={`h-3 w-3 ${item.favorite ? "fill-current text-primary" : ""}`} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <HistoryPanel
            history={history}
            favorites={favorites}
            onClose={() => setShowHistory(false)}
            onSelectItem={(item) => {
              setInput(item.input)
              setShowHistory(false)
            }}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* Color Customizer */}
        {showColorCustomizer && (
          <ColorCustomizer
            themes={defaultThemes}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            onClose={() => setShowColorCustomizer(false)}
          />
        )}
      </div>
    </div>
  )
}
