import { expect } from 'chai';
import sinon from 'sinon';
import { initializeDatabase } from '../../config/database/db';
import * as postgresql from '../../config/database/postgresql';

describe('Database Connection Tests', () => {
  let prismaConnectStub: sinon.SinonStub;
  
  beforeEach(() => {
    // 重置所有 stub
    sinon.restore();
    
    // 創建新的 stub
    prismaConnectStub = sinon.stub(postgresql, 'connectPostgreSQL');
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('initializeDatabase', () => {
    it('應該成功初始化 PostgreSQL 連接', async () => {
      prismaConnectStub.resolves(true);
      
      await initializeDatabase();
      expect(prismaConnectStub.calledOnce).to.be.true;
    });
    
    it('當 PostgreSQL 連接失敗時應該拋出錯誤', async () => {
      prismaConnectStub.resolves(false);
      
      try {
        await initializeDatabase();
        expect.fail('應該拋出錯誤');
      } catch (err) {
        const error = err as Error;
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('無法建立 PostgreSQL 資料庫連接，請檢查配置和網絡狀態');
      }
    });
  });
});