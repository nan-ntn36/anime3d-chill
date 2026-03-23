/**
 * Response Helpers
 * Chuẩn hóa format response cho toàn bộ API
 */

/**
 * Gửi response thành công
 * @param {import('express').Response} res
 * @param {*} data - response data
 * @param {object} [meta] - pagination, extra info
 * @param {number} [statusCode=200]
 */
function sendSuccess(res, data, meta = null, statusCode = 200) {
  const response = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

/**
 * Gửi response lỗi
 * @param {import('express').Response} res
 * @param {string} message - error message
 * @param {string} [code='INTERNAL_ERROR'] - error code
 * @param {number} [statusCode=500]
 * @param {Array} [errors] - validation errors detail
 */
function sendError(res, message, code = 'INTERNAL_ERROR', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
    code,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

module.exports = { sendSuccess, sendError };
