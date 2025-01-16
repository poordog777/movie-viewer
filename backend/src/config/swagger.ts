import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Movie Viewer API',
    version: '1.0.0',
    description: '電影評論平台 API 文檔'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '開發環境'
    }
  ]
};

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}; 