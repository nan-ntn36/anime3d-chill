/**
 * Request ID Middleware
 * Gắn UUID cho mỗi request để tracing
 */

const { v4: uuidv4 } = require('uuid');

function requestId(req, res, next) {
  // Ưu tiên X-Request-Id từ client/proxy (nếu có), fallback tạo mới
  const id = req.headers['x-request-id'] || uuidv4();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

module.exports = requestId;
