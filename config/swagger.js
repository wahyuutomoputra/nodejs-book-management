const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VLink API Documentation',
      version: '1.0.0',
      description: 'API Documentation untuk VLink Authentication & Authorization System',
      contact: {
        name: 'API Support',
        email: 'support@vlink.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server'
      },
      {
        url: 'https://api.vlink.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan JWT token yang didapat dari endpoint /api/auth/login'
        }
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'customer@example.com',
              description: 'Email user'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
              description: 'Password user'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login berhasil'
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                expiresAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-01T12:00:00.000Z'
                },
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 1
                    },
                    email: {
                      type: 'string',
                      example: 'customer@example.com'
                    },
                    name: {
                      type: 'string',
                      example: 'John Doe'
                    },
                    role: {
                      type: 'string',
                      enum: ['customer', 'admin'],
                      example: 'customer'
                    }
                  }
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              example: 'customer'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        ProfileResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        LogoutResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Logout berhasil'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error message'
            }
          }
        },
        UnauthorizedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Access token tidak ditemukan'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints untuk authentication dan authorization'
      },
      {
        name: 'Books',
        description: 'Endpoints untuk melihat list dan detail buku (Customer)'
      },
      {
        name: 'Cart',
        description: 'Endpoints untuk mengelola keranjang belanja (Customer)'
      },
      {
        name: 'Orders',
        description: 'Endpoints untuk order dan checkout (Customer)'
      },
      {
        name: 'Payments',
        description: 'Endpoints untuk payment dan callback'
      },
      {
        name: 'Admin',
        description: 'Endpoints untuk admin - mengelola buku, transaksi, dan laporan'
      },
      'Protected Routes'
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

