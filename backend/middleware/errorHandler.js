function notFound(_request, response) {
  response.status(404).json({ message: "Route not found" });
}

function errorHandler(error, _request, response, _next) {
  if (response.headersSent) return;
  const status = error.name === "ValidationError" ? 400
    : error.name === "CastError" ? 400
      : error.code === 11000 ? 409
        : Number(error.statusCode || error.status) || 500;
  const message = status >= 500 ? "Something went wrong. Please try again." : error.message;
  response.status(status).json({ message });
}

module.exports = { errorHandler, notFound };
