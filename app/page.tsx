"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ColorCustomizer } from "@/components/color-customizer"
import { HistoryPanel } from "@/components/history-panel"
import { EquationBuilder } from "@/components/equation-builder"
import { VoiceInput } from "@/components/voice-input"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Calculator,
  History,
  Palette,
  Mic,
  Camera,
  Upload,
  Sparkles,
  Brain,
  Zap,
  BookOpen,
  Settings,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react"

interface CalculationStep {
  step: string
  explanation: string
  result?: string
}

interface CalculationResult {
  input: string
  result: string
  steps: CalculationStep[]
  timestamp: Date
  method: string
}

export default function MathCalculator() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [history, setHistory] = useState<CalculationResult[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("math-calculator-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setHistory(parsed.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) })))
      } catch (e) {
        console.error("Failed to load history:", e)
      }
    }
  }, [])

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("math-calculator-history", JSON.stringify(history))
    }
  }, [history])

  const simulateProgress = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
    return interval
  }

  const solveProblem = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    setError("")
    setResult(null)

    const progressInterval = simulateProgress()

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: input }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to solve problem")
      }

      const newResult: CalculationResult = {
        input: input,
        result: data.result,
        steps: data.steps || [],
        timestamp: new Date(),
        method: "AI Solver",
      }

      setResult(newResult)
      setHistory((prev) => [newResult, ...prev.slice(0, 49)]) // Keep last 50 results
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      clearInterval(progressInterval)
      setProgress(100)
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    setIsLoading(true)
    setError("")
    const progressInterval = simulateProgress()

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process image")
      }

      setInput(data.text)
      setActiveTab("text")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image")
    } finally {
      clearInterval(progressInterval)
      setProgress(100)
      setIsLoading(false)
    }
  }

  const handleVoiceResult = (transcript: string) => {
    setInput(transcript)
    setActiveTab("text")
  }

  const handleEquationResult = (equation: string) => {
    setInput(equation)
    setActiveTab("text")
  }

  const clearAll = () => {
    setInput("")
    setResult(null)
    setError("")
    setProgress(0)
  }

  const exampleProblems = [
    "Solve: 2x + 5 = 11",
    "Find the derivative of x² + 3x + 2",
    "Calculate the integral of sin(x) from 0 to π",
    "Factor: x² - 5x + 6",
    "Solve the system: x + y = 5, 2x - y = 1",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 pulse-glow">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-title font-bold">SolveAi</h1>
                <p className="text-caption">Your smartest way to solve math</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)} className="relative">
                <History className="h-5 w-5" />
                {history.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    {history.length > 99 ? "99+" : history.length}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowCustomizer(true)}>
                <Palette className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card fade-in-up">
              <CardHeader>
                <CardTitle className="section-title flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Problem Input
                </CardTitle>
                <CardDescription>
                  Enter your mathematical problem using text, voice, images, or our equation builder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="voice" className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Voice
                    </TabsTrigger>
                    {/* <TabsTrigger value="image" className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Image
                    </TabsTrigger> */}
                    <TabsTrigger value="builder" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Builder
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <Textarea
                      placeholder="Enter your mathematical problem here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="elegant-input min-h-[120px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault()
                          solveProblem()
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {exampleProblems.map((problem, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInput(problem)}
                          className="text-xs"
                        >
                          {problem}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="voice">
                    <VoiceInput onResult={handleVoiceResult} />
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4">
                    <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-title mb-2">Upload Math Problem Image</h3>
                      <p className="text-caption mb-4">Take a photo or upload an image of your mathematical problem</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                        className="hidden"
                      />
                      <Button onClick={() => fileInputRef.current?.click()} className="gradient-button">
                        Choose Image
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="builder">
                    <EquationBuilder onResult={handleEquationResult} />
                  </TabsContent>
                </Tabs>

                {isLoading && (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Processing your problem...
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                {error && (
                  <Alert className="mt-4 border-destructive/50 bg-destructive/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={solveProblem}
                    disabled={!input.trim() || isLoading}
                    className="gradient-button flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isLoading ? "Solving..." : "Solve Problem"}
                  </Button>
                  <Button variant="outline" onClick={clearAll} disabled={isLoading}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            {result && (
              <Card className="glass-card fade-in-up">
                <CardHeader>
                  <CardTitle className="section-title flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Solution
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Solved {result.timestamp.toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="result-showcase">
                    <div className="math-display">{result.result}</div>
                  </div>

                  {result.steps && result.steps.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="section-title">Solution Steps</h3>
                      <ScrollArea className="max-h-96 elegant-scrollbar">
                        <div className="space-y-3 pr-4">
                          {result.steps.map((step, index) => (
                            <div key={index} className="step-card">
                              <div className="flex items-start gap-3">
                                <Badge variant="secondary" className="mt-0.5">
                                  {index + 1}
                                </Badge>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{step.step}</p>
                                  <p className="text-caption mt-1">{step.explanation}</p>
                                  {step.result && (
                                    <div className="mt-2 p-2 bg-primary/5 rounded-lg">
                                      <code className="font-mono text-sm text-primary">{step.result}</code>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="section-title flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-caption">Problems Solved</span>
                  <Badge variant="secondary">{history.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-caption">Success Rate</span>
                  <Badge variant="secondary">{history.length > 0 ? "98%" : "N/A"}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-caption">Recent Activity</p>
                  {history.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="truncate flex-1">{item.input}</span>
                      <span className="text-muted-foreground">
                        {item.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help & Tips */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="section-title flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Tips & Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Keyboard Shortcuts</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Solve Problem</span>
                      <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Enter</kbd>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Supported Operations</p>
                  <div className="flex flex-wrap gap-1">
                    {["Algebra", "Calculus", "Geometry", "Statistics"].map((op) => (
                      <Badge key={op} variant="outline" className="text-xs">
                        {op}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onClose={() => setShowHistory(false)}
          onSelectProblem={(problem) => {
            setInput(problem.input)
            setShowHistory(false)
            setActiveTab("text")
          }}
          onClearHistory={() => {
            setHistory([])
            localStorage.removeItem("math-calculator-history")
          }}
        />
      )}

      {showCustomizer && <ColorCustomizer onClose={() => setShowCustomizer(false)} />}
    </div>
  )
}
