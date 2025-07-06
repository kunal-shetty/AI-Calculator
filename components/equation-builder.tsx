"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, Plus, Minus, ImagePlusIcon as MultiplyIcon, Divide, Equal } from "lucide-react"

interface EquationBuilderProps {
  onEquationBuilt: (equation: string) => void
}

export function EquationBuilder({ onEquationBuilt }: EquationBuilderProps) {
  const [equation, setEquation] = useState("")

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

  const symbols = [
    { label: "x", value: "x" },
    { label: "y", value: "y" },
    { label: "z", value: "z" },
    { label: "+", value: " + ", icon: Plus },
    { label: "−", value: " - ", icon: Minus },
    { label: "×", value: " * ", icon: MultiplyIcon },
    { label: "÷", value: " / ", icon: Divide },
    { label: "=", value: " = ", icon: Equal },
    { label: "x²", value: "^2" },
    { label: "x³", value: "^3" },
    { label: "√", value: "sqrt(" },
    { label: "∫", value: "integrate " },
    { label: "d/dx", value: "derivative of " },
    { label: "lim", value: "limit " },
    { label: "sin", value: "sin(" },
    { label: "cos", value: "cos(" },
    { label: "tan", value: "tan(" },
    { label: "ln", value: "ln(" },
    { label: "log", value: "log(" },
    { label: "e", value: "e" },
    { label: "π", value: "pi" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: "∞", value: "infinity" },
  ]

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]

  const operations = [
    { label: "Solve", value: "solve " },
    { label: "Factor", value: "factor " },
    { label: "Expand", value: "expand " },
    { label: "Simplify", value: "simplify " },
    { label: "Plot", value: "plot " },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Equation Builder
        </CardTitle>
        <CardDescription>Build your mathematical expression using buttons below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display */}
        <div className="p-4 bg-muted rounded-lg min-h-[60px] font-mono text-lg border-2 border-primary/20">
          {equation || "Start building your equation..."}
        </div>

        {/* Operations */}
        <div>
          <h4 className="text-sm font-medium mb-2">Operations</h4>
          <div className="flex flex-wrap gap-2">
            {operations.map((op, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => addToEquation(op.value)}
              >
                {op.label}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Numbers */}
        <div>
          <h4 className="text-sm font-medium mb-2">Numbers</h4>
          <div className="grid grid-cols-5 gap-2">
            {numbers.map((num, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => addToEquation(num)}
                className="hover:bg-primary hover:text-primary-foreground"
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Mathematical Symbols */}
        <div>
          <h4 className="text-sm font-medium mb-2">Symbols & Functions</h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {symbols.map((symbol, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => addToEquation(symbol.value)}
                className="hover:bg-primary hover:text-primary-foreground flex items-center justify-center"
              >
                {symbol.icon ? <symbol.icon className="h-4 w-4" /> : symbol.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={buildEquation} className="flex-1" disabled={!equation.trim()}>
            Use This Equation
          </Button>
          <Button variant="outline" onClick={clearEquation}>
            Clear
          </Button>
        </div>

        {/* Quick Examples */}
        <div>
          <h4 className="text-sm font-medium mb-2">Quick Examples</h4>
          <div className="space-y-1">
            {[
              "solve x^2 + 5x + 6 = 0",
              "integrate sin(x) dx",
              "derivative of x^3 + 2x^2",
              "factor x^2 - 9",
              "plot y = x^2 + 2x - 3",
            ].map((example, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors text-xs block w-full text-left p-2 h-auto whitespace-normal"
                onClick={() => setEquation(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
