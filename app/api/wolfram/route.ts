import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const apiKey = process.env.WOLFRAM_ALPHA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Wolfram Alpha API key not configured" }, { status: 500 })
    }

    console.log("Processing query:", query)

    // Use the Full Results API for better parsing
    const url = `https://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&format=plaintext&output=JSON&appid=${apiKey}&includepodid=Result,Solution,DecimalApproximation,ExactResult,NumericResult&excludepodid=Input`

    console.log("Fetching from Wolfram Alpha...")

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Math Calculator App/1.0",
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      console.error("Wolfram Alpha API error:", response.status, response.statusText)
      return NextResponse.json(
        { error: `Wolfram Alpha API error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Raw Wolfram Alpha response:", JSON.stringify(data, null, 2))

    if (!data.queryresult) {
      return NextResponse.json({ error: "Invalid response from Wolfram Alpha" }, { status: 500 })
    }

    const queryResult = data.queryresult

    if (!queryResult.success) {
      const suggestions = queryResult.tips || queryResult.didyoumeans || []
      return NextResponse.json(
        {
          error: "Wolfram Alpha could not interpret the query",
          suggestions: suggestions.slice(0, 3),
          queryresult: queryResult,
        },
        { status: 400 },
      )
    }

    if (!queryResult.pods || queryResult.pods.length === 0) {
      return NextResponse.json(
        {
          error: "No results found for this query",
          queryresult: queryResult,
        },
        { status: 404 },
      )
    }

    console.log(
      "Available pods:",
      queryResult.pods.map((pod: any) => ({ id: pod.id, title: pod.title })),
    )

    // Find the best result pod
    let resultPod = null
    let solutionText = ""
    let steps: string[] = []
    let assumptions: string[] = []
    let warnings: string[] = []
    const images: string[] = []

    // Priority order for result pods
    const resultPodIds = ["Result", "Solution", "DecimalApproximation", "ExactResult", "NumericResult"]

    for (const podId of resultPodIds) {
      resultPod = queryResult.pods.find((pod: any) => pod.id === podId)
      if (resultPod) {
        console.log(`Found result pod: ${podId}`)
        break
      }
    }

    // If no specific result pod found, look for pods with "result" or "solution" in title
    if (!resultPod) {
      resultPod = queryResult.pods.find(
        (pod: any) =>
          pod.title &&
          (pod.title.toLowerCase().includes("result") ||
            pod.title.toLowerCase().includes("solution") ||
            pod.title.toLowerCase().includes("answer")),
      )
      if (resultPod) {
        console.log(`Found result pod by title: ${resultPod.title}`)
      }
    }

    // Extract solution text
    if (resultPod && resultPod.subpods && resultPod.subpods.length > 0) {
      const subpod = resultPod.subpods[0]
      if (subpod.plaintext) {
        solutionText = subpod.plaintext.trim()
      } else if (subpod.img && subpod.img.src) {
        images.push(subpod.img.src)
        solutionText = subpod.img.alt || "See image result"
      }
    }

    // Look for step-by-step solutions
    const stepsPod = queryResult.pods.find(
      (pod: any) =>
        pod.id === "StepByStepSolution" ||
        pod.title?.toLowerCase().includes("step") ||
        pod.title?.toLowerCase().includes("solution"),
    )

    if (stepsPod && stepsPod.subpods) {
      steps = stepsPod.subpods
        .map((subpod: any) => subpod.plaintext)
        .filter((text: string) => text && text.trim())
        .map((text: string) => text.trim())
    }

    // Extract assumptions
    if (queryResult.assumptions) {
      assumptions = queryResult.assumptions.map(
        (assumption: any) => assumption.text || assumption.desc || "Mathematical assumption applied",
      )
    }

    // Extract warnings
    if (queryResult.warnings) {
      warnings = queryResult.warnings.map((warning: any) => warning.text || "Calculation warning")
    }

    // Collect all images
    queryResult.pods.forEach((pod: any) => {
      if (pod.subpods) {
        pod.subpods.forEach((subpod: any) => {
          if (subpod.img && subpod.img.src) {
            images.push(subpod.img.src)
          }
        })
      }
    })

    // If no solution found, use the first available pod
    if (!solutionText && queryResult.pods.length > 1) {
      const firstResultPod = queryResult.pods[1] // Skip input pod
      if (firstResultPod && firstResultPod.subpods && firstResultPod.subpods[0]) {
        solutionText = firstResultPod.subpods[0].plaintext || "Result available in image"
      }
    }

    if (!solutionText) {
      return NextResponse.json(
        {
          error: "Could not extract a readable solution from Wolfram Alpha",
          queryresult: queryResult,
        },
        { status: 404 },
      )
    }

    const result = {
      input: query,
      solution: solutionText,
      steps: steps.length > 0 ? steps : undefined,
      type: resultPod?.title || "Mathematical Result",
      assumptions: assumptions.length > 0 ? assumptions : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      images: images.length > 0 ? images.slice(0, 3) : undefined, // Limit to 3 images
      success: true,
      queryresult: queryResult,
    }

    console.log("Processed result:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Wolfram Alpha API error:", error)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout - Wolfram Alpha took too long to respond" }, { status: 408 })
      }
      if (error.message.includes("fetch")) {
        return NextResponse.json({ error: "Network error - Could not connect to Wolfram Alpha" }, { status: 503 })
      }
    }

    return NextResponse.json({ error: "Internal server error while processing your request" }, { status: 500 })
  }
}
