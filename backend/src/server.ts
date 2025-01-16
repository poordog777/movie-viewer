import express from 'express';
import cors from 'cors';
import { setupConfig } from './config';
import { env } from './config/env';

const app = express();

app.use(cors());
app.use(express.json());

setupConfig(app);

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`伺服器運行於 port ${PORT}`);
});