import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { problem } = await request.json()

    if (!problem) {
      return NextResponse.json({ error: "Problem is required" }, { status: 400 })
    }

    console.log("Solving problem:", problem)

    // Try Wolfram Alpha first
    try {
      const wolframResponse = await fetch(`${request.nextUrl.origin}/api/wolfram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: problem }),
      })

      if (wolframResponse.ok) {
        const wolframData = await wolframResponse.json()
        if (wolframData.result && !wolframData.error) {
          return NextResponse.json({
            result: wolframData.result,
            steps: wolframData.steps || [],
            method: "Wolfram Alpha",
            source: "wolfram",
          })
        }
      }
    } catch (error) {
      console.error("Wolfram Alpha failed:", error)
    }

    // Fallback to basic pattern matching and mock solutions
    const result = await solveMathProblem(problem)

    return NextResponse.json({
      result: result.solution,
      steps: result.steps,
      method: "Pattern Matching",
      source: "fallback",
    })
  } catch (error) {
    console.error("Solve API error:", error)
    return NextResponse.json({ error: "Failed to solve problem" }, { status: 500 })
  }
}

async function solveMathProblem(problem: string) {
  const normalizedProblem = problem.toLowerCase().trim()

  // Linear equation pattern: ax + b = c
  const linearMatch = normalizedProblem.match(/(\d*)\s*x\s*([+-])\s*(\d+)\s*=\s*(\d+)/)
  if (linearMatch) {
    const a = Number.parseInt(linearMatch[1]) || 1
    const operator = linearMatch[2]
    const b = Number.parseInt(linearMatch[3])
    const c = Number.parseInt(linearMatch[4])

    const actualB = operator === "+" ? b : -b
    const x = (c - actualB) / a

    return {
      solution: `x = ${x}`,
      steps: [
        {
          step: `Start with: ${a}x ${operator} ${b} = ${c}`,
          explanation: "Given linear equation",
        },
        {
          step: `${a}x = ${c} ${operator === "+" ? "-" : "+"} ${b}`,
          explanation: `${operator === "+" ? "Subtract" : "Add"} ${b} from both sides`,
        },
        {
          step: `${a}x = ${c - actualB}`,
          explanation: "Simplify the right side",
        },
        {
          step: `x = ${c - actualB}/${a}`,
          explanation: `Divide both sides by ${a}`,
        },
        {
          step: `x = ${x}`,
          explanation: "Final answer",
        },
      ],
    }
  }

  // Quadratic equation pattern: ax² + bx + c = 0
  const quadraticMatch = normalizedProblem.match(/(\d*)\s*x²?\s*([+-])\s*(\d*)\s*x\s*([+-])\s*(\d+)\s*=\s*0/)
  if (quadraticMatch) {
    return {
      solution: "x = (-b ± √(b² - 4ac)) / 2a",
      steps: [
        {
          step: "Identify coefficients a, b, and c",
          explanation: "From the standard form ax² + bx + c = 0",
        },
        {
          step: "Apply the quadratic formula",
          explanation: "x = (-b ± √(b² - 4ac)) / 2a",
        },
        {
          step: "Calculate the discriminant",
          explanation: "b² - 4ac determines the nature of roots",
        },
        {
          step: "Solve for x",
          explanation: "Substitute values and simplify",
        },
      ],
    }
  }

  // Derivative pattern
  if (normalizedProblem.includes("derivative") || normalizedProblem.includes("d/dx")) {
    return {
      solution: "Apply differentiation rules",
      steps: [
        {
          step: "Identify the function to differentiate",
          explanation: "Determine f(x) from the given expression",
        },
        {
          step: "Apply appropriate differentiation rules",
          explanation: "Use power rule, product rule, chain rule as needed",
        },
        {
          step: "Simplify the result",
          explanation: "Combine like terms and simplify",
        },
      ],
    }
  }

  // Integral pattern
  if (normalizedProblem.includes("integral") || normalizedProblem.includes("∫")) {
    return {
      solution: "Apply integration techniques",
      steps: [
        {
          step: "Identify the integrand",
          explanation: "Determine the function to integrate",
        },
        {
          step: "Choose integration method",
          explanation: "Use substitution, integration by parts, or basic rules",
        },
        {
          step: "Apply the antiderivative",
          explanation: "Find F(x) such that F'(x) = f(x)",
        },
        {
          step: "Add constant of integration",
          explanation: "Include + C for indefinite integrals",
        },
      ],
    }
  }

  // Default response for unrecognized patterns
  return {
    solution: "Problem requires advanced mathematical analysis",
    steps: [
      {
        step: "Analyze the problem structure",
        explanation: "Identify the type of mathematical problem",
      },
      {
        step: "Apply relevant mathematical principles",
        explanation: "Use appropriate formulas and theorems",
      },
      {
        step: "Solve step by step",
        explanation: "Work through the solution methodically",
      },
      {
        step: "Verify the answer",
        explanation: "Check the solution by substitution or alternative methods",
      },
    ],
  }
}
