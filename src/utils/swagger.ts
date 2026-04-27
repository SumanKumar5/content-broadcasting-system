import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Content Broadcasting System API",
      version: "1.0.0",
      description:
        "A backend system for distributing educational content from teachers to students via a real-time broadcasting API.",
    },
    servers: [
      {
        url: "https://content-broadcasting-system-c3xf.onrender.com/api",
        description: "Production Server",
      },
      {
        url: "http://localhost:3000/api",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name: { type: "string", example: "Teacher One" },
            email: { type: "string", example: "teacher@school.com" },
            password: { type: "string", example: "password123" },
            role: { type: "string", enum: ["principal", "teacher"] },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "teacher@school.com" },
            password: { type: "string", example: "password123" },
          },
        },
        RejectInput: {
          type: "object",
          required: ["rejectionReason"],
          properties: {
            rejectionReason: {
              type: "string",
              example: "Content is not appropriate for students",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Success" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            total: { type: "integer", example: 100 },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            totalPages: { type: "integer", example: 10 },
          },
        },
      },
    },
    tags: [
      { name: "Health", description: "Server health check" },
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Content - Teacher", description: "Teacher content management" },
      {
        name: "Content - Principal",
        description: "Principal approval workflow",
      },
      {
        name: "Broadcasting",
        description: "Public broadcasting API for students",
      },
      {
        name: "Analytics",
        description: "Subject-wise analytics and usage tracking",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
