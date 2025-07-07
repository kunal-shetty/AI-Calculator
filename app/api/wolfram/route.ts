import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  let requestBody: any = {}

  try {
    requestBody = await request.json()
  } catch (parseError) {
    console.error("Failed to parse request body:", parseError)
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
  }

  const { query } = requestBody

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Query is required" }, { status: 400 })
  }

  const apiKey = process.env.WOLFRAM_ALPHA_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Wolfram Alpha API key not configured. Please add WOLFRAM_ALPHA_API_KEY to your environment variables.",
      },
      { status: 500 },
    )
  }

  try {
    console.log("Making request to Wolfram Alpha API for query:", query)

    // Use HTTPS instead of HTTP for better reliability
    const wolframUrl = `https://api.wolframalpha.com/v2/query`
    const params = new URLSearchParams({
      input: query,
      format: "plaintext,image",
      output: "JSON",
      appid: apiKey,
      includepodid: "Solution,Result,DecimalApproximation,ExactResult,Input,AlternateForm,Value,StepByStepSolution",
      excludepodid: "Interpretation",
      podtimeout: "20",
      scantimeout: "20",
      parsetimeout: "20",
      totaltimeout: "30",
      async: "false",
    })

    const response = await fetch(`${wolframUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        "User-Agent": "Math Calculator App/2.0",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      timeout: 30000, // 30 second timeout
    })

    if (!response.ok) {
      console.error("Wolfram Alpha API error:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)

      return NextResponse.json(
        {
          error: `Wolfram Alpha API error: ${response.status} - ${response.statusText}. Please check your API key and try again.`,
        },
        { status: response.status },
      )
    }

    const responseText = await response.text()
    console.log("Wolfram Alpha response received, length:", responseText.length)

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch (jsonError) {
      console.error("Failed to parse Wolfram Alpha JSON response:", jsonError)
      console.log("Response text preview:", responseText.substring(0, 1000))
      return NextResponse.json(
        {
          error: "Invalid response format from Wolfram Alpha. The service may be temporarily unavailable.",
        },
        { status: 502 },
      )
    }

    if (!data.queryresult) {
      console.error("No queryresult in response")
      return NextResponse.json(
        {
          error: "Invalid response structure from Wolfram Alpha",
        },
        { status: 502 },
      )
    }

    const queryResult = data.queryresult

    if (!queryResult.success) {
      console.error("Wolfram Alpha query failed:", queryResult)

      let errorMessage = "Wolfram Alpha could not understand the query"

      if (queryResult.tips && queryResult.tips.text) {
        errorMessage += `. Tip: ${queryResult.tips.text}`
      }

      if (queryResult.didyoumeans && queryResult.didyoumeans.length > 0) {
        const suggestion = queryResult.didyoumeans[0]
        if (suggestion.val) {
          errorMessage += `. Did you mean: "${suggestion.val}"?`
        }
      }

      if (queryResult.futuretopic) {
        errorMessage += `. This topic may be available in future versions.`
      }

      return NextResponse.json(
        {
          error: errorMessage,
          suggestions: queryResult.didyoumeans?.map((d: any) => d.val).filter(Boolean) || [],
        },
        { status: 400 },
      )
    }

    const pods = queryResult.pods || []
    console.log(
      `Found ${pods.length} pods:`,
      pods.map((p: any) => p.title || p.id),
    )

    // Extract solution from various pod types with better priority
    let solution = ""
    const steps: string[] = []
    const assumptions: string[] = []
    const warnings: string[] = []
    const images: string[] = []

    // Enhanced priority order for solution extraction
    const solutionPodIds = [
      "Solution",
      "Result",
      "DecimalApproximation",
      "ExactResult",
      "Value",
      "AlternateForm",
      "Decimal form",
      "Exact result",
      "Possible intermediate steps",
    ]

    // First, try to find solution in priority pods
    for (const podId of solutionPodIds) {
      const pod = pods.find(
        (p: any) =>
          p.id === podId || (p.title && (p.title.toLowerCase().includes(podId.toLowerCase()) || p.title === podId)),
      )

      if (pod && pod.subpods && pod.subpods[0] && pod.subpods[0].plaintext) {
        const text = pod.subpods[0].plaintext.trim()
        if (text && text.length > 0 && text !== query) {
          solution = text
          console.log(`Found solution in ${pod.title || podId} pod:`, solution)
          break
        }
      }
    }

    // If no solution found, try any non-input pod with meaningful content
    if (!solution) {
      for (const pod of pods) {
        if (pod.id !== "Input" && pod.title !== "Input" && pod.subpods && pod.subpods[0] && pod.subpods[0].plaintext) {
          const text = pod.subpods[0].plaintext.trim()
          if (
            text &&
            text !== query &&
            !text.includes("Wolfram|Alpha") &&
            text.length > 0 &&
            !text.toLowerCase().includes("input interpretation")
          ) {
            solution = text
            console.log(`Found solution in ${pod.title || pod.id} pod:`, solution)
            break
          }
        }
      }
    }

    // Extract step-by-step solutions with better filtering
    const stepPods = pods.filter((pod: any) => {
      if (!pod.title) return false
      const title = pod.title.toLowerCase()
      return (
        title.includes("step") ||
        title.includes("solution") ||
        title.includes("method") ||
        title.includes("process") ||
        title.includes("intermediate") ||
        title.includes("calculation")
      )
    })

    for (const pod of stepPods) {
      if (pod.subpods) {
        for (const subpod of pod.subpods) {
          if (subpod.plaintext && subpod.plaintext.trim()) {
            const stepText = subpod.plaintext.trim()
            if (stepText.length > 0 && !steps.includes(stepText)) {
              steps.push(stepText)
            }
          }
        }
      }
    }

    // Extract assumptions with better parsing
    if (queryResult.assumptions && Array.isArray(queryResult.assumptions)) {
      for (const assumption of queryResult.assumptions) {
        try {
          if (assumption.template && assumption.values && assumption.values[0]) {
            const template = assumption.template
            const value = assumption.values[0]
            if (value.desc) {
              assumptions.push(`${template.replace(/\$\{.*?\}/g, value.desc)}`)
            }
          } else if (assumption.text) {
            assumptions.push(assumption.text)
          } else if (assumption.word && assumption.desc) {
            assumptions.push(`${assumption.word}: ${assumption.desc}`)
          }
        } catch (e) {
          console.warn("Error parsing assumption:", e)
        }
      }
    }

    // Extract warnings
    if (queryResult.warnings && Array.isArray(queryResult.warnings)) {
      for (const warning of queryResult.warnings) {
        if (warning.text) {
          warnings.push(warning.text)
        }
      }
    }

    // Extract images with better filtering
    for (const pod of pods) {
      if (pod.subpods) {
        for (const subpod of pod.subpods) {
          if (subpod.img && subpod.img.src) {
            // Only include relevant images (plots, graphs, etc.)
            const imgSrc = subpod.img.src
            if (imgSrc.includes("plot") || imgSrc.includes("graph") || pod.title?.toLowerCase().includes("plot")) {
              images.push(imgSrc)
            }
          }
        }
      }
    }

    // If still no solution found, provide helpful error
    if (!solution) {
      console.log("No solution found in any pod")

      // Check if there's any meaningful content at all
      const hasContent = pods.some(
        (pod) => pod.subpods && pod.subpods.some((sub: any) => sub.plaintext && sub.plaintext.trim().length > 0),
      )

      if (!hasContent) {
        return NextResponse.json(
          {
            error: "Wolfram Alpha could not process this query. Please try rephrasing your mathematical expression.",
            suggestions: [
              "Try using standard mathematical notation (e.g., x^2 instead of x²)",
              "Be more specific with your query",
              "Check for typos in variable names or functions",
            ],
          },
          { status: 404 },
        )
      } else {
        return NextResponse.json(
          {
            error: "No clear solution found, but Wolfram Alpha returned some data. Try rephrasing your query.",
          },
          { status: 404 },
        )
      }
    }

    // Determine problem type with better classification
    const queryLower = query.toLowerCase()
    let type = "Mathematical"

    if (queryLower.includes("integrate") || queryLower.includes("integral")) {
      type = "Integration"
    } else if (
      queryLower.includes("derivative") ||
      queryLower.includes("differentiate") ||
      queryLower.includes("d/dx")
    ) {
      type = "Differentiation"
    } else if (queryLower.includes("solve") && queryLower.includes("=")) {
      type = "Equation Solving"
    } else if (queryLower.includes("plot") || queryLower.includes("graph")) {
      type = "Plotting"
    } else if (queryLower.includes("factor")) {
      type = "Factorization"
    } else if (queryLower.includes("limit")) {
      type = "Limits"
    } else if (queryLower.match(/^\s*\d+\s*[+\-*/^]\s*\d+\s*$/)) {
      type = "Arithmetic"
    } else if (queryLower.includes("expand")) {
      type = "Expansion"
    } else if (queryLower.includes("simplify")) {
      type = "Simplification"
    } else if (queryLower.includes("matrix")) {
      type = "Linear Algebra"
    } else if (queryLower.includes("sum") || queryLower.includes("series")) {
      type = "Series & Sums"
    }

    const result = {
      input: query,
      solution: solution,
      steps: steps.length > 0 ? steps : undefined,
      type: type,
      assumptions: assumptions.length > 0 ? assumptions : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      images: images.length > 0 ? images : undefined,
      success: true,
      queryresult: queryResult,
    }

    console.log("Returning successful result:", {
      solution: solution.substring(0, 100) + (solution.length > 100 ? "..." : ""),
      stepsCount: steps.length,
      type: type,
      hasImages: images.length > 0,
      hasAssumptions: assumptions.length > 0,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("API route error:", error)

    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error:
            "Network error: Unable to connect to Wolfram Alpha. Please check your internet connection and try again.",
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error occurred while processing your request. Please try again in a moment.",
      },
      { status: 500 },
    )
  }
}
