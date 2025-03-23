import { PORT } from "./env";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Poke Market API",
      version: "1.0.0",
      description: "Documentation for the Poke Market API",
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./src/types/*.d.ts",
    "./src/errors/**/*.ts",
    "./src/controllers/api/**/*.ts",
    "./src/routes/api/**/*.ts",
    "./src/models/**/*.ts",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec };
