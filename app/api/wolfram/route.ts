import { type NextRequest, NextResponse } from "next/server"

const WOLFRAM_APP_ID = process.env.WOLFRAM_APP_ID

interface WolframResponse {
  queryresult: {
    success: boolean
    error?: boolean
    numpods: number
    datatypes?: string
    timedout?: string
    timedoutpods?: string
    timing?: number
    parsetiming?: number
    parsetimedout?: boolean
    recalculate?: string
    id?: string
    host?: string
    server?: string
    related?: string
    version?: string
    inputstring?: string
    pods?: Array<{
      title: string
      scanner: string
      id: string
      position: number
      error?: boolean
      numsubpods: number
      subpods: Array<{
        title: string
        img?: {
          src: string
          alt: string
          title: string
          width: number
          height: number
        }
        plaintext?: string
        mathml?: string
      }>
      states?: Array<{
        name: string
        input: string
      }>
      infos?: Array<{
        text: string
        img?: {
          src: string
          alt: string
          title: string
          width: number
          height: number
        }
      }>
    }>
    assumptions?: Array<{
      type: string
      word: string
      template: string
      count: number
      values: Array<{
        name: string
        desc: string
        input: string
      }>
    }>
    sources?: Array<{
      url: string
      text: string
    }>
    warnings?: Array<{
      text: string
      word: string
      suggestion: string
      delimiters: string
    }>
  }
}

function parseWolframResponse(data: WolframResponse, query: string, format: string) {
  const queryResult = data.queryresult

  if (!queryResult.success) {
    throw new Error("Wolfram Alpha could not process this query")
  }

  const pods = queryResult.pods || []
  const inputPod = pods.find((pod) => pod.id === "Input" || pod.title.toLowerCase().includes("input"))
  const solutionPods = pods.filter(
    (pod) =>
      pod.title.toLowerCase().includes("result") ||
      pod.title.toLowerCase().includes("solution") ||
      pod.title.toLowerCase().includes("answer") ||
      pod.id === "Result",
  )

  const stepsPods = pods.filter(
    (pod) =>
      pod.title.toLowerCase().includes("step") ||
      pod.title.toLowerCase().includes("solution") ||
      pod.scanner === "Solve",
  )

  const plotPods = pods.filter(
    (pod) =>
      pod.title.toLowerCase().includes("plot") || pod.title.toLowerCase().includes("graph") || pod.scanner === "Plot",
  )

  // Extract main solution
  let solution = "No solution found"
  const images: string[] = []
  const steps: string[] = []

  // Get the primary result
  if (solutionPods.length > 0) {
    const mainResult = solutionPods[0]
    if (mainResult.subpods && mainResult.subpods.length > 0) {
      solution = mainResult.subpods[0].plaintext || mainResult.subpods[0].img?.alt || "See image result"
      if (mainResult.subpods[0].img) {
        images.push(mainResult.subpods[0].img.src)
      }
    }
  }

  // Extract step-by-step solutions
  if (format === "step-by-step" && stepsPods.length > 0) {
    stepsPods.forEach((pod) => {
      if (pod.subpods) {
        pod.subpods.forEach((subpod) => {
          if (subpod.plaintext && subpod.plaintext.trim()) {
            steps.push(subpod.plaintext)
          }
        })
      }
    })
  }

  // Extract plots and images
  plotPods.forEach((pod) => {
    if (pod.subpods) {
      pod.subpods.forEach((subpod) => {
        if (subpod.img) {
          images.push(subpod.img.src)
        }
      })
    }
  })

  // Extract all other relevant images
  pods.forEach((pod) => {
    if (pod.subpods && !pod.title.toLowerCase().includes("input")) {
      pod.subpods.forEach((subpod) => {
        if (subpod.img && !images.includes(subpod.img.src)) {
          images.push(subpod.img.src)
        }
      })
    }
  })

  // Determine problem type
  let type = "Mathematical Problem"
  if (query.toLowerCase().includes("solve")) type = "Equation Solving"
  else if (query.toLowerCase().includes("integrate")) type = "Integration"
  else if (query.toLowerCase().includes("derivative")) type = "Differentiation"
  else if (query.toLowerCase().includes("limit")) type = "Limits"
  else if (query.toLowerCase().includes("plot")) type = "Graphing"
  else if (query.toLowerCase().includes("factor")) type = "Factoring"
  else if (query.toLowerCase().includes("matrix")) type = "Linear Algebra"

  // Extract assumptions
  const assumptions = queryResult.assumptions?.map((assumption) => `${assumption.word}: ${assumption.template}`) || []

  // Extract warnings
  const warnings = queryResult.warnings?.map((warning) => warning.text) || []

  return {
    input: query,
    solution,
    steps: steps.length > 0 ? steps : undefined,
    type,
    images: images.length > 0 ? images : undefined,
    assumptions: assumptions.length > 0 ? assumptions : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    success: true,
    queryresult: queryResult,
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!WOLFRAM_APP_ID) {
      return NextResponse.json({ error: "Wolfram Alpha API key not configured" }, { status: 500 })
    }

    const { query, format = "detailed", includesteps = false } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required and must be a string" }, { status: 400 })
    }

    // Build Wolfram Alpha API URL
    const params = new URLSearchParams({
      input: query,
      appid: WOLFRAM_APP_ID,
      output: "json",
      format: "plaintext,image",
      podstate: "Result__Step-by-step solution",
      scanner: "Solve,Simplify,Factor,Expand,Derivative,Integral,Plot,Limit",
    })

    if (includesteps) {
      params.append("podstate", "Result__Step-by-step solution")
      params.append("includepodid", "Solution")
    }

    const wolframUrl = `http://api.wolframalpha.com/v2/query?${params.toString()}`

    console.log("Calling Wolfram Alpha API:", wolframUrl.replace(WOLFRAM_APP_ID, "***"))

    const response = await fetch(wolframUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Math Calculator App",
      },
    })

    if (!response.ok) {
      throw new Error(`Wolfram Alpha API error: ${response.status} ${response.statusText}`)
    }

    const data: WolframResponse = await response.json()
    const result = parseWolframResponse(data, query, format)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calling Wolfram Alpha API:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Failed to process the mathematical query" }, { status: 500 })
  }
}
