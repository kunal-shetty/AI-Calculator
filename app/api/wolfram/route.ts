import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const appId = process.env.WOLFRAM_APP_ID;

    if (!appId) {
      return NextResponse.json({ error: "Missing Wolfram App ID in environment variables" }, { status: 500 });
    }

    const encodedQuery = encodeURIComponent(query);
    const baseUrl = "https://api.wolframalpha.com/v2/query";

    const url = `${baseUrl}?appid=${appId}&input=${encodedQuery}&output=json&format=plaintext,image&includepodid=Solution,Result,DecimalApproximation,Plot,StepByStepSolution,Input,AlternateForm&podstate=Step-by-step solution&scantimeout=10&podtimeout=10&formattimeout=10&parsetimeout=10`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "NextJS-Math-Calculator/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Wolfram API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = parseWolframResponse(data, query);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Wolfram Alpha API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    );
  }
}
