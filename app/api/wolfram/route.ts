import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Get API key from environment variables
    const appId = process.env.WOLFRAM_ALPHA_API_KEY

    if (!appId) {
      console.log("Wolfram Alpha API key not found, using fallback")
      // Return a more helpful fallback response
      return NextResponse.json({
        input: query,
        solution: getFallbackSolution(query),
        steps: getFallbackSteps(query),
        type: "Fallback",
        images: [],
        plots: [],
        assumptions: [],
        warnings: ["Using fallback calculation. Add WOLFRAM_ALPHA_API_KEY to environment variables for full functionality."],
        success: true,
        queryresult: null,
      })
    }

    // Build Wolfram Alpha API URL
    const baseUrl = "https://api.wolframalpha.com/v2/query"
    const params = new URLSearchParams({
      appid: appId,
      input: query,
      format: "plaintext,image",
      output: "json",
      includepodid: "Solution,Result,DecimalApproximation,Value,Input,AlternateForm,ExactResult,DecimalForm,IntegerSolution,RationalSolution,AlgebraicSolution",
      scantimeout: "10",
      podtimeout: "10",
      formattimeout: "10",
      parsetimeout: "10",
    })

    console.log("Making request to Wolfram Alpha API for query:", query)

    const response = await fetch(`${baseUrl}?${params}`, {
      method: "GET",
      headers: {
        "User-Agent": "NextJS-Math-Calculator/1.0",
        Accept: "application/json",
      },
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error Response:", errorText)
      
      // Return fallback on API error
      return NextResponse.json({
        input: query,
        solution: getFallbackSolution(query),
        steps: getFallbackSteps(query),
        type: "Fallback",
        images: [],
        plots: [],
        assumptions: [],
        warnings: [`Wolfram Alpha API error (${response.status}). Using fallback calculation.`],
        success: true,
        queryresult: null,
      })
    }

    const responseText = await response.text()
    console.log("Response received, length:", responseText.length)

    // Parse JSON response
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      return NextResponse.json({
        input: query,
        solution: getFallbackSolution(query),
        steps: getFallbackSteps(query),
        type: "Fallback",
        images: [],
        plots: [],
        assumptions: [],
        warnings: ["Failed to parse Wolfram Alpha response. Using fallback calculation."],
        success: true,
        queryresult: null,
      })
    }

    // Parse Wolfram Alpha response
    const result = parseWolframResponse(data, query)

    // If Wolfram didn't find a solution, try fallback
    if (!result.success || result.solution === "No solution found") {
      const fallbackSolution = getFallbackSolution(query)
      if (fallbackSolution !== "Unable to solve this problem") {
        return NextResponse.json({
          input: query,
          solution: fallbackSolution,
          steps: getFallbackSteps(query),
          type: "Fallback",
          images: [],
          plots: [],
          assumptions: [],
          warnings: ["Wolfram Alpha couldn't solve this. Using built-in calculator."],
          success: true,
          queryresult: data,
        })
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Wolfram Alpha API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 },
    )
  }
}

