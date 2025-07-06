import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query, format = "detailed", includesteps = false } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const appId = process.env.WOLFRAM_APP_ID
    if (!appId) {
      return NextResponse.json({ error: "Wolfram Alpha API key not configured" }, { status: 500 })
    }

    // Build Wolfram Alpha API URL
    const baseUrl = "http://api.wolframalpha.com/v2/query"
    const params = new URLSearchParams({
      appid: appId,
      input: query,
      format: "plaintext,image",
      output: "json",
      includepodid: "Solution,Result,DecimalApproximation,Plot",
    })

    if (includesteps) {
      params.append("podstate", "Step-by-step solution")
    }

    const response = await fetch(`${baseUrl}?${params}`)

    if (!response.ok) {
      throw new Error(`Wolfram Alpha API error: ${response.status}`)
    }

    const data = await response.json()

    // Parse Wolfram Alpha response
    const result = parseWolframResponse(data, query, format)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Wolfram Alpha API error:", error)
    return NextResponse.json({ error: "Failed to process query with Wolfram Alpha" }, { status: 500 })
  }
}

function parseWolframResponse(data: any, originalQuery: string, format: string) {
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

  if (!data.queryresult) {
    result.solution = "Unable to process query"
    return result
  }

  const queryResult = data.queryresult

  if (!queryResult.success) {
    result.solution = "No solution found"
    result.warnings.push("Wolfram Alpha could not interpret the query")
    return result
  }

  result.success = true

  // Extract assumptions
  if (queryResult.assumptions) {
    result.assumptions = queryResult.assumptions
      .map((assumption: any) => assumption.text || assumption.word)
      .filter(Boolean)
  }

  // Extract solution from pods
  if (queryResult.pods) {
    for (const pod of queryResult.pods) {
      // Main solution/result
      if (pod.id === "Solution" || pod.id === "Result" || pod.id === "DecimalApproximation") {
        if (pod.subpods && pod.subpods[0]) {
          result.solution = pod.subpods[0].plaintext || "Solution found"
        }
      }

      // Step-by-step solutions
      if (pod.title && pod.title.includes("step") && pod.subpods) {
        for (const subpod of pod.subpods) {
          if (subpod.plaintext) {
            result.steps.push(subpod.plaintext)
          }
        }
      }

      // Images and plots
      if (pod.subpods) {
        for (const subpod of pod.subpods) {
          if (subpod.img && subpod.img.src) {
            if (pod.id === "Plot" || pod.title?.includes("plot")) {
              result.plots.push(subpod.img.src)
            } else {
              result.images.push(subpod.img.src)
            }
          }
        }
      }
    }
  }

  // If no solution found in specific pods, try to get from any pod
  if (!result.solution && queryResult.pods) {
    for (const pod of queryResult.pods) {
      if (pod.subpods && pod.subpods[0] && pod.subpods[0].plaintext) {
        result.solution = pod.subpods[0].plaintext
        break
      }
    }
  }

  // Determine problem type
  if (originalQuery.toLowerCase().includes("integrate")) {
    result.type = "Integration"
  } else if (originalQuery.toLowerCase().includes("derivative")) {
    result.type = "Differentiation"
  } else if (originalQuery.toLowerCase().includes("solve")) {
    result.type = "Equation Solving"
  } else if (originalQuery.toLowerCase().includes("plot")) {
    result.type = "Plotting"
  } else if (originalQuery.toLowerCase().includes("factor")) {
    result.type = "Factorization"
  } else if (originalQuery.toLowerCase().includes("limit")) {
    result.type = "Limits"
  }

  return result
}
