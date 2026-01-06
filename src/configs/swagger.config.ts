import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Placement Tool API',
      version: '1.0.0',
      description: 'Complete API documentation for Placement Tool Backend',
      contact: {
        name: 'API Support',
        email: 'support@placementtool.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development Server'
      },
      {
        url: 'https://api.placementtool.com/api',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            loginID: { type: 'string' },
            roleID: { type: 'integer' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Student: {
          type: 'object',
          properties: {
            student_id: { type: 'integer' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            dob: { type: 'string', format: 'date' },
            gender: { type: 'string' },
            nationality: { type: 'string' },
            student_type: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['loginID', 'password'],
          properties: {
            loginID: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'test123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string' },
            expiresIn: { type: 'integer' },
            tokenType: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [] as any
      }
    ]
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
