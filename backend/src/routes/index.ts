import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import movieRoutes from './movies.routes';


const router = Router();
const API_PREFIX = '/api/v1';

// 註冊所有路由
router.use(`${API_PREFIX}/health`, healthRoutes);
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/movies`, movieRoutes);


export default router;