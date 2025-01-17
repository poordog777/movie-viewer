import express from 'express';
import cors from 'cors';
import { setupConfig } from './config';
import { env } from './config/env';
import { connectDatabases } from './config/database';

const app = express();

app.use(cors());
app.use(express.json());

setupConfig(app);

const PORT = env.port;

const startServer = async () => {
  try {
    await connectDatabases();
    
    app.listen(PORT, () => {
      console.log(`伺服器運行於 port ${PORT}`);
    });
  } catch (error) {
    console.error('伺服器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();