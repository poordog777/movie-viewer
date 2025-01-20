import { Router } from 'express';
import { readdirSync } from 'fs';
import { join } from 'path';
import authRoutes from './auth.routes';

const router = Router();
const API_PREFIX = '/api/v1';

// 手動註冊重要路由
router.use(`${API_PREFIX}/auth`, authRoutes);

// 自動載入其他路由文件
const routesDir = join(__dirname);
readdirSync(routesDir).forEach(async (file) => {
  if (file !== 'index.ts' && (file.endsWith('.routes.ts') || file.endsWith('.routes.js'))) {
    const route = (await import(join(routesDir, file))).default;
    router.use(API_PREFIX, route);
  }
});

export default router; 