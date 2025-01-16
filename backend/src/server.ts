import express from 'express';
import logger from './logger';
import security from './security';

const app = express();

// 使用日誌和安全性中間件
app.use(logger);
app.use(security);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});