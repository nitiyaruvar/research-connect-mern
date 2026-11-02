const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const { getAIRecommendations, getOverlapRecommendations } = require("../services/recommendationService");

async function recommendCollaborators(request, response) {
  const projectId = String(request.body?.projectId || "");
  if (!mongoose.isValidObjectId(projectId)) return response.status(400).json({ message: "A valid projectId is required" });
  const project = await Project.findById(projectId).lean();
  if (!project) return response.status(404).json({ message: "Project not found" });

  const candidates = await User.find({
    _id: { $nin: [request.user.id, project.owner, ...(project.collaborators || [])] },
    isOpenToCollaboration: true,
  })
    .select("name role department institution researchInterests skills profilePicture")
    .limit(50)
    .lean();
  const overlapMatches = getOverlapRecommendations(project, candidates);
  let rankedMatches = overlapMatches;
  let method = "keyword-overlap";
  let notice = "";

  if (request.body?.allowAI === true && candidates.length === 0) {
    notice = "There are no eligible researchers to recommend yet.";
  } else if (request.body?.allowAI === true && process.env.AI_API_KEY) {
    try {
      const aiMatches = await getAIRecommendations(project, candidates);
      if (aiMatches.length) {
        rankedMatches = aiMatches;
        method = "openai";
      } else {
        notice = "AI found no close matches, so keyword matching was used.";
      }
    } catch {
      notice = "AI recommendations were unavailable, so keyword matching was used.";
    }
  } else if (request.body?.allowAI === true) {
    notice = "AI is not configured, so keyword matching was used.";
  }

  const candidateById = new Map(candidates.map((candidate) => [String(candidate._id), candidate]));
  const data = rankedMatches.flatMap((match) => {
    const researcher = candidateById.get(match.candidateId);
    if (!researcher) return [];
    return [{ researcher, score: match.score, reason: match.reason }];
  });

  response.json({ data, method, notice });
}

module.exports = { recommendCollaborators };
