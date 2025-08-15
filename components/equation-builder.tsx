"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Calculator,
  Plus,
  Minus,
  X,
  Divide,
  Equal,
  RotateCcw,
  Copy,
  Parentheses,
  Pi,
  Infinity,
  ActivityIcon as Function,
  Delete,
} from "lucide-react"

interface EquationBuilderProps {
  onResult: (equation: string) => void
}

export function EquationBuilder({ onResult }: EquationBuilderProps) {
  const [equation, setEquation] = useState("")
  const [history, setHistory] = useState<string[]>([])

  const addToEquation = (value: string) => {
    setEquation((prev) => prev + value)
  }

  const clearEquation = () => {
    setEquation("")
  }

  const deleteLastChar = () => {
    setEquation((prev) => prev.slice(0, -1))
  }

  const copyEquation = () => {
    if (equation) {
      navigator.clipboard.writeText(equation)
    }
  }

  const buildEquation = () => {
    if (equation.trim()) {
      setHistory((prev) => [equation, ...prev.slice(0, 9)]) // Keep last 10
      onResult(equation)
    }
  }

  const useTemplate = (template: string) => {
    setEquation(template)
  }

  const useFromHistory = (historyEquation: string) => {
    setEquation(historyEquation)
  }

  const basicOperators = [
    { label: "+", value: " + ", icon: Plus },
    { label: "−", value: " - ", icon: Minus },
    { label: "×", value: " × ", icon: X },
    { label: "÷", value: " ÷ ", icon: Divide },
    { label: "=", value: " = ", icon: Equal },
  ]

  const numbers = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "x"]

  const functions = [
    { label: "sin", value: "sin(" },
    { label: "cos", value: "cos(" },
    { label: "tan", value: "tan(" },
    { label: "log", value: "log(" },
    { label: "ln", value: "ln(" },
    { label: "exp", value: "exp(" },
    { label: "abs", value: "abs(" },
    { label: "√", value: "√(" },
  ]

  const advanced = [
    { label: "(", value: "(", icon: Parentheses },
    { label: ")", value: ")" },
    { label: "x²", value: "²" },
    { label: "x³", value: "³" },
    { label: "^", value: "^" },
    { label: "π", value: "π", icon: Pi },
    { label: "∞", value: "∞", icon: Infinity },
    { label: "y", value: "y" },
  ]

  const commonEquations = [
    { name: "Quadratic", template: "ax² + bx + c = 0" },
    { name: "Linear", template: "mx + b = y" },
    { name: "Circle", template: "(x-h)² + (y-k)² = r²" },
    { name: "Pythagorean", template: "a² + b² = c²" },
    { name: "Slope", template: "m = (y₂-y₁)/(x₂-x₁)" },
    { name: "Distance", template: "d = √((x₂-x₁)² + (y₂-y₁)²)" },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Equation Display */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="section-title flex items-center gap-2 text-base sm:text-lg">
            <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Equation Builder
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Build mathematical expressions visually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="result-showcase min-h-[60px] sm:min-h-[80px] flex items-center justify-center p-2 sm:p-4">
            <div className="math-display text-center text-lg sm:text-2xl break-all">
              {equation || "Build your equation..."}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={buildEquation}
              disabled={!equation.trim()}
              className="gradient-button text-xs sm:text-sm px-3 sm:px-4"
            >
              Use Equation
            </Button>
            <Button
              variant="outline"
              onClick={copyEquation}
              disabled={!equation}
              size="sm"
              className="text-xs sm:text-sm bg-transparent"
            >
              <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={clearEquation} size="sm" className="text-xs sm:text-sm bg-transparent">
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Clear
            </Button>
            <Button variant="outline" onClick={deleteLastChar} size="sm" className="text-xs sm:text-sm bg-transparent">
              <Delete className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="section-title text-sm sm:text-base">Quick Templates</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Start with common equation types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {commonEquations.map((eq, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => useTemplate(eq.template)}
                className="text-xs h-auto py-2 px-2 sm:px-3 hover:bg-primary/10 hover:border-primary/30 transition-colors"
              >
                <div className="text-center w-full">
                  <div className="font-semibold text-xs sm:text-sm">{eq.name}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1 break-all">{eq.template}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Numbers & Basic Operations */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="section-title text-sm">Numbers & Basic Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Operators */}
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {basicOperators.map((op) => (
                <Button
                  key={op.label}
                  variant="outline"
                  size="sm"
                  onClick={() => addToEquation(op.value)}
                  className="h-8 sm:h-10 text-xs sm:text-sm font-semibold hover:bg-primary/10 hover:border-primary/30 transition-colors"
                >
                  {op.icon ? <op.icon className="h-3 w-3 sm:h-4 sm:w-4" /> : op.label}
                </Button>
              ))}
            </div>

            <Separator />

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {numbers.map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  size="sm"
                  onClick={() => addToEquation(num)}
                  className="h-8 sm:h-10 text-xs sm:text-sm font-semibold hover:bg-primary/10 hover:border-primary/30 transition-colors"
                >
                  {num}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Functions */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="section-title text-sm">Functions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-1 sm:gap-2">
              {functions.map((func) => (
                <Button
                  key={func.label}
                  variant="outline"
                  size="sm"
                  onClick={() => addToEquation(func.value)}
                  className="h-8 sm:h-10 text-xs font-semibold hover:bg-primary/10 hover:border-primary/30 transition-colors"
                >
                  {func.label}
                </Button>
              ))}
            </div>

            <Separator />

            {/* Advanced Symbols */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-1 sm:gap-2">
              {advanced.map((adv) => (
                <Button
                  key={adv.label}
                  variant="outline"
                  size="sm"
                  onClick={() => addToEquation(adv.value)}
                  className="h-8 sm:h-10 text-xs font-semibold hover:bg-primary/10 hover:border-primary/30 transition-colors"
                >
                  {adv.icon ? <adv.icon className="h-3 w-3 sm:h-4 sm:w-4" /> : adv.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Card className="glass-card lg:col-span-2 xl:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="section-title text-sm flex items-center gap-2">
                Recent Equations
                <Badge variant="secondary" className="text-xs">
                  {history.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32 sm:h-40 elegant-scrollbar">
                <div className="space-y-2">
                  {history.map((eq, index) => (
                    <div key={index} className="step-card cursor-pointer p-2 sm:p-3" onClick={() => useFromHistory(eq)}>
                      <div className="flex items-center justify-between">
                        <code className="font-mono text-xs sm:text-sm text-primary break-all flex-1 mr-2">{eq}</code>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                          <Function className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Help Text */}
      <Card className="glass-card">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-center space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              <strong>Tip:</strong> Click buttons to build equations or use templates for common formulas
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <span>• Use templates for quick start</span>
              <span>• Copy equations to clipboard</span>
              <span>• Access recent equations from history</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
