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
      return NextResponse.json(
        {
          error:
            "Wolfram Alpha API key not configured. Please add WOLFRAM_ALPHA_API_KEY to your environment variables.",
        },
        { status: 500 },
      )
    }

    // Build Wolfram Alpha API URL
    const baseUrl = "https://api.wolframalpha.com/v2/query"
    const params = new URLSearchParams({
      appid: appId,
      input: query,
      format: "plaintext,image",
      output: "json",
      includepodid: "Solution,Result,DecimalApproximation,Value,Input,AlternateForm,ExactResult,DecimalForm",
      scantimeout: "15",
      podtimeout: "15",
      formattimeout: "15",
      parsetimeout: "15",
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
      return NextResponse.json({ error: `Wolfram Alpha API error: ${response.status}` }, { status: response.status })
    }

    const responseText = await response.text()
    console.log("Response received, length:", responseText.length)

    // Parse JSON response
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      return NextResponse.json({ error: "Failed to parse Wolfram Alpha response" }, { status: 500 })
    }

    // Parse Wolfram Alpha response
    const result = parseWolframResponse(data, query)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Wolfram Alpha API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 },
    )
  }
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
          return `${assumption.template.replace("${desc1}", assumption.values[0]?.desc || "").replace("${desc2}", assumption.values[1]?.desc || "")}`
        }
        return assumption.text || assumption.word
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

    // Look for the Result pod first (this is the most common for basic math)
    const resultPod = queryResult.pods.find((pod: any) => pod.id === "Result")
    if (resultPod && resultPod.subpods && resultPod.subpods[0] && resultPod.subpods[0].plaintext) {
      result.solution = resultPod.subpods[0].plaintext
      console.log(`Found solution in Result pod: ${result.solution}`)
    }

    // If no Result pod, try other solution pods
    if (!result.solution) {
      const solutionPodIds = [
        "Solution",
        "DecimalApproximation",
        "ExactResult",
        "DecimalForm",
        "Value",
        "AlternateForm",
      ]

      for (const podId of solutionPodIds) {
        const pod = queryResult.pods.find((p: any) => p.id === podId)
        if (pod && pod.subpods && pod.subpods[0] && pod.subpods[0].plaintext) {
          result.solution = pod.subpods[0].plaintext
          console.log(`Found solution in ${podId}: ${result.solution}`)
          break
        }
      }
    }

    // If still no solution, check by title keywords
    if (!result.solution) {
      for (const pod of queryResult.pods) {
        if (pod.title && pod.subpods && pod.subpods[0] && pod.subpods[0].plaintext) {
          const title = pod.title.toLowerCase()
          if (
            title.includes("result") ||
            title.includes("solution") ||
            title.includes("value") ||
            title.includes("answer")
          ) {
            result.solution = pod.subpods[0].plaintext
            console.log(`Found solution by title "${pod.title}": ${result.solution}`)
            break
          }
        }
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

  console.log("Final result:", { solution: result.solution, steps: result.steps.length, type: result.type })
  return result
}