function getFallbackSolution(query: string): string {
  const cleanQuery = query.toLowerCase().trim()
  
  try {
    // Handle basic arithmetic
    if (/^[\d\s+\-*/().^]+$/.test(cleanQuery.replace(/\s/g, ''))) {
      // Replace ^ with ** for JavaScript
      const jsExpression = cleanQuery.replace(/\^/g, '**')
      const result = eval(jsExpression)
      return result.toString()
    }
    
    // Handle simple equations
    if (cleanQuery.includes('=') && cleanQuery.includes('x')) {
      // Very basic linear equation solver
      const match = cleanQuery.match(/([+-]?\d*\.?\d*)x\s*([+-])\s*(\d+\.?\d*)\s*=\s*(\d+\.?\d*)/)
      if (match) {
        const a = parseFloat(match[1]) || 1
        const sign = match[2]
        const b = parseFloat(match[3])
        const c = parseFloat(match[4])
        
        const adjustedB = sign === '+' ? b : -b
        const x = (c - adjustedB) / a
        return `x = ${x}`
      }
    }
    
    // Handle basic functions
    if (cleanQuery.includes('sqrt')) {
      const match = cleanQuery.match(/sqrt\((\d+\.?\d*)\)/)
      if (match) {
        const result = Math.sqrt(parseFloat(match[1]))
        return result.toString()
      }
    }
    
    if (cleanQuery.includes('sin')) {
      const match = cleanQuery.match(/sin\((\d+\.?\d*)\)/)
      if (match) {
        const result = Math.sin(parseFloat(match[1]))
        return result.toString()
      }
    }
    
    if (cleanQuery.includes('cos')) {
      const match = cleanQuery.match(/cos\((\d+\.?\d*)\)/)
      if (match) {
        const result = Math.cos(parseFloat(match[1]))
        return result.toString()
      }
    }
    
    if (cleanQuery.includes('tan')) {
      const match = cleanQuery.match(/tan\((\d+\.?\d*)\)/)
      if (match) {
        const result = Math.tan(parseFloat(match[1]))
        return result.toString()
      }
    }
    
    // Handle logarithms
    if (cleanQuery.includes('log')) {
      const match = cleanQuery.match(/log\((\d+\.?\d*)\)/)
      if (match) {
        const result = Math.log10(parseFloat(match[1]))
        return result.toString()
      }
    }
    
    if (cleanQuery.includes('ln')) {
      const match = cleanQuery.match(/ln\((\d+\.?\d*)\)/)
      if (match) {
        const result = Math.log(parseFloat(match[1]))
        return result.toString()
      }
    }
    
    // Handle factorials
    if (cleanQuery.includes('!')) {
      const match = cleanQuery.match(/(\d+)!/)
      if (match) {
        const n = parseInt(match[1])
        if (n <= 20) { // Prevent overflow
          let result = 1
          for (let i = 2; i <= n; i++) {
            result *= i
          }
          return result.toString()
        }
      }
    }
    
    return "Unable to solve this problem"
  } catch (error) {
    return "Unable to solve this problem"
  }
}

function getFallbackSteps(query: string): string[] {
  const cleanQuery = query.toLowerCase().trim()
  
  // Basic arithmetic steps
  if (/^[\d\s+\-*/().^]+$/.test(cleanQuery.replace(/\s/g, ''))) {
    return [
      "Evaluate the expression using order of operations",
      "Perform operations inside parentheses first",
      "Handle exponents and roots",
      "Multiply and divide from left to right",
      "Add and subtract from left to right"
    ]
  }
  
  // Equation solving steps
  if (cleanQuery.includes('=') && cleanQuery.includes('x')) {
    return [
      "Identify the linear equation",
      "Isolate the variable x",
      "Perform arithmetic operations",
      "Verify the solution"
    ]
  }
  
  return ["Apply appropriate mathematical methods to solve the problem"]
}

