import { expect } from 'chai';
import sinon from 'sinon';
import { PrismaClient } from '@prisma/client';
import { initializeDatabases, closeDatabases, checkDatabaseConnections } from '../../config/database/connection';
import * as postgresql from '../../config/database/postgresql';

describe('Database Connection Tests', () => {
  let prismaConnectStub: sinon.SinonStub;
  let prismaDisconnectStub: sinon.SinonStub;
  
  beforeEach(() => {
    // 重置所有 stub
    sinon.restore();
    
    // 創建新的 stub
    prismaConnectStub = sinon.stub(postgresql, 'connectPostgreSQL');
    prismaDisconnectStub = sinon.stub(postgresql, 'disconnectPostgreSQL');
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('initializeDatabases', () => {
    it('應該成功初始化所有數據庫連接', async () => {
      prismaConnectStub.resolves(true);
      
      await initializeDatabases();
      expect(prismaConnectStub.calledOnce).to.be.true;
    });
    
    it('當 PostgreSQL 連接失敗時應該拋出錯誤', async () => {
      prismaConnectStub.resolves(false);
      
      try {
        await initializeDatabases();
        expect.fail('應該拋出錯誤');
      } catch (err) {
        const error = err as Error;
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('無法建立 PostgreSQL 連接');
      }
    });
  });
  
  describe('closeDatabases', () => {
    it('應該正確關閉所有數據庫連接', async () => {
      prismaDisconnectStub.resolves();
      
      await closeDatabases();
      expect(prismaDisconnectStub.calledOnce).to.be.true;
    });
    
    it('當關閉連接失敗時應該拋出錯誤', async () => {
      const expectedError = new Error('關閉連接失敗');
      prismaDisconnectStub.rejects(expectedError);
      
      try {
        await closeDatabases();
        expect.fail('應該拋出錯誤');
      } catch (err) {
        const error = err as Error;
        expect(error).to.equal(expectedError);
      }
    });
  });
  
  describe('checkDatabaseConnections', () => {
    it('應該返回所有數據庫的連接狀態', async () => {
      const checkStub = sinon.stub(postgresql, 'checkPostgreSQLConnection').resolves(true);
      
      const result = await checkDatabaseConnections();
      
      expect(result).to.deep.equal({
        postgresql: true
      });
      expect(checkStub.calledOnce).to.be.true;
    });
    
    it('當數據庫連接失敗時應該返回 false', async () => {
      const checkStub = sinon.stub(postgresql, 'checkPostgreSQLConnection').resolves(false);
      
      const result = await checkDatabaseConnections();
      
      expect(result).to.deep.equal({
        postgresql: false
      });
      expect(checkStub.calledOnce).to.be.true;
    });
  });
});