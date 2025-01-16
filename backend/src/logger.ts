import morgan from 'morgan';
import express from 'express';

const app = express();

// 使用 Morgan 作為日誌中間件
app.use(morgan('dev'));

export default app;