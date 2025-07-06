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
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { EquationBuilder } from "@/components/equation-builder"
import { VoiceInput } from "@/components/voice-input"
import { HistoryPanel } from "@/components/history-panel"

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

export default function Home() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<MathResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [favorites, setFavorites] = useState<HistoryItem[]>([])
  const [inputMethod, setInputMethod] = useState<"text" | "voice" | "builder" | "upload">("text")
  const [showHistory, setShowHistory] = useState(false)
  const [outputFormat, setOutputFormat] = useState<"simple" | "detailed" | "step-by-step">("detailed")

  // Load history from localStorage on mount
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
  }, [])

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

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript)
  }

  const handleEquationBuilt = (equation: string) => {
    setInput(equation)
  }

  const handleFileUpload = async (file: File) => {
    // Handle image/PDF upload for equation recognition
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

  const exportResult = (format: "txt" | "pdf" | "json") => {
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

  const exampleProblems = [
    "solve x^2 + 5x + 6 = 0",
    "integrate sin(x) dx from 0 to pi",
    "derivative of x^3 + 2x^2 - 5x + 1",
    "limit of (sin x)/x as x approaches 0",
    "factor x^4 - 16",
    "plot y = x^2 + 2x - 3",
    "solve system: 2x + y = 5, x - y = 1",
    "matrix multiplication [[1,2],[3,4]] * [[5,6],[7,8]]",
    "fibonacci sequence 20 terms",
    "prime factorization of 1024",
  ]

  const mathCategories = [
    { name: "Algebra", examples: ["solve x^2 + 5x + 6 = 0", "factor x^2 - 9", "expand (x+2)^3"] },
    { name: "Calculus", examples: ["integrate sin(x) dx", "derivative of x^3", "limit x->0 sin(x)/x"] },
    { name: "Statistics", examples: ["mean of 1,2,3,4,5", "standard deviation", "normal distribution"] },
    { name: "Geometry", examples: ["area of circle radius 5", "volume of sphere", "pythagorean theorem"] },
    { name: "Number Theory", examples: ["prime factorization 100", "gcd(48, 18)", "fibonacci 10"] },
    { name: "Linear Algebra", examples: ["matrix inverse", "eigenvalues", "determinant"] },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Advanced AI Math Calculator</h1>
              <p className="text-muted-foreground">
                Powered by Wolfram Alpha - Solve any math problem with step-by-step solutions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Input Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Enter Your Math Problem
                  </span>
                  <div className="flex items-center gap-2">
                    <Select value={outputFormat} onValueChange={(value: any) => setOutputFormat(value)}>
                      <SelectTrigger className="w-40">
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
                <CardDescription>Choose your preferred input method and output format</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={inputMethod} onValueChange={(value: any) => setInputMethod(value)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="voice">Voice</TabsTrigger>
                    <TabsTrigger value="builder">Builder</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex gap-2">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="e.g., solve x^2 + 5x + 6 = 0, integrate sin(x) dx, plot y = x^2"
                          className="flex-1 min-h-[100px]"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={loading || !input.trim()} className="flex-1">
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Solving with Wolfram Alpha...
                            </>
                          ) : (
                            "Solve Problem"
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setInput("")}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="voice">
                    <VoiceInput onTranscript={handleVoiceInput} />
                    {input && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Recognized:</p>
                        <div className="p-3 bg-muted rounded-lg">{input}</div>
                        <Button onClick={handleSubmit} className="mt-2 w-full" disabled={loading}>
                          Solve Problem
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="builder">
                    <EquationBuilder onEquationBuilt={handleEquationBuilt} />
                    {input && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Built equation:</p>
                        <div className="p-3 bg-muted rounded-lg font-mono">{input}</div>
                        <Button onClick={handleSubmit} className="mt-2 w-full" disabled={loading}>
                          Solve Problem
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="upload">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Upload Image or PDF</p>
                      <p className="text-sm text-muted-foreground mb-4">
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
                        <Button variant="outline" className="cursor-pointer bg-transparent">
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
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Processing with Wolfram Alpha...</p>
                    <p className="text-sm text-muted-foreground mt-2">This may take a few seconds</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Display */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      Solution
                      <Badge variant="outline">{result.type}</Badge>
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.solution)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Export Solution</DialogTitle>
                            <DialogDescription>Choose export format</DialogDescription>
                          </DialogHeader>
                          <div className="flex gap-2">
                            <Button onClick={() => exportResult("txt")} variant="outline">
                              Text File
                            </Button>
                            <Button onClick={() => exportResult("json")} variant="outline">
                              JSON
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Problem:</h4>
                    <div className="p-3 bg-muted rounded-lg font-mono text-sm">{result.input}</div>
                  </div>

                  <Separator />

                  {result.assumptions && result.assumptions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Assumptions:</h4>
                      <div className="space-y-1">
                        {result.assumptions.map((assumption, index) => (
                          <div key={index} className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
                            {assumption}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.steps && result.steps.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Solution Steps:</h4>
                      <div className="space-y-2">
                        {result.steps.map((step, index) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm border-l-2 border-primary/20">
                            <span className="font-medium text-primary mr-2">Step {index + 1}:</span>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Final Answer:</h4>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="font-mono text-lg font-semibold text-primary">{result.solution}</div>
                    </div>
                  </div>

                  {result.images && result.images.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Visual Results:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.images.map((image, index) => (
                          <img
                            key={index}
                            src={image || "/placeholder.svg"}
                            alt={`Result ${index + 1}`}
                            className="rounded-lg border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {result.warnings && result.warnings.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60">
                  <div className="space-y-3">
                    {mathCategories.map((category, index) => (
                      <div key={index}>
                        <h4 className="font-medium text-sm mb-2">{category.name}</h4>
                        <div className="space-y-1">
                          {category.examples.map((example, exIndex) => (
                            <Badge
                              key={exIndex}
                              variant="secondary"
                              className="cursor-pointer hover:bg-secondary/80 transition-colors text-xs block w-full text-left"
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Recent History
                  <Button variant="ghost" size="sm" onClick={() => setHistory([])}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No history yet</p>
                  ) : (
                    <div className="space-y-2">
                      {history.slice(0, 10).map((item) => (
                        <div key={item.id} className="p-2 border rounded-lg hover:bg-muted/50 cursor-pointer group">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0" onClick={() => setInput(item.input)}>
                              <p className="text-xs font-medium truncate">{item.input}</p>
                              <p className="text-xs text-muted-foreground truncate">{item.result.solution}</p>
                              <p className="text-xs text-muted-foreground">{item.timestamp.toLocaleDateString()}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(item)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Star className={`h-3 w-3 ${item.favorite ? "fill-current" : ""}`} />
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
      </div>
    </div>
  )
}
