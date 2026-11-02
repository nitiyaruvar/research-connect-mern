const User = require("../models/User");
const { escapeRegex, isValidId, paginationFrom } = require("../utils/query");

async function listResearchers(request, response) {
  const { page, limit, skip } = paginationFrom(request.query);
  const filter = {};
  const search = String(request.query.search || "").trim().slice(0, 100);
  const department = String(request.query.department || "").trim().slice(0, 120);
  const expertise = String(request.query.expertise || "").trim().slice(0, 80);

  if (search) {
    const expression = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { name: expression },
      { department: expression },
      { researchInterests: expression },
      { skills: expression },
      { institution: expression },
    ];
  }
  if (department) filter.department = new RegExp(`^${escapeRegex(department)}$`, "i");
  if (expertise) filter.$and = [...(filter.$and || []), { $or: [{ researchInterests: new RegExp(escapeRegex(expertise), "i") }, { skills: new RegExp(escapeRegex(expertise), "i") }] }];
  if (request.query.openToCollaboration === "true") filter.isOpenToCollaboration = true;

  const [researchers, total] = await Promise.all([
    User.find(filter)
      .select("name username role department institution bio researchInterests skills profilePicture website isOpenToCollaboration createdAt")
      .sort({ name: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  response.json({ data: researchers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

async function getResearcher(request, response) {
  if (!isValidId(request.params.id)) return response.status(400).json({ message: "Invalid researcher id" });
  const researcher = await User.findById(request.params.id)
    .select("name username role department institution bio researchInterests skills profilePicture website isOpenToCollaboration createdAt")
    .lean();
  if (!researcher) return response.status(404).json({ message: "Researcher not found" });
  response.json({ data: researcher });
}

module.exports = { getResearcher, listResearchers };
