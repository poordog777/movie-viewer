import { setupLogger } from './logger';
import { setupSecurity } from './security';
import { setupSwagger } from './swagger';
import { Express } from 'express';

export const setupConfig = (app: Express) => {
  setupLogger(app);
  setupSecurity(app);
  setupSwagger(app);
};