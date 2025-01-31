import request from 'supertest';
import { expect } from 'chai';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

describe('Rate Limiter', () => {
    let app: express.Express;

    beforeEach(() => {
        app = express();
        app.use(rateLimit({
            windowMs: 10 * 60 * 1000, // 10 分鐘
            max: 100 // 限制 100 次請求
        }));
        
        app.get('/test', (_req: Request, res: Response) => {
            res.json({ message: 'ok' });
        });
    });

    it('應該允許在限制內的請求', async () => {
        const res = await request(app).get('/test');
        expect(res.status).to.equal(200);
    });

    it('應該在請求量大時返回 429 狀態碼', async () => {
        const promises = Array(101).fill(0).map(() => 
            request(app).get('/test')
        );
        
        const responses = await Promise.all(promises);
        expect(responses[100].status).to.equal(429);
    });
});