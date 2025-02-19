import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { Express } from 'express';
import { env } from './env';

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie Viewer API',
      version: '1.0.0',
      description: '電影評論平台 API 文檔'
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: '開發環境'
      },
      {
        url: 'https://movie-viewer.up.railway.app',
        description: '生產環境'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',  // API 路由定義
    './src/docs/*.ts'     // Swagger 元件定義
  ]
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  // Swagger UI 選項
  const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',  // 隱藏頂部橫條
    customSiteTitle: 'Movie Viewer API 文檔'
  };

  // 提供 swagger.json
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // 設置 Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
};