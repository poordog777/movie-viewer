import { Router } from 'express';
import { readdirSync } from 'fs';
import { join } from 'path';

const router = Router();
const API_PREFIX = '/api/v1';

// 自動載入所有路由文件
const routesDir = join(__dirname);
readdirSync(routesDir).forEach(async (file) => {
  if (file.endsWith('.routes.ts') || file.endsWith('.routes.js')) {
    const route = (await import(join(routesDir, file))).default;
    router.use(API_PREFIX, route);
  }
});

export default router; 