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
  };

  const queryResult = data.queryresult;
  if (!queryResult || !queryResult.pods) {
    result.solution = "No response from Wolfram Alpha";
    result.warnings.push("Invalid response structure");
    return result;
  }

  if (!queryResult.success) {
    result.solution = "Wolfram Alpha could not interpret the query";
    result.warnings.push("Query not understood");
    return result;
  }

  result.success = true;

  // Extract result pods
  for (const pod of queryResult.pods) {
    if (["Result", "Solution", "DecimalApproximation"].includes(pod.id)) {
      const sub = pod.subpods?.[0]?.plaintext;
      if (sub) result.solution = sub;
    }

    if ((pod.title?.toLowerCase().includes("step")) || pod.id === "StepByStepSolution") {
      pod.subpods?.forEach(sub => {
        if (sub.plaintext) result.steps.push(sub.plaintext);
      });
    }

    pod.subpods?.forEach(sub => {
      if (sub.img?.src) {
        if (pod.id === "Plot" || pod.title?.toLowerCase().includes("plot")) {
          result.plots.push(sub.img.src);
        } else {
          result.images.push(sub.img.src);
        }
      }
    });
  }

  if (!result.solution) {
    const fallback = queryResult.pods.find(p => p.subpods?.[0]?.plaintext);
    result.solution = fallback?.subpods?.[0]?.plaintext || "No solution found";
  }

  return result;
}