function parseWolframResponse(data: any, originalQuery: string) {
  const result = {
    input: originalQuery,
    solution: "",
    steps: [] as string[],
    type: "Mathematical",
    images: [] as string[],
    plots: [] as string[],
    assumptions: [] as string[],
    warnings: [] as string[],
    success: false,
    queryresult: data,
  }

  console.log("Parsing Wolfram response...")

  if (!data.queryresult) {
    result.solution = "No response from Wolfram Alpha"
    result.warnings.push("Invalid response structure")
    console.log("No queryresult in response")
    return result
  }

  const queryResult = data.queryresult
  console.log("Query success:", queryResult.success)
  console.log("Number of pods:", queryResult.pods?.length || 0)

  if (!queryResult.success) {
    result.solution = "Wolfram Alpha could not interpret the query"
    result.warnings.push("Query not understood by Wolfram Alpha")
    if (queryResult.tips) {
      result.warnings.push(`Tip: ${queryResult.tips}`)
    }
    if (queryResult.didyoumeans && queryResult.didyoumeans.length > 0) {
      result.warnings.push(`Did you mean: ${queryResult.didyoumeans[0].val}?`)
    }
    return result
  }

  result.success = true

  // Extract assumptions
  if (queryResult.assumptions && Array.isArray(queryResult.assumptions)) {
    result.assumptions = queryResult.assumptions
      .map((assumption: any) => {
        if (assumption.template && assumption.values) {
          return assumption.template.replace(/\$\{[^}]+\}/g, (match: string) => {
            const key = match.slice(2, -1)
            const value = assumption.values.find((v: any) => v.name === key)
            return value ? value.desc : match
          })
        }
        return assumption.text || assumption.word || ""
      })
      .filter(Boolean)
  }

  // Extract solution from pods
  if (queryResult.pods && Array.isArray(queryResult.pods)) {
    console.log("Processing pods...")

    // Log all pods for debugging
    queryResult.pods.forEach((pod: any, index: number) => {
      console.log(`Pod ${index}: ID="${pod.id}", Title="${pod.title}"`)
      if (pod.subpods && pod.subpods[0] && pod.subpods[0].plaintext) {
        console.log(`  Content: "${pod.subpods[0].plaintext}"`)
      }
    })

    // Priority order for solution pods
    const solutionPodIds = [
      "Result",
      "Solution", 
      "DecimalApproximation",
      "ExactResult",
      "DecimalForm",
      "Value",
      "AlternateForm",
      "IntegerSolution",
      "RationalSolution",
      "AlgebraicSolution"
    ]

    // Look for solution in priority order
    for (const podId of solutionPodIds) {
      const pod = queryResult.pods.find((p: any) => p.id === podId)
      if (pod && pod.subpods && pod.subpods[0] && pod.subpods[0].plaintext) {
        result.solution = pod.subpods[0].plaintext
        console.log(`Found solution in ${podId}: ${result.solution}`)
        break
      }
    }

    // If no solution found by ID, check by title keywords
    if (!result.solution) {
      const solutionKeywords = ["result", "solution", "value", "answer", "decimal", "exact"]
      
      for (const pod of queryResult.pods) {
        if (pod.title && pod.subpods && pod.subpods[0] && pod.subpods[0].plaintext) {
          const title = pod.title.toLowerCase()
          if (solutionKeywords.some(keyword => title.includes(keyword))) {
            result.solution = pod.subpods[0].plaintext
            console.log(`Found solution by title "${pod.title}": ${result.solution}`)
            break
          }
        }
      }
    }

    // If still no solution, take the second pod (first is usually Input)
    if (!result.solution && queryResult.pods.length > 1) {
      const secondPod = queryResult.pods[1]
      if (secondPod.subpods && secondPod.subpods[0] && secondPod.subpods[0].plaintext) {
        result.solution = secondPod.subpods[0].plaintext
        console.log(`Using second pod as solution: ${result.solution}`)
      }
    }

    // Extract step-by-step solutions
    for (const pod of queryResult.pods) {
      if (
        (pod.title && pod.title.toLowerCase().includes("step")) ||
        pod.id === "StepByStepSolution" ||
        pod.id === "PossibleStepsToSolution"
      ) {
        if (pod.subpods && Array.isArray(pod.subpods)) {
          for (const subpod of pod.subpods) {
            if (subpod.plaintext && subpod.plaintext.trim()) {
              result.steps.push(subpod.plaintext)
            }
          }
        }
      }
    }

    // Extract images and plots
    for (const pod of queryResult.pods) {
      if (pod.subpods && Array.isArray(pod.subpods)) {
        for (const subpod of pod.subpods) {
          if (subpod.img && subpod.img.src) {
            if (pod.id === "Plot" || (pod.title && pod.title.toLowerCase().includes("plot"))) {
              result.plots.push(subpod.img.src)
            } else {
              result.images.push(subpod.img.src)
            }
          }
        }
      }
    }
  }

  // If still no solution, indicate no result
  if (!result.solution) {
    result.solution = "No solution found"
    result.warnings.push("Wolfram Alpha did not return a solution for this query")
    console.log("No solution found in any pod")
  }

  // Determine problem type
  const queryLower = originalQuery.toLowerCase()
  if (queryLower.includes("integrate")) {
    result.type = "Integration"
  } else if (queryLower.includes("derivative") || queryLower.includes("differentiate")) {
    result.type = "Differentiation"
  } else if (queryLower.includes("solve")) {
    result.type = "Equation Solving"
  } else if (queryLower.includes("plot") || queryLower.includes("graph")) {
    result.type = "Plotting"
  } else if (queryLower.includes("factor")) {
    result.type = "Factorization"
  } else if (queryLower.includes("limit")) {
    result.type = "Limits"
  } else if (queryLower.match(/^\d+\s*[+\-*/^]\s*\d+$/)) {
    result.type = "Arithmetic"
  } else if (queryLower.includes("expand")) {
    result.type = "Expansion"
  } else if (queryLower.includes("simplify")) {
    result.type = "Simplification"
  }

  console.log("Final result:", { 
    solution: result.solution, 
    steps: result.steps.length, 
    type: result.type,
    success: result.success 
  })
  
  return result
}
