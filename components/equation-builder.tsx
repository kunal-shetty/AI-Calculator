"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Minus,
  ImagePlusIcon as MultiplyIcon,
  Divide,
  Equal,
  RotateCcw,
  Copy,
  Parentheses,
  Superscript,
  Radical,
  Pi,
  Infinity,
} from "lucide-react"

interface EquationBuilderProps {
  onResult: (equation: string) => void
}

export function EquationBuilder({ onResult }: EquationBuilderProps) {
  const [equation, setEquation] = useState("")
  const [cursor, setCursor] = useState(0)

  const insertAtCursor = (text: string) => {
    const newEquation = equation.slice(0, cursor) + text + equation.slice(cursor)
    setEquation(newEquation)
    setCursor(cursor + text.length)
  }

  const clearEquation = () => {
    setEquation("")
    setCursor(0)
  }

  const copyEquation = () => {
    navigator.clipboard.writeText(equation)
  }

  const basicOperators = [
    { symbol: "+", label: "Add", icon: Plus },
    { symbol: "-", label: "Subtract", icon: Minus },
    { symbol: "*", label: "Multiply", icon: MultiplyIcon },
    { symbol: "/", label: "Divide", icon: Divide },
    { symbol: "=", label: "Equals", icon: Equal },
    { symbol: "(", label: "Open Parenthesis", icon: Parentheses },
    { symbol: ")", label: "Close Parenthesis", icon: Parentheses },
  ]

  const advancedOperators = [
    { symbol: "^", label: "Power", icon: Superscript },
    { symbol: "sqrt(", label: "Square Root", icon: Radical },
    { symbol: "log(", label: "Logarithm", text: "log" },
    { symbol: "ln(", label: "Natural Log", text: "ln" },
    { symbol: "sin(", label: "Sine", text: "sin" },
    { symbol: "cos(", label: "Cosine", text: "cos" },
    { symbol: "tan(", label: "Tangent", text: "tan" },
    { symbol: "π", label: "Pi", icon: Pi },
    { symbol: "∞", label: "Infinity", icon: Infinity },
  ]

  const numbers = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "x", "y", "z"]

  const commonEquations = [
    { name: "Quadratic", template: "ax² + bx + c = 0" },
    { name: "Linear", template: "mx + b = y" },
    { name: "Circle", template: "(x-h)² + (y-k)² = r²" },
    { name: "Derivative", template: "d/dx(f(x))" },
    { name: "Integral", template: "∫f(x)dx" },
    { name: "Limit", template: "lim(x→a) f(x)" },
  ]

  return (
    <div className="space-y-6">
      {/* Equation Display */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="section-title">Equation Builder</CardTitle>
          <CardDescription>Build mathematical expressions visually</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Equation Preview */}
            <div className="result-showcase min-h-[80px] flex items-center justify-center">
              {equation ? (
                <div className="math-display text-2xl">{equation}</div>
              ) : (
                <p className="text-muted-foreground">Start building your equation...</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={clearEquation} disabled={!equation}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={copyEquation} disabled={!equation}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={() => onResult(equation)} disabled={!equation} className="gradient-button">
                Use Equation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="section-title">Quick Templates</CardTitle>
          <CardDescription>Start with common equation types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {commonEquations.map((eq, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setEquation(eq.template)
                  setCursor(eq.template.length)
                }}
                className="text-xs h-auto py-2 px-3"
              >
                <div className="text-center">
                  <div className="font-semibold">{eq.name}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">{eq.template}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input Panels */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Numbers and Variables */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="section-title text-sm">Numbers & Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {numbers.map((num, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => insertAtCursor(num)}
                  className="h-10 font-mono"
                >
                  {num}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Basic Operators */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="section-title text-sm">Basic Operators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {basicOperators.map((op, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => insertAtCursor(op.symbol)}
                  className="h-10 flex items-center gap-2"
                >
                  <op.icon className="h-4 w-4" />
                  <span className="font-mono">{op.symbol}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Functions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="section-title text-sm">Functions & Symbols</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="grid grid-cols-1 gap-2 pr-2">
                {advancedOperators.map((op, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => insertAtCursor(op.symbol)}
                    className="h-10 flex items-center gap-2 justify-start"
                  >
                    {op.icon ? <op.icon className="h-4 w-4" /> : null}
                    <span className="font-mono text-xs">{op.text || op.symbol}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {op.label}
                    </Badge>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Help Text */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Use the visual builder above or type directly in the text input tab
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <span>• Click buttons to insert symbols</span>
              <span>• Use templates for common equations</span>
              <span>• Copy equations to clipboard</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
