import morgan from 'morgan';
import { Express } from 'express';

export const setupLogger = (app: Express) => {
  app.use(morgan('dev'));
}; 