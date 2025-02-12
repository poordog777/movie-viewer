import { setupLogger } from './logger';
import { setupSecurity } from './security';
import { setupSwagger } from './swagger';
import { Express } from 'express';
import './passport';  // 導入 passport 設定

export const setupConfig = (app: Express) => {
  setupLogger(app);
  setupSecurity(app);
  setupSwagger(app);
};