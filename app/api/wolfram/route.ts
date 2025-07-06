import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Use the provided API key
    const appId = "PAKKY6-WJX9V36LQL"

    // Build Wolfram Alpha API URL
    const baseUrl = "https://api.wolframalpha.com/v2/query"
    const params = new URLSearchParams({
      appid: appId,
      input: query,
      format: "plaintext,image",
      output: "json",
      includepodid: "Solution,Result,DecimalApproximation,Plot,StepByStepSolution,Input,AlternateForm",
      podstate: "Step-by-step solution",
      scantimeout: "10",
      podtimeout: "10",
      formattimeout: "10",
      parsetimeout: "10",
    })

    console.log("Making request to:", `${baseUrl}?${params}`)

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
      return NextResponse.json(
        { error: `Wolfram Alpha API error: ${response.status} - ${errorText}` },
        { status: response.status },
      )
    }

    const responseText = await response.text()
    console.log("Raw response length:", responseText.length)

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

  if (!data.queryresult) {
    result.solution = "No response from Wolfram Alpha"
    result.warnings.push("Invalid response structure")
    return result
  }

  const queryResult = data.queryresult

  if (!queryResult.success) {
    result.solution = "Wolfram Alpha could not interpret the query"
    result.warnings.push("Query not understood by Wolfram Alpha")
    if (queryResult.tips) {
      result.warnings.push(`Tip: ${queryResult.tips}`)
    }
    return result
  }

  result.success = true

  // Extract assumptions
  if (queryResult.assumptions && Array.isArray(queryResult.assumptions)) {
    result.assumptions = queryResult.assumptions
      .map((assumption: any) => assumption.text || assumption.word)
      .filter(Boolean)
  }

  // Extract solution from pods
  if (queryResult.pods && Array.isArray(queryResult.pods)) {
    for (const pod of queryResult.pods) {
      // Main solution/result
      if (pod.id === "Solution" || pod.id === "Result" || pod.id === "DecimalApproximation") {
        if (pod.subpods && pod.subpods[0] && pod.subpods[0].plaintext) {
          result.solution = pod.subpods[0].plaintext
        }
      }

      // Step-by-step solutions
      if ((pod.title && pod.title.toLowerCase().includes("step")) || pod.id === "StepByStepSolution") {
        if (pod.subpods && Array.isArray(pod.subpods)) {
          for (const subpod of pod.subpods) {
            if (subpod.plaintext) {
              result.steps.push(subpod.plaintext)
            }
          }
        }
      }

      // Images and plots
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

  // If no solution found in specific pods, try to get from any pod
  if (!result.solution && queryResult.pods && Array.isArray(queryResult.pods)) {
    for (const pod of queryResult.pods) {
      if (pod.subpods && pod.subpods[0] && pod.subpods[0].plaintext) {
        result.solution = pod.subpods[0].plaintext
        break
      }
    }
  }

  // If still no solution, indicate no result
  if (!result.solution) {
    result.solution = "No solution found"
    result.warnings.push("Wolfram Alpha did not return a solution for this query")
  }

  // Determine problem type
  const queryLower = originalQuery.toLowerCase()
  if (queryLower.includes("integrate")) {
    result.type = "Integration"
  } else if (queryLower.includes("derivative")) {
    result.type = "Differentiation"
  } else if (queryLower.includes("solve")) {
    result.type = "Equation Solving"
  } else if (queryLower.includes("plot")) {
    result.type = "Plotting"
  } else if (queryLower.includes("factor")) {
    result.type = "Factorization"
  } else if (queryLower.includes("limit")) {
    result.type = "Limits"
  } else if (queryLower.match(/^\d+\s*[+\-*/]\s*\d+$/)) {
    result.type = "Arithmetic"
  }

  return result
}
