"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface EquationBuilderProps {
  onEquationBuilt: (equation: string) => void
}

export function EquationBuilder({ onEquationBuilt }: EquationBuilderProps) {
  const [equation, setEquation] = useState("")

  const operators = [
    { symbol: "+", label: "Plus" },
    { symbol: "-", label: "Minus" },
    { symbol: "*", label: "Multiply" },
    { symbol: "/", label: "Divide" },
    { symbol: "^", label: "Power" },
    { symbol: "=", label: "Equals" },
    { symbol: "(", label: "(" },
    { symbol: ")", label: ")" },
  ]

  const functions = [
    { symbol: "sin(", label: "sin" },
    { symbol: "cos(", label: "cos" },
    { symbol: "tan(", label: "tan" },
    { symbol: "log(", label: "log" },
    { symbol: "ln(", label: "ln" },
    { symbol: "sqrt(", label: "√" },
    { symbol: "abs(", label: "|x|" },
    { symbol: "exp(", label: "e^x" },
  ]

  const constants = [
    { symbol: "pi", label: "π" },
    { symbol: "e", label: "e" },
    { symbol: "x", label: "x" },
    { symbol: "y", label: "y" },
    { symbol: "z", label: "z" },
    { symbol: "t", label: "t" },
  ]

  const operations = [
    { symbol: "solve ", label: "Solve" },
    { symbol: "integrate ", label: "∫" },
    { symbol: "derivative ", label: "d/dx" },
    { symbol: "limit ", label: "lim" },
    { symbol: "factor ", label: "Factor" },
    { symbol: "expand ", label: "Expand" },
    { symbol: "simplify ", label: "Simplify" },
    { symbol: "plot ", label: "Plot" },
  ]

  const addToEquation = (symbol: string) => {
    setEquation((prev) => prev + symbol)
  }

  const clearEquation = () => {
    setEquation("")
  }

  const buildEquation = () => {
    if (equation.trim()) {
      onEquationBuilt(equation)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Equation Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Equation Display */}
        <div>
          <label className="text-sm font-medium mb-2 block">Current Equation:</label>
          <Input
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            placeholder="Build your equation using the buttons below or type directly"
            className="font-mono"
          />
        </div>

        {/* Operations */}
        <div>
          <h4 className="text-sm font-medium mb-2">Operations:</h4>
          <div className="flex flex-wrap gap-2">
            {operations.map((op) => (
              <Badge
                key={op.symbol}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => addToEquation(op.symbol)}
              >
                {op.label}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Basic Operators */}
        <div>
          <h4 className="text-sm font-medium mb-2">Operators:</h4>
          <div className="flex flex-wrap gap-2">
            {operators.map((op) => (
              <Badge
                key={op.symbol}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => addToEquation(op.symbol)}
              >
                {op.symbol}
              </Badge>
            ))}
          </div>
        </div>

        {/* Functions */}
        <div>
          <h4 className="text-sm font-medium mb-2">Functions:</h4>
          <div className="flex flex-wrap gap-2">
            {functions.map((func) => (
              <Badge
                key={func.symbol}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => addToEquation(func.symbol)}
              >
                {func.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Constants */}
        <div>
          <h4 className="text-sm font-medium mb-2">Constants & Variables:</h4>
          <div className="flex flex-wrap gap-2">
            {constants.map((const_) => (
              <Badge
                key={const_.symbol}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => addToEquation(const_.symbol)}
              >
                {const_.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Numbers */}
        <div>
          <h4 className="text-sm font-medium mb-2">Numbers:</h4>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <Button key={num} variant="outline" size="sm" onClick={() => addToEquation(num.toString())}>
                {num}
              </Button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={buildEquation} className="flex-1" disabled={!equation.trim()}>
            Use Equation
          </Button>
          <Button onClick={clearEquation} variant="outline">
            Clear
          </Button>
        </div>

        {/* Quick Examples */}
        <div>
          <h4 className="text-sm font-medium mb-2">Quick Examples:</h4>
          <div className="space-y-1">
            {["solve x^2 + 5*x + 6 = 0", "integrate sin(x)", "derivative x^3 + 2*x^2", "limit sin(x)/x as x->0"].map(
              (example) => (
                <Badge
                  key={example}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted text-xs block w-full text-left p-2"
                  onClick={() => setEquation(example)}
                >
                  {example}
                </Badge>
              ),
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
