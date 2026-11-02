const { getAIRecommendations, getOverlapRecommendations } = require("../services/recommendationService");

describe("collaborator recommendation service", () => {
  test("local matching ranks candidates with shared research terms", () => {
    const project = { title: "Urban climate resilience", summary: "Map local heat risk", researchAreas: ["climate science"], keywords: ["urban heat"] };
    const candidates = [
      { _id: "1", department: "Computer Science", researchInterests: ["robotics"], skills: [] },
      { _id: "2", department: "Climate Science", researchInterests: ["urban heat", "resilience"], skills: ["mapping"] },
    ];
    const results = getOverlapRecommendations(project, candidates);
    expect(results).toHaveLength(1);
    expect(results[0].candidateId).toBe("2");
    expect(results[0].reason).toContain("Shared research terms");
  });

  test("AI ranking requires a server-side key", async () => {
    const originalKey = process.env.AI_API_KEY;
    delete process.env.AI_API_KEY;
    await expect(getAIRecommendations({}, [])).rejects.toThrow("AI API key is not configured");
    if (originalKey !== undefined) process.env.AI_API_KEY = originalKey;
  });
});
