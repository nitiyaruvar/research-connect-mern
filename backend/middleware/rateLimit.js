function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 10, message = "Too many attempts. Try again later." } = {}) {
  const attempts = new Map();

  return function rateLimit(request, response, next) {
    const now = Date.now();
    const key = request.ip || request.socket.remoteAddress || "unknown";
    let entry = attempts.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      attempts.set(key, entry);
    }
    entry.count += 1;

    if (attempts.size > 10000) {
      for (const [address, value] of attempts) {
        if (value.resetAt <= now) attempts.delete(address);
      }
    }

    response.setHeader("RateLimit-Limit", String(max));
    response.setHeader("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    response.setHeader("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
    if (entry.count > max) {
      response.setHeader("Retry-After", String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
      return response.status(429).json({ message });
    }
    return next();
  };
}

module.exports = { createRateLimiter };
