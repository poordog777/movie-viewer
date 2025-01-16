import helmet from 'helmet';
import express from 'express';

const app = express();

// 使用 Helmet 增加安全性
app.use(helmet());

export default app;