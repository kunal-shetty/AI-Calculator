"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Calculator,
  Plus,
  Minus,
  X,
  Divide,
  Square,
  SquareIcon as SquareRoot,
  Sigma,
  Pi,
  Infinity,
  ActivityIcon as Function,
  Parentheses,
  Equal,
  PlusIcon as GreaterThan,
  MinusIcon as LessThan,
  Trash2,
  Copy,
} from "lucide-react"

interface EquationBuilderProps {
  onEquationBuilt: (equation: string) => void
}

export function EquationBuilder({ onEquationBuilt }: EquationBuilderProps) {
  const [equation, setEquation] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("basic")

  const basicOperators = [
    { symbol: "+", label: "Add", icon: Plus },
    { symbol: "-", label: "Subtract", icon: Minus },
    { symbol: "*", label: "Multiply", icon: X },
    { symbol: "/", label: "Divide", icon: Divide },
    { symbol: "^", label: "Power", icon: Square },
    { symbol: "sqrt()", label: "Square Root", icon: SquareRoot },
    { symbol: "(", label: "Open Parenthesis", icon: Parentheses },
    { symbol: ")", label: "Close Parenthesis", icon: Parentheses },
    { symbol: "=", label: "Equals", icon: Equal },
    { symbol: ">", label: "Greater Than", icon: GreaterThan },
    { symbol: "<", label: "Less Than", icon: LessThan },
  ]

  const advancedFunctions = [
    { symbol: "sin()", label: "Sine" },
    { symbol: "cos()", label: "Cosine" },
    { symbol: "tan()", label: "Tangent" },
    { symbol: "log()", label: "Logarithm" },
    { symbol: "ln()", label: "Natural Log" },
    { symbol: "exp()", label: "Exponential" },
    { symbol: "abs()", label: "Absolute Value" },
    { symbol: "floor()", label: "Floor" },
    { symbol: "ceil()", label: "Ceiling" },
    { symbol: "round()", label: "Round" },
  ]

  const constants = [
    { symbol: "pi", label: "Pi (π)", icon: Pi },
    { symbol: "e", label: "Euler's Number" },
    { symbol: "infinity", label: "Infinity", icon: Infinity },
    { symbol: "i", label: "Imaginary Unit" },
  ]

  const calculus = [
    { symbol: "integrate ", label: "Integral", icon: Sigma },
    { symbol: "derivative ", label: "Derivative" },
    { symbol: "limit ", label: "Limit" },
    { symbol: "sum ", label: "Summation", icon: Sigma },
    { symbol: "product ", label: "Product" },
  ]

  const algebra = [
    { symbol: "solve ", label: "Solve" },
    { symbol: "factor ", label: "Factor" },
    { symbol: "expand ", label: "Expand" },
    { symbol: "simplify ", label: "Simplify" },
    { symbol: "substitute ", label: "Substitute" },
  ]

  const matrices = [
    { symbol: "[[", label: "Start Matrix" },
    { symbol: "]]", label: "End Matrix" },
    { symbol: ",", label: "Comma" },
    { symbol: ";", label: "Semicolon" },
    { symbol: "det()", label: "Determinant" },
    { symbol: "inverse()", label: "Inverse" },
    { symbol: "transpose()", label: "Transpose" },
  ]

  const addToEquation = (symbol: string) => {
    setEquation((prev) => prev + symbol)
  }

  const clearEquation = () => {
    setEquation("")
  }

  const copyEquation = () => {
    navigator.clipboard.writeText(equation)
  }

  const buildEquation = () => {
    if (equation.trim()) {
      onEquationBuilt(equation)
    }
  }

  const categories = [
    { id: "basic", label: "Basic", items: basicOperators },
    { id: "functions", label: "Functions", items: advancedFunctions },
    { id: "constants", label: "Constants", items: constants },
    { id: "calculus", label: "Calculus", items: calculus },
    { id: "algebra", label: "Algebra", items: algebra },
    { id: "matrices", label: "Matrices", items: matrices },
  ]

  const commonEquations = [
    { name: "Quadratic Formula", equation: "solve a*x^2 + b*x + c = 0" },
    { name: "Pythagorean Theorem", equation: "sqrt(a^2 + b^2)" },
    { name: "Area of Circle", equation: "pi * r^2" },
    { name: "Derivative of x^n", equation: "derivative x^n" },
    { name: "Integral of x^n", equation: "integrate x^n dx" },
    { name: "Sine Wave", equation: "sin(x)" },
    { name: "Exponential Growth", equation: "a * e^(b*x)" },
    { name: "Normal Distribution", equation: "1/sqrt(2*pi) * e^(-x^2/2)" },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Function className="h-5 w-5" />
          Equation Builder
        </CardTitle>
        <CardDescription>Build mathematical equations using visual tools and symbols</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equation Display */}
        <div className="space-y-2">
          <Label htmlFor="equation-display">Current Equation</Label>
          <div className="relative">
            <Input
              id="equation-display"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="Your equation will appear here..."
              className="font-mono text-lg pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button variant="ghost" size="sm" onClick={copyEquation} disabled={!equation}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={clearEquation} disabled={!equation}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {category.items.map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => addToEquation(item.symbol)}
                      className="flex items-center gap-2 h-auto p-3 text-left justify-start"
                    >
                      {IconComponent && <IconComponent className="h-4 w-4 flex-shrink-0" />}
                      <div className="min-w-0">
                        <div className="font-mono text-sm truncate">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.label}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Common Equations */}
        <div className="space-y-2">
          <Label>Common Equations</Label>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {commonEquations.map((eq, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                  <div>
                    <div className="font-medium text-sm">{eq.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{eq.equation}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEquation(eq.equation)}>
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Variables Helper */}
        <div className="space-y-2">
          <Label>Quick Variables</Label>
          <div className="flex flex-wrap gap-2">
            {["x", "y", "z", "a", "b", "c", "n", "t", "θ", "α", "β", "γ"].map((variable) => (
              <Badge
                key={variable}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => addToEquation(variable)}
              >
                {variable}
              </Badge>
            ))}
          </div>
        </div>

        {/* Numbers Helper */}
        <div className="space-y-2">
          <Label>Number Pad</Label>
          <div className="grid grid-cols-4 gap-2 max-w-xs">
            {[7, 8, 9, "/", 4, 5, 6, "*", 1, 2, 3, "-", 0, ".", "=", "+"].map((num) => (
              <Button
                key={num}
                variant="outline"
                size="sm"
                onClick={() => addToEquation(num.toString())}
                className="aspect-square"
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        {/* Build Button */}
        <Button onClick={buildEquation} disabled={!equation.trim()} className="w-full">
          <Calculator className="h-4 w-4 mr-2" />
          Build Equation
        </Button>
      </CardContent>
    </Card>
  )
}
