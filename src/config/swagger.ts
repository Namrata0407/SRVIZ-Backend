import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sports Travel Packages API',
      version: '1.0.0',
      description: 'Backend API for Sports Travel Packages platform',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

