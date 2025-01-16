import express from 'express';
import cors from 'cors';
import { setupConfig } from './config';

const app = express();

app.use(cors());
app.use(express.json());

setupConfig(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`伺服器運行於 port ${PORT}`);
});