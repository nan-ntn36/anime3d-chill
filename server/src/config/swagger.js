const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Anime3D-Chill API',
      version: '1.0.0',
      description: 'API documentation cho website xem phim Anime3D-Chill',
      contact: {
        name: 'Anime3D-Chill Team',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Server root',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'Refresh token trong HttpOnly cookie',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 100 },
            totalItems: { type: 'integer', example: 2000 },
            itemsPerPage: { type: 'integer', example: 20 },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Xác thực & phân quyền' },
      { name: 'Movies', description: 'Proxy API phim từ phimapi.com (KKPhim)' },
      { name: 'Me', description: 'Hồ sơ, yêu thích, lịch sử xem' },
      { name: 'Admin', description: 'Quản trị (chỉ admin)' },
    ],
  },
  apis: ['./src/routes/**/*.js', './src/index.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
