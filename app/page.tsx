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
  CheckCircle,
  Menu,
  Sparkles,
  Zap,
  Brain,
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
  suggestions?: string[]
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
  description: string
  gradient: string
  shadow: string
}

const defaultThemes: ColorTheme[] = [
  {
    name: "Ocean Breeze",
    description: "Cool blues and teals for focused mathematical thinking",
    primary: "59 130 246", // blue-500
    secondary: "239 246 255", // blue-50
    accent: "219 234 254", // blue-100
    background: "255 255 255", // white
    foreground: "15 23 42", // slate-900
    mutedForeground: "71 85 105", // slate-600
    cardForeground: "15 23 42", // slate-900
    gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    shadow: "59 130 246",
  },
  {
    name: "Crimson Energy",
    description: "Bold reds and crimsons for energetic problem solving",
    primary: "220 38 127", // pink-700
    secondary: "253 242 248", // pink-50
    accent: "252 231 243", // pink-100
    background: "255 255 255", // white
    foreground: "15 23 42", // slate-900
    mutedForeground: "71 85 105", // slate-600
    cardForeground: "15 23 42", // slate-900
    gradient: "linear-gradient(135deg, #dc2626 0%, #be185d 100%)",
    shadow: "220 38 127",
  },
  {
    name: "Deep Space",
    description: "Rich purples and indigos for creative calculations",
    primary: "99 102 241", // indigo-500
    secondary: "238 242 255", // indigo-50
    accent: "224 231 255", // indigo-100
    background: "255 255 255", // white
    foreground: "15 23 42", // slate-900
    mutedForeground: "71 85 105", // slate-600
    cardForeground: "15 23 42", // slate-900
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    shadow: "99 102 241",
  },
  {
    name: "Emerald Forest",
    description: "Fresh greens and emeralds for natural problem solving",
    primary: "16 185 129", // emerald-500
    secondary: "236 253 245", // emerald-50
    accent: "209 250 229", // emerald-100
    background: "255 255 255", // white
    foreground: "15 23 42", // slate-900
    mutedForeground: "71 85 105", // slate-600
    cardForeground: "15 23 42", // slate-900
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    shadow: "16 185 129",
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
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(defaultThemes[0])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Load saved preferences
  useEffect(() => {
    const savedHistory = localStorage.getItem("math-calculator-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setHistory(
          parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          })),
        )
      } catch (e) {
        console.error("Failed to parse saved history:", e)
      }
    }

    const savedFavorites = localStorage.getItem("math-calculator-favorites")
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites)
        setFavorites(
          parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          })),
        )
      } catch (e) {
        console.error("Failed to parse saved favorites:", e)
      }
    }

    const savedTheme = localStorage.getItem("math-calculator-theme")
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme)
        const foundTheme = defaultThemes.find((t) => t.name === theme.name) || defaultThemes[0]
        setCurrentTheme(foundTheme)
        applyTheme(foundTheme)
      } catch (e) {
        console.error("Failed to parse saved theme:", e)
      }
    } else {
      applyTheme(defaultThemes[0])
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
    root.style.setProperty("--card", theme.background)
    root.style.setProperty("--theme-gradient", theme.gradient)
    root.style.setProperty("--theme-shadow", theme.shadow)
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
      console.log("Submitting query:", input)

      const response = await fetch("/api/wolfram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: input,
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to solve the problem")
      }

      const data = await response.json()
      console.log("Received data:", data)

      setResult(data)
      saveToHistory(input, data)
    } catch (err) {
      console.error("Submit error:", err)
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
    { name: "Basic Math", examples: ["1+1", "2*3", "10/2", "2^3", "sqrt(16)"], icon: "🔢" },
    { name: "Algebra", examples: ["solve x^2 + 5x + 6 = 0", "factor x^2 - 9", "expand (x+2)^3"], icon: "📐" },
    { name: "Calculus", examples: ["integrate sin(x) dx", "derivative of x^3", "limit x->0 sin(x)/x"], icon: "∫" },
    { name: "Statistics", examples: ["mean of 1,2,3,4,5", "standard deviation", "normal distribution"], icon: "📊" },
    { name: "Geometry", examples: ["area of circle radius 5", "volume of sphere", "pythagorean theorem"], icon: "📏" },
    { name: "Number Theory", examples: ["prime factorization 100", "gcd(48, 18)", "fibonacci 10"], icon: "🔍" },
  ]

  return (
    <div className="min-h-screen theme-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto animate-slide-in-left">
            <div className="p-2 sm:p-3 theme-primary-bg rounded-xl shadow-lg hover-lift pulse-glow">
              <Calculator className="h-6 w-6 sm:h-8 sm:w-8 theme-primary-text animate-bounce-subtle" />
            </div>
            <div className="flex-1 sm:flex-none">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold theme-gradient-text animate-gradient">
                Advanced AI Math Calculator
              </h1>
              <p className="text-sm sm:text-base lg:text-lg theme-muted-text mt-1 animate-fade-in-up">
                Powered by Wolfram Alpha - Solve any math problem with step-by-step solutions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end animate-slide-in-right">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowColorCustomizer(true)}
              className="theme-button h-8 w-8 sm:h-10 sm:w-10 hover-lift glow-on-hover"
            >
              <Palette className="h-3 w-3 sm:h-4 sm:w-4 animate-spin-slow" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="theme-button h-8 w-8 sm:h-10 sm:w-10 hover-lift glow-on-hover"
            >
              <History className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="theme-button h-8 w-8 sm:h-10 sm:w-10 lg:hidden hover-lift glow-on-hover"
            >
              <Menu className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Input Methods */}
            <Card className="theme-card shadow-xl border-0 hover-lift animate-fade-in glass-morphism">
              <CardHeader className="theme-secondary-bg rounded-t-lg p-4 sm:p-6 gradient-border-top">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl theme-card-text">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 theme-primary-text animate-pulse-glow" />
                  Enter Your Math Problem
                  <Sparkles className="h-4 w-4 theme-primary-text animate-twinkle ml-auto" />
                </CardTitle>
                <CardDescription className="text-sm sm:text-base theme-muted-text animate-fade-in-up">
                  Choose your preferred input method to solve mathematical problems
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <Tabs value={inputMethod} onValueChange={(value: any) => setInputMethod(value)}>
                  <TabsList className="grid w-full grid-cols-3 h-8 sm:h-10 glass-tabs">
                    <TabsTrigger value="text" className="theme-tab text-xs sm:text-sm hover-lift">
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="builder" className="theme-tab text-xs sm:text-sm hover-lift">
                      Builder
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="theme-tab text-xs sm:text-sm hover-lift">
                      Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 mt-4 sm:mt-6 animate-fade-in">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Try: 1+1, solve x^2+5x+6=0, integrate sin(x), derivative of x^3"
                          className="min-h-[100px] sm:min-h-[120px] theme-input resize-none text-sm sm:text-base focus-glow animate-input-focus"
                          disabled={loading}
                        />
                        {input && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setInput("")}
                            className="absolute top-2 right-2 h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-red-100 hover:text-red-600 hover-lift animate-bounce-in"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="w-full h-10 sm:h-12 theme-primary-button shadow-lg text-white text-sm sm:text-base hover-lift glow-on-hover animate-pulse-button"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                            <span className="animate-pulse">Solving with Wolfram Alpha...</span>
                          </>
                        ) : (
                          <>
                            <Calculator className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            <span>Solve Problem</span>
                            <Zap className="h-4 w-4 ml-2 animate-flash" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="builder" className="mt-4 sm:mt-6 animate-fade-in">
                    <EquationBuilder onEquationBuilt={handleEquationBuilt} />
                    {input && (
                      <div className="mt-4 space-y-3 animate-slide-in-up">
                        <p className="text-xs sm:text-sm theme-muted-text">Built equation:</p>
                        <div className="p-3 sm:p-4 theme-secondary-bg rounded-lg font-mono text-xs sm:text-sm border theme-border glass-morphism">
                          {input}
                        </div>
                        <Button
                          onClick={handleSubmit}
                          className="w-full theme-primary-button text-white h-10 sm:h-12 hover-lift glow-on-hover"
                          disabled={loading}
                        >
                          <Calculator className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Solve Problem
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="upload" className="mt-4 sm:mt-6 animate-fade-in">
                    <div className="border-2 border-dashed theme-border rounded-xl p-8 sm:p-12 text-center theme-secondary-bg hover:theme-accent-bg transition-all duration-300 hover-lift glass-morphism">
                      <Upload className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 theme-primary-text animate-float" />
                      <p className="text-lg sm:text-xl font-medium mb-2 theme-card-text">Upload Image or PDF</p>
                      <p className="text-sm sm:text-base theme-muted-text mb-6">
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
                          className="cursor-pointer theme-button bg-transparent hover-lift glow-on-hover"
                        >
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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
              <Alert variant="destructive" className="border-red-200 bg-red-50 animate-shake glass-morphism">
                <AlertCircle className="h-4 w-4 animate-pulse" />
                <AlertDescription className="text-red-800 text-sm sm:text-base">{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <Card className="theme-card shadow-xl border-0 animate-fade-in glass-morphism">
                <CardContent className="flex items-center justify-center py-12 sm:py-16">
                  <div className="text-center">
                    <div className="relative">
                      <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto mb-4 theme-primary-text" />
                      <div className="absolute inset-0 h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-full border-2 theme-border animate-pulse-ring"></div>
                      <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 theme-primary-text animate-pulse" />
                    </div>
                    <p className="text-base sm:text-lg font-medium theme-card-text animate-pulse">
                      Processing with Wolfram Alpha...
                    </p>
                    <p className="text-xs sm:text-sm theme-muted-text mt-2 animate-fade-in-up">
                      This may take a few seconds
                    </p>
                    <div className="mt-4 flex justify-center space-x-1">
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Display */}
            {result && (
              <Card className="theme-card shadow-xl border-0 animate-slide-in-up glass-morphism">
                <CardHeader className="theme-success-bg rounded-t-lg p-4 sm:p-6 gradient-border-top">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-lg animate-bounce-in">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 animate-check" />
                      </div>
                      <span className="text-lg sm:text-xl theme-card-text">Solution</span>
                      <Badge
                        variant="outline"
                        className="border-green-300 text-green-700 bg-green-50 text-xs sm:text-sm animate-badge-glow"
                      >
                        {result.type}
                      </Badge>
                      <Sparkles className="h-4 w-4 text-green-600 animate-twinkle" />
                    </span>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(result.solution)}
                        className="hover:bg-green-50 h-8 sm:h-9 hover-lift glow-on-hover"
                      >
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-green-50 bg-transparent h-8 sm:h-9 hover-lift glow-on-hover"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[90vw] max-w-md glass-morphism">
                          <DialogHeader>
                            <DialogTitle>Export Solution</DialogTitle>
                            <DialogDescription>Choose export format</DialogDescription>
                          </DialogHeader>
                          <div className="flex gap-2">
                            <Button onClick={() => exportResult("txt")} variant="outline" className="flex-1 hover-lift">
                              <Download className="h-4 w-4 mr-2" />
                              Text File
                            </Button>
                            <Button
                              onClick={() => exportResult("json")}
                              variant="outline"
                              className="flex-1 hover-lift"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              JSON
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-green-50 bg-transparent h-8 sm:h-9 hover-lift glow-on-hover"
                      >
                        <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <div className="animate-fade-in-up">
                    <h4 className="font-semibold text-xs sm:text-sm theme-muted-text mb-3">Problem:</h4>
                    <div className="p-3 sm:p-4 theme-secondary-bg rounded-lg font-mono text-xs sm:text-sm border theme-border break-all glass-morphism">
                      {result.input}
                    </div>
                  </div>

                  <Separator className="animate-fade-in" />

                  {result.assumptions && result.assumptions.length > 0 && (
                    <div className="animate-slide-in-left">
                      <h4 className="font-semibold text-xs sm:text-sm theme-muted-text mb-3">Assumptions:</h4>
                      <div className="space-y-2">
                        {result.assumptions.map((assumption, index) => (
                          <div
                            key={index}
                            className="p-3 theme-accent-bg rounded-lg text-xs sm:text-sm border theme-border glass-morphism animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            {assumption}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.steps && result.steps.length > 0 && (
                    <div className="animate-slide-in-right">
                      <h4 className="font-semibold text-xs sm:text-sm theme-muted-text mb-3">Solution Steps:</h4>
                      <div className="space-y-3">
                        {result.steps.map((step, index) => (
                          <div
                            key={index}
                            className="p-3 sm:p-4 rounded-lg text-xs sm:text-sm theme-step-container glass-morphism animate-slide-in-up hover-lift"
                            style={{ animationDelay: `${index * 150}ms` }}
                          >
                            <span className="font-semibold theme-primary-text mr-2 theme-primary-bg px-2 py-1 rounded text-xs animate-badge-glow">
                              Step {index + 1}
                            </span>
                            <span className="ml-2 break-words theme-card-text">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="animate-zoom-in">
                    <h4 className="font-semibold text-xs sm:text-sm theme-muted-text mb-3">Final Answer:</h4>
                    <div className="p-4 sm:p-6 rounded-xl theme-solution-result glass-morphism hover-lift">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold font-mono break-all theme-solution-text animate-gradient">
                        {result.solution}
                      </div>
                    </div>
                  </div>

                  {result.images && result.images.length > 0 && (
                    <div className="animate-fade-in-up">
                      <h4 className="font-semibold text-xs sm:text-sm theme-muted-text mb-3">Visual Results:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {result.images.map((image, index) => (
                          <div
                            key={index}
                            className="border-2 theme-border rounded-lg overflow-hidden glass-morphism hover-lift animate-fade-in-up"
                            style={{ animationDelay: `${index * 200}ms` }}
                          >
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
                    <Alert className="border-amber-200 bg-amber-50 animate-shake glass-morphism">
                      <AlertCircle className="h-4 w-4 text-amber-600 animate-pulse" />
                      <AlertDescription>
                        <div className="space-y-1 text-amber-800 text-xs sm:text-sm">
                          {result.warnings.map((warning, index) => (
                            <div
                              key={index}
                              className="animate-fade-in-up"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              {warning}
                            </div>
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
          <div className={`space-y-4 sm:space-y-6 ${sidebarOpen ? "block" : "hidden lg:block"} animate-slide-in-right`}>
            {/* Quick Examples */}
            <Card className="theme-card shadow-lg border-0 hover-lift glass-morphism">
              <CardHeader className="theme-accent-bg rounded-t-lg p-4 gradient-border-top">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 theme-primary-text animate-spin-slow" />
                  <span className="theme-card-text">Quick Examples</span>
                  <Sparkles className="h-4 w-4 theme-primary-text animate-twinkle ml-auto" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <ScrollArea className="h-60 sm:h-80 scrollbar-thin">
                  <div className="space-y-3 sm:space-y-4">
                    {mathCategories.map((category, index) => (
                      <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <h4 className="font-semibold text-xs sm:text-sm mb-2 theme-primary-text flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          {category.name}
                        </h4>
                        <div className="space-y-1 sm:space-y-2">
                          {category.examples.map((example, exIndex) => (
                            <Button
                              key={exIndex}
                              variant="outline"
                              size="sm"
                              className="w-full text-left justify-start h-auto p-2 sm:p-3 text-xs theme-button bg-transparent break-words whitespace-normal hover-lift glow-on-hover"
                              onClick={() => setInput(example)}
                            >
                              {example}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent History */}
            <Card className="theme-card shadow-lg border-0 hover-lift glass-morphism">
              <CardHeader className="theme-accent-bg rounded-t-lg p-4 gradient-border-top">
                <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <History className="h-4 w-4 sm:h-5 sm:w-5 theme-primary-text animate-pulse-glow" />
                    <span className="theme-card-text">Recent History</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistory([])}
                    className="hover:bg-red-100 hover:text-red-600 h-8 w-8 p-0 hover-lift"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <ScrollArea className="h-48 sm:h-60 scrollbar-thin">
                  {history.length === 0 ? (
                    <p className="text-xs sm:text-sm theme-muted-text text-center py-8 animate-pulse">No history yet</p>
                  ) : (
                    <div className="space-y-2">
                      {history.slice(0, 10).map((item, index) => (
                        <div
                          key={item.id}
                          className="p-2 sm:p-3 border theme-border rounded-lg theme-button cursor-pointer group transition-all duration-300 hover-lift glass-morphism animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0" onClick={() => setInput(item.input)}>
                              <p className="text-xs font-medium truncate theme-primary-text">{item.input}</p>
                              <p className="text-xs theme-muted-text truncate mt-1">{item.result.solution}</p>
                              <p className="text-xs theme-muted-text mt-1">{item.timestamp.toLocaleDateString()}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(item)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-100 h-6 w-6 p-0 hover-lift"
                            >
                              <Star
                                className={`h-3 w-3 ${item.favorite ? "fill-current text-yellow-500 animate-twinkle" : ""}`}
                              />
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
