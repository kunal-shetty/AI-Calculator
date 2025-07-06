import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { problem } = await request.json()

    if (!problem) {
      return NextResponse.json({ error: "Problem is required" }, { status: 400 })
    }

    // Try to solve using built-in math functions
    const result = solveBasicMath(problem)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Solve API error:", error)
    return NextResponse.json({ error: "Failed to process problem" }, { status: 500 })
  }
}

function solveBasicMath(problem: string) {
  const cleanProblem = problem.toLowerCase().trim()
  
  try {
    // Handle basic arithmetic expressions
    if (/^[\d\s+\-*/().^]+$/.test(cleanProblem.replace(/\s/g, ''))) {
      const jsExpression = cleanProblem.replace(/\^/g, '**')
      const result = eval(jsExpression)
      
      return {
        input: problem,
        solution: result.toString(),
        steps: [
          "Identify the arithmetic expression",
          "Apply order of operations (PEMDAS)",
          "Evaluate parentheses first",
          "Handle exponents",
          "Perform multiplication and division from left to right",
          "Perform addition and subtraction from left to right",
          `Final result: ${result}`
        ],
        type: "Arithmetic",
        success: true,
        images: [],
        plots: [],
        assumptions: [],
        warnings: [],
      }
    }
    
    // Handle quadratic equations
    if (cleanProblem.includes('x^2') || cleanProblem.includes('x²')) {
      const quadraticMatch = cleanProblem.match(/([+-]?\d*\.?\d*)x\^?2\s*([+-])\s*(\d*\.?\d*)x\s*([+-])\s*(\d+\.?\d*)\s*=\s*0/)
      if (quadraticMatch) {
        const a = parseFloat(quadraticMatch[1]) || 1
        const bSign = quadraticMatch[2]
        const bCoeff = parseFloat(quadraticMatch[3]) || 1
        const b = bSign === '+' ? bCoeff : -bCoeff
        const cSign = quadraticMatch[4]
        const cCoeff = parseFloat(quadraticMatch[5])
        const c = cSign === '+' ? cCoeff : -cCoeff
        
        const discriminant = b * b - 4 * a * c
        
        if (discriminant >= 0) {
          const x1 = (-b + Math.sqrt(discriminant)) / (2 * a)
          const x2 = (-b - Math.sqrt(discriminant)) / (2 * a)
          
          return {
            input: problem,
            solution: discriminant === 0 ? `x = ${x1}` : `x = ${x1}, x = ${x2}`,
            steps: [
              `Identify quadratic equation: ${a}x² + ${b}x + ${c} = 0`,
              `Use quadratic formula: x = (-b ± √(b² - 4ac)) / (2a)`,
              `Calculate discriminant: b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant}`,
              discriminant > 0 ? "Two real solutions exist" : discriminant === 0 ? "One real solution exists" : "No real solutions",
              `x = (${-b} ± √${discriminant}) / ${2 * a}`,
              discriminant === 0 ? `x = ${x1}` : `x₁ = ${x1}, x₂ = ${x2}`
            ],
            type: "Quadratic Equation",
            success: true,
            images: [],
            plots: [],
            assumptions: [],
            warnings: [],
          }
        }
      }
    }
    
    // Handle linear equations
    if (cleanProblem.includes('=') && cleanProblem.includes('x')) {
      const linearMatch = cleanProblem.match(/([+-]?\d*\.?\d*)x\s*([+-])\s*(\d+\.?\d*)\s*=\s*(\d+\.?\d*)/)
      if (linearMatch) {
        const a = parseFloat(linearMatch[1]) || 1
        const sign = linearMatch[2]
        const b = parseFloat(linearMatch[3])
        const c = parseFloat(linearMatch[4])
        
        const adjustedB = sign === '+' ? b : -b
        const x = (c - adjustedB) / a
        
        return {
          input: problem,
          solution: `x = ${x}`,
          steps: [
            `Start with: ${problem}`,
            `Identify linear equation: ${a}x ${sign} ${b} = ${c}`,
            `Subtract ${adjustedB} from both sides: ${a}x = ${c - adjustedB}`,
            `Divide both sides by ${a}: x = ${(c - adjustedB) / a}`,
            `Solution: x = ${x}`
          ],
          type: "Linear Equation",
          success: true,
          images: [],
          plots: [],
          assumptions: [],
          warnings: [],
        }
      }
    }
    
    // Handle basic functions
    const functionHandlers = [
      {
        pattern: /sqrt\((\d+\.?\d*)\)/,
        solve: (match: RegExpMatchArray) => {
          const value = parseFloat(match[1])
          const result = Math.sqrt(value)
          return {
            result: result.toString(),
            steps: [
              `Calculate √${value}`,
              `√${value} = ${result}`
            ],
            type: "Square Root"
          }
        }
      },
      {
        pattern: /sin\((\d+\.?\d*)\)/,
        solve: (match: RegExpMatchArray) => {
          const value = parseFloat(match[1])
          const result = Math.sin(value)
          return {
            result: result.toString(),
            steps: [
              `Calculate sin(${value})`,
              `sin(${value}) = ${result}`
            ],
            type: "Trigonometric"
          }
        }
      },
      {
        pattern: /cos\((\d+\.?\d*)\)/,
        solve: (match: RegExpMatchArray) => {
          const value = parseFloat(match[1])
          const result = Math.cos(value)
          return {
            result: result.toString(),
            steps: [
              `Calculate cos(${value})`,
              `cos(${value}) = ${result}`
            ],
            type: "Trigonometric"
          }
        }
      },
      {
        pattern: /(\d+)!/,
        solve: (match: RegExpMatchArray) => {
          const n = parseInt(match[1])
          if (n <= 20) {
            let result = 1
            const steps = [`Calculate ${n}!`]
            for (let i = 2; i <= n; i++) {
              result *= i
              steps.push(`${i - 1}! × ${i} = ${result}`)
            }
            return {
              result: result.toString(),
              steps,
              type: "Factorial"
            }
          }
          return null
        }
      }
    ]
    
    for (const handler of functionHandlers) {
      const match = cleanProblem.match(handler.pattern)
      if (match) {
        const solution = handler.solve(match)
        if (solution) {
          return {
            input: problem,
            solution: solution.result,
            steps: solution.steps,
            type: solution.type,
            success: true,
            images: [],
            plots: [],
            assumptions: [],
            warnings: [],
          }
        }
      }
    }
    
    // If no specific handler found, try basic evaluation
    try {
      const jsExpression = cleanProblem
        .replace(/\^/g, '**')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
      
      const result = eval(jsExpression)
      
      return {
        input: problem,
        solution: result.toString(),
        steps: [
          "Parse the mathematical expression",
          "Apply built-in mathematical functions",
          `Result: ${result}`
        ],
        type: "Mathematical Expression",
        success: true,
        images: [],
        plots: [],
        assumptions: [],
        warnings: ["This is a basic calculation. For advanced features, configure Wolfram Alpha API."],
      }
    } catch (evalError) {
      // Return unsolvable response
      return {
        input: problem,
        solution: "Unable to solve this problem with basic calculator",
        steps: [
          "Attempted to parse the expression",
          "Expression format not recognized",
          "Consider using Wolfram Alpha API for advanced calculations"
        ],
        type: "Unsupported",
        success: false,
        images: [],
        plots: [],
        assumptions: [],
        warnings: ["This problem requires advanced mathematical solving capabilities. Please configure Wolfram Alpha API."],
      }
    }
    
  } catch (error) {
    return {
      input: problem,
      solution: "Error processing the problem",
      steps: ["An error occurred while processing the mathematical expression"],
      type: "Error",
      success: false,
      images: [],
      plots: [],
      assumptions: [],
      warnings: ["An error occurred. Please check your input and try again."],
    }
  }
}
