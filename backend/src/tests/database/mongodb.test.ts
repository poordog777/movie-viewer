import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { env } from '../../config/env';
import { connectMongoDB } from '../../config/database';

describe('MongoDB Connection Tests', () => {
  // 最大重試次數
  const maxRetries = 3;
  // 保存原始的 URI
  let originalUri: string;

  beforeEach(() => {
    // 保存原始的 URI
    originalUri = env.mongodbUri!;
  });

  afterEach(async () => {
    // 還原原始的 URI
    env.mongodbUri = originalUri;
    // 確保斷開連接
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('應該能成功連接 MongoDB', async () => {
    const result = await connectMongoDB(1, maxRetries);
    expect(result).to.be.true;
    expect(mongoose.connection.readyState).to.equal(1);
  });

  it('使用錯誤的連接字串時應重試指定次數後失敗', async () => {
    // 設定錯誤的連接字串
    env.mongodbUri = originalUri.replace('poordog777', 'wronguser');
    
    let attempts = 0;
    for (let i = 1; i <= maxRetries; i++) {
      const result = await connectMongoDB(i, maxRetries);
      attempts++;
      expect(result).to.be.false;
    }
    expect(attempts).to.equal(maxRetries);
  }).timeout(20000);

  it('斷開連接後應該顯示正確狀態', async () => {
    const result = await connectMongoDB(1, maxRetries);
    expect(result).to.be.true;
    expect(mongoose.connection.readyState).to.equal(1);
    
    await mongoose.disconnect();
    expect(mongoose.connection.readyState).to.equal(0);
  });
});