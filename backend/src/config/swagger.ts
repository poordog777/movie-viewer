import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { Express } from 'express';
import { env } from './env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Movie Viewer API',
    version: '1.0.0',
    description: '電影評論平台 API 文檔'
  },
  servers: [
    {
      url: `http://localhost:${env.port}/api/v1`,
      description: '開發環境'
    }
  ],
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['error', 'fail'],
            example: 'error'
          },
          message: {
            type: 'string',
            example: '伺服器內部錯誤'
          }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success', 'error', 'fail'],
            example: 'success'
          },
          message: {
            type: 'string',
            example: '操作成功'
          },
          data: {
            type: 'object',
            example: null
          },
          meta: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                example: 1
              },
              limit: {
                type: 'number',
                example: 10
              },
              total: {
                type: 'number',
                example: 100
              }
            }
          }
        }
      }
    },
    responses: {
      ServerError: {
        description: '伺服器錯誤',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/routes/**/*.ts'] // 路由文件的路徑
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  // Swagger UI 選項
  const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Movie Viewer API Documentation'
  };

  // 提供 swagger.json
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // 設置 Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
}; 