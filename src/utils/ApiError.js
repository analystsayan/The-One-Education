/**
 * An error with an HTTP status attached.
 * Throw these from services; the error middleware turns them into responses.
 */
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.isApiError = true;
  }
  static badRequest(msg)  { return new ApiError(400, msg); }
  static notFound(msg)    { return new ApiError(404, msg); }
  static rateLimited(msg) { return new ApiError(429, msg); }
  static upstream(msg)    { return new ApiError(502, msg); }
  static internal(msg)    { return new ApiError(500, msg); }
}
module.exports = ApiError;
