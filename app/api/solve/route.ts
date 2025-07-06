import { type NextRequest, NextResponse } from "next/server"

// Mock AI math solver for demonstration
function solveMathProblem(problem: string) {
  const lowerProblem = problem.toLowerCase()

  // Simple pattern matching for common math problems
  if (lowerProblem.includes("x^2") && lowerProblem.includes("=")) {
    return {
      input: problem,
      type: "Quadratic Equation",
      steps: [
        "Identify this as a quadratic equation in the form ax² + bx + c = 0",
        "Use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a",
        "Calculate the discriminant: b² - 4ac",
        "Solve for x using the quadratic formula",
      ],
      solution: "x = -2, x = -3 (example solution)",
    }
  }

  if (lowerProblem.includes("integrate") || lowerProblem.includes("∫")) {
    return {
      input: problem,
      type: "Integration",
      steps: ["Identify the function to integrate", "Apply integration rules", "Add the constant of integration"],
      solution: "∫sin(x)dx = -cos(x) + C (example solution)",
    }
  }

  if (lowerProblem.includes("derivative") || lowerProblem.includes("d/dx")) {
    return {
      input: problem,
      type: "Differentiation",
      steps: [
        "Identify the function to differentiate",
        "Apply differentiation rules (power rule, chain rule, etc.)",
        "Simplify the result",
      ],
      solution: "d/dx[x³ + 2x² - 5x + 1] = 3x² + 4x - 5 (example solution)",
    }
  }

  if (lowerProblem.includes("limit")) {
    return {
      input: problem,
      type: "Limit",
      steps: [
        "Identify the limit expression",
        "Check for indeterminate forms",
        "Apply L'Hôpital's rule or algebraic manipulation",
        "Evaluate the limit",
      ],
      solution: "lim(x→0) sin(x)/x = 1 (example solution)",
    }
  }

  if (lowerProblem.includes("factor")) {
    return {
      input: problem,
      type: "Factoring",
      steps: [
        "Look for common factors",
        "Apply factoring techniques (difference of squares, trinomial factoring, etc.)",
        "Verify by expanding",
      ],
      solution: "x² - 9 = (x + 3)(x - 3) (example solution)",
    }
  }

  if (lowerProblem.includes("system")) {
    return {
      input: problem,
      type: "System of Equations",
      steps: [
        "Write the system in standard form",
        "Choose a solution method (substitution, elimination, or matrix)",
        "Solve for one variable",
        "Substitute back to find the other variable",
      ],
      solution: "x = 2, y = 1 (example solution)",
    }
  }

  // Default response for unrecognized problems
  return {
    input: problem,
    type: "Mathematical Problem",
    steps: [
      "Analyze the problem structure",
      "Apply appropriate mathematical principles",
      "Perform calculations step by step",
      "Verify the solution",
    ],
    solution:
      "This is a demonstration. In a real implementation, this would connect to an AI service like OpenAI or WolframAlpha to solve: " +
      problem,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { problem } = await request.json()

    if (!problem || typeof problem !== "string") {
      return NextResponse.json({ error: "Problem is required and must be a string" }, { status: 400 })
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const result = solveMathProblem(problem)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error solving math problem:", error)
    return NextResponse.json({ error: "Failed to solve the math problem" }, { status: 500 })
  }
}
