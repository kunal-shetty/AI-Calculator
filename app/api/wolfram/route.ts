import { type NextRequest, NextResponse } from "next/server"

const WOLFRAM_APP_ID = process.env.WOLFRAM_ALPHA_API_KEY

interface WolframPod {
  title: string
  plaintext?: string
  subpods?: Array<{
    title?: string
    plaintext?: string
  }>
}

interface WolframResponse {
  queryresult: {
    success: boolean
    error?: boolean
    numpods?: number
    pods?: WolframPod[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    if (!WOLFRAM_APP_ID) {
      return NextResponse.json({ error: "Wolfram Alpha API key not configured" }, { status: 500 })
    }

    console.log("Querying Wolfram Alpha:", query)

    // Multiple fallback strategies
    const strategies = [
      // Strategy 1: Full query with step-by-step
      `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&format=plaintext&output=JSON&appid=${WOLFRAM_APP_ID}&podstate=Step-by-step%20solution&includepodid=Solution,Result,StepByStepSolution,Input`,

      // Strategy 2: Simplified query
      `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&format=plaintext&output=JSON&appid=${WOLFRAM_APP_ID}&includepodid=Solution,Result,Input`,

      // Strategy 3: Basic query
      `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&format=plaintext&output=JSON&appid=${WOLFRAM_APP_ID}`,
    ]

    let lastError = null

    for (const [index, url] of strategies.entries()) {
      try {
        console.log(`Trying strategy ${index + 1}:`, url)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "User-Agent": "MathCalculator/1.0",
          },
          timeout: 10000,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: WolframResponse = await response.json()
        console.log("Wolfram response:", JSON.stringify(data, null, 2))

        if (data.queryresult?.success && data.queryresult?.pods) {
          const pods = data.queryresult.pods

          // Filter and process relevant pods
          const relevantPods = pods.filter((pod) => {
            const title = pod.title?.toLowerCase() || ""
            return (
              title.includes("result") ||
              title.includes("solution") ||
              title.includes("step") ||
              title.includes("answer") ||
              title.includes("decimal") ||
              title.includes("exact")
            )
          })

          if (relevantPods.length > 0) {
            const result =
              relevantPods[0]?.plaintext ||
              relevantPods[0]?.subpods?.[0]?.plaintext ||
              "Solution found but could not extract result"

            const steps = relevantPods
              .filter((pod) => pod.title?.toLowerCase().includes("step"))
              .map((pod) => ({
                step: pod.title || "Step",
                explanation: pod.plaintext || pod.subpods?.[0]?.plaintext || "No explanation available",
              }))

            return NextResponse.json({
              result,
              steps: steps.length > 0 ? steps : undefined,
              source: "wolfram",
              strategy: index + 1,
            })
          }

          // Fallback: use any available pod
          const firstPod = pods.find((pod) => pod.plaintext || pod.subpods?.[0]?.plaintext)
          if (firstPod) {
            const result = firstPod.plaintext || firstPod.subpods?.[0]?.plaintext || "No result available"
            return NextResponse.json({
              result,
              source: "wolfram",
              strategy: index + 1,
            })
          }
        }

        lastError = new Error(
          `Strategy ${index + 1} failed: ${data.queryresult?.success ? "No relevant pods found" : "Query unsuccessful"}`,
        )
      } catch (error) {
        console.error(`Strategy ${index + 1} error:`, error)
        lastError = error
        continue
      }
    }

    // All strategies failed
    throw lastError || new Error("All Wolfram Alpha strategies failed")
  } catch (error) {
    console.error("Wolfram Alpha API error:", error)
    return NextResponse.json(
      {
        error: "Failed to solve problem with Wolfram Alpha",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
