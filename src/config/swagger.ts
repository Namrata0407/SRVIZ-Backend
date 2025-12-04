import swaggerJsdoc from 'swagger-jsdoc';

const options = {
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
    tags: [
      { name: 'Events', description: 'Event management endpoints' },
      { name: 'Leads', description: 'Lead management endpoints' },
      { name: 'Quotes', description: 'Quote generation endpoints' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

