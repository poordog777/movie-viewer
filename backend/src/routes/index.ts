import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import movieRoutes from './movies.routes';

const router = Router();
const API_PREFIX = '/api/v1';

// 註冊所有路由
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);

// 將所有路由加上 API 前綴
const prefixRouter = Router();
prefixRouter.use(API_PREFIX, router);

export default prefixRouter;