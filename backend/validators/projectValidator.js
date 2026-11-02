const ALLOWED_STATUSES = new Set(["seeking-collaborators", "active", "completed"]);

function cleanString(value, field, { required = false, max = 160 } = {}) {
  if (typeof value !== "string") {
    if (required) throw new Error(`${field} is required`);
    return undefined;
  }
  const normalized = value.trim();
  if (required && !normalized) throw new Error(`${field} is required`);
  if (normalized.length > max) throw new Error(`${field} must be ${max} characters or fewer`);
  return normalized;
}

function cleanStringList(value, field, maxItems = 12) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > maxItems) throw new Error(`${field} must be a list with at most ${maxItems} items`);
  return [...new Set(value.map((item) => cleanString(item, field, { required: true, max: 60 })))];
}

function validateProjectInput(request, response, next) {
  try {
    const body = request.body || {};
    const input = {
      title: cleanString(body.title, "Title", { required: true, max: 160 }),
      summary: cleanString(body.summary, "Summary", { required: true, max: 320 }),
      description: cleanString(body.description, "Description", { required: true, max: 8000 }),
      department: cleanString(body.department, "Department", { max: 120 }),
      researchAreas: cleanStringList(body.researchAreas, "Research areas"),
      keywords: cleanStringList(body.keywords, "Keywords"),
    };
    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.has(body.status)) throw new Error("Status is not supported");
      input.status = body.status;
    }
    if (body.startDate) {
      const startDate = new Date(body.startDate);
      if (Number.isNaN(startDate.valueOf())) throw new Error("Start date is invalid");
      input.startDate = startDate;
    }
    if (body.endDate) {
      const endDate = new Date(body.endDate);
      if (Number.isNaN(endDate.valueOf())) throw new Error("End date is invalid");
      if (input.startDate && endDate < input.startDate) throw new Error("End date cannot be before start date");
      input.endDate = endDate;
    }
    request.validatedBody = input;
    next();
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
}

function validateProjectUpdate(request, response, next) {
  try {
    const body = request.body || {};
    const input = {};
    for (const [field, max] of [["title", 160], ["summary", 320], ["description", 8000], ["department", 120]]) {
      if (Object.hasOwn(body, field)) input[field] = cleanString(body[field], field, { required: true, max });
    }
    for (const [field, label] of [["researchAreas", "Research areas"], ["keywords", "Keywords"]]) {
      if (Object.hasOwn(body, field)) input[field] = cleanStringList(body[field], label);
    }
    if (Object.hasOwn(body, "status")) {
      if (!ALLOWED_STATUSES.has(body.status)) throw new Error("Status is not supported");
      input.status = body.status;
    }
    for (const field of ["startDate", "endDate"]) {
      if (!Object.hasOwn(body, field)) continue;
      if (body[field] === null || body[field] === "") {
        input[field] = null;
        continue;
      }
      const date = new Date(body[field]);
      if (Number.isNaN(date.valueOf())) throw new Error(`${field} is invalid`);
      input[field] = date;
    }
    if (Object.keys(input).length === 0) throw new Error("Provide at least one field to update");
    request.validatedBody = input;
    next();
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
}

module.exports = { validateProjectInput, validateProjectUpdate };
