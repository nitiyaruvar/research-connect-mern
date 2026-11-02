const mongoose = require("mongoose");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function paginationFrom(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 12));
  return { page, limit, skip: (page - 1) * limit };
}

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

module.exports = { escapeRegex, isValidId, paginationFrom };
