function profileStrings(value, field, max, required = false) {
  if (typeof value !== "string") {
    if (required) throw new Error(`${field} is required`);
    return undefined;
  }
  const normalized = value.trim();
  if (required && !normalized) throw new Error(`${field} is required`);
  if (normalized.length > max) throw new Error(`${field} must be ${max} characters or fewer`);
  return normalized;
}

function profileList(value, field) {
  if (!Array.isArray(value) || value.length > 20) throw new Error(`${field} must be a list with at most 20 items`);
  return [...new Set(value.map((item) => {
    const normalized = profileStrings(item, field, 60, true);
    if (!normalized) throw new Error(`${field} items cannot be empty`);
    return normalized;
  }))];
}

function validateProfileUpdate(request, response, next) {
  try {
    const body = request.body || {};
    const input = {};
    for (const [field, max, required] of [
      ["name", 100, true],
      ["department", 120, false],
      ["institution", 160, false],
      ["bio", 1200, false],
    ]) {
      if (Object.hasOwn(body, field)) input[field] = profileStrings(body[field], field, max, required);
    }
    if (Object.hasOwn(body, "researchInterests")) input.researchInterests = profileList(body.researchInterests, "Research interests");
    if (Object.hasOwn(body, "skills")) input.skills = profileList(body.skills, "Skills");
    if (Object.hasOwn(body, "isOpenToCollaboration")) {
      if (typeof body.isOpenToCollaboration !== "boolean") throw new Error("isOpenToCollaboration must be true or false");
      input.isOpenToCollaboration = body.isOpenToCollaboration;
    }
    if (Object.hasOwn(body, "website")) {
      const website = profileStrings(body.website, "Website", 300) || "";
      if (website) {
        const url = new URL(website);
        if (url.protocol !== "https:") throw new Error("Website must use HTTPS");
      }
      input.website = website;
    }
    if (Object.hasOwn(body, "profilePicture")) {
      const profilePicture = profileStrings(body.profilePicture, "Profile picture", 500) || "";
      if (profilePicture && !profilePicture.startsWith("/uploads/")) {
        const url = new URL(profilePicture);
        if (url.protocol !== "https:") throw new Error("Profile picture must be an uploaded file or an HTTPS URL");
      }
      input.profilePicture = profilePicture;
    }
    if (Object.keys(input).length === 0) throw new Error("Provide at least one profile field to update");
    request.validatedBody = input;
    return next();
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
}

module.exports = { validateProfileUpdate };
