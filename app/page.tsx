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
    { name: "Basic Math", examples: ["1+1", "2*3", "10/2", "2^3", "sqrt(16)"] },
    { name: "Algebra", examples: ["solve x^2 + 5x + 6 = 0", "factor x^2 - 9", "expand (x+2)^3"] },
    { name: "Calculus", examples: ["integrate sin(x) dx", "derivative of x^3", "limit x->0 sin(x)/x"] },
    { name: "Statistics", examples: ["mean of 1,2,3,4,5", "standard deviation", "normal distribution"] },
    { name: "Geometry", examples: ["area of circle radius 5", "volume of sphere", "pythagorean theorem"] },
    { name: "Number Theory", examples: ["prime factorization 100", "gcd(48, 18)", "fibonacci 10"] },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl shadow-lg">
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Advanced AI Math Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Powered by Wolfram Alpha - Solve any math problem with step-by-step solutions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowColorCustomizer(true)}
              className="hover:bg-blue-50 transition-colors btn-text"
            >
              <Palette className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="hover:bg-blue-50 transition-colors btn-text"
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
            <Card className="shadow-xl border-0 bg-visible-card">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 card-text">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  Enter Your Math Problem
                </CardTitle>
                <CardDescription className="card-muted">
                  Choose your preferred input method to solve mathematical problems
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={inputMethod} onValueChange={(value: any) => setInputMethod(value)}>
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                    <TabsTrigger
                      value="text"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white tab-text"
                    >
                      Text
                    </TabsTrigger>
                    <TabsTrigger
                      value="builder"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white tab-text"
                    >
                      Builder
                    </TabsTrigger>
                    <TabsTrigger
                      value="upload"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white tab-text"
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
                          placeholder="Try: 1+1, solve x^2+5x+6=0, integrate sin(x), derivative of x^3"
                          className="min-h-[120px] border-blue-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm resize-none text-visible"
                          disabled={loading}
                        />
                        {input && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setInput("")}
                            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg text-white"
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
                        <p className="text-sm text-visible-muted">Built equation:</p>
                        <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm border border-blue-200 text-visible">
                          {input}
                        </div>
                        <Button
                          onClick={handleSubmit}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                          disabled={loading}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Solve Problem
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="upload" className="mt-6">
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center bg-gradient-to-br from-blue-50 to-transparent hover:from-blue-100 transition-colors">
                      <Upload className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                      <p className="text-xl font-medium mb-2 text-visible">Upload Image or PDF</p>
                      <p className="text-visible-muted mb-6">
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
                          className="cursor-pointer border-blue-300 hover:bg-blue-50 bg-transparent text-visible"
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
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <Card className="shadow-xl border-0 bg-visible-card">
                <CardContent className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="relative">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                      <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full border-2 border-blue-200"></div>
                    </div>
                    <p className="text-lg font-medium text-visible">Processing with Wolfram Alpha...</p>
                    <p className="text-sm text-visible-muted mt-2">This may take a few seconds</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Display */}
            {result && (
              <Card className="shadow-xl border-0 bg-visible-card">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-visible">Solution</span>
                      <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                        {result.type}
                      </Badge>
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(result.solution)}
                        className="hover:bg-green-50 btn-text"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="hover:bg-green-50 btn-text bg-transparent">
                            <Download className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="text-visible">Export Solution</DialogTitle>
                            <DialogDescription className="text-visible-muted">Choose export format</DialogDescription>
                          </DialogHeader>
                          <div className="flex gap-2">
                            <Button onClick={() => exportResult("txt")} variant="outline" className="flex-1 btn-text">
                              <Download className="h-4 w-4 mr-2" />
                              Text File
                            </Button>
                            <Button onClick={() => exportResult("json")} variant="outline" className="flex-1 btn-text">
                              <Download className="h-4 w-4 mr-2" />
                              JSON
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" className="hover:bg-green-50 btn-text bg-transparent">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <h4 className="font-semibold text-sm text-visible-muted mb-3">Problem:</h4>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg font-mono text-sm border border-gray-200 solution-text">
                      {result.input}
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  {result.assumptions && result.assumptions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-visible-muted mb-3">Assumptions:</h4>
                      <div className="space-y-2">
                        {result.assumptions.map((assumption, index) => (
                          <div
                            key={index}
                            className="p-3 bg-blue-50 rounded-lg text-sm border border-blue-200 solution-text"
                          >
                            {assumption}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.steps && result.steps.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-visible-muted mb-3">Solution Steps:</h4>
                      <div className="space-y-3">
                        {result.steps.map((step, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-sm border-l-4 border-blue-400"
                          >
                            <span className="font-semibold text-blue-600 mr-2 bg-blue-100 px-2 py-1 rounded">
                              Step {index + 1}
                            </span>
                            <span className="ml-2 solution-text">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm text-visible-muted mb-3">Final Answer:</h4>
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                      <div className="solution-mono text-2xl font-bold text-green-800">{result.solution}</div>
                    </div>
                  </div>

                  {result.images && result.images.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-visible-muted mb-3">Visual Results:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.images.map((image, index) => (
                          <div key={index} className="border-2 border-blue-200 rounded-lg overflow-hidden">
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
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        <div className="space-y-1 text-amber-800">
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
            <Card className="shadow-lg border-0 bg-visible-card">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span className="text-visible">Quick Examples</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {mathCategories.map((category, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-sm mb-2 text-visible-primary">{category.name}</h4>
                        <div className="space-y-2">
                          {category.examples.map((example, exIndex) => (
                            <div
                              key={exIndex}
                              className="badge-visible cursor-pointer hover:shadow-sm transition-all text-xs block w-full text-left p-3 rounded-lg"
                              onClick={() => setInput(example)}
                            >
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent History */}
            <Card className="shadow-lg border-0 bg-visible-card">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-600" />
                    <span className="text-visible">Recent History</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistory([])}
                    className="hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-60">
                  {history.length === 0 ? (
                    <p className="text-sm text-visible-muted text-center py-8">No history yet</p>
                  ) : (
                    <div className="space-y-2">
                      {history.slice(0, 10).map((item) => (
                        <div
                          key={item.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0" onClick={() => setInput(item.input)}>
                              <p className="text-xs font-medium truncate text-visible-primary">{item.input}</p>
                              <p className="text-xs text-visible-muted truncate mt-1">{item.result.solution}</p>
                              <p className="text-xs text-visible-muted mt-1">{item.timestamp.toLocaleDateString()}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(item)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-100"
                            >
                              <Star className={`h-3 w-3 ${item.favorite ? "fill-current text-yellow-500" : ""}`} />
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
