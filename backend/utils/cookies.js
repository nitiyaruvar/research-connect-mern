function getCookie(header = "", name) {
  const prefix = `${name}=`;
  const item = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  if (!item) return "";
  try {
    return decodeURIComponent(item.slice(prefix.length));
  } catch {
    return "";
  }
}

function serializeCookie(name, value, { maxAge, path = "/", httpOnly = true } = {}) {
  const sameSite = process.env.NODE_ENV === "production" ? "None" : "Lax";
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`];
  if (httpOnly) parts.push("HttpOnly");
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

module.exports = { getCookie, serializeCookie };
