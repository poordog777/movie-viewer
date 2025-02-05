import { expect } from 'chai';
import sinon from 'sinon';

import { connectDatabases, disconnectDatabases, checkConnections } from '../../config/database/connection';
import * as postgresql from '../../config/database/postgresql';

describe('數據庫連接測試', () => {
  // 在每個測試後重置所有 stub
  afterEach(() => {
    sinon.restore();
  });

  describe('connectDatabases()', () => {
    it('應該成功連接數據庫', async () => {
      // 模擬成功的數據庫連接
      const postgresStub = sinon.stub(postgresql, 'connectPostgreSQL').resolves(true);

      await connectDatabases();

      expect(postgresStub.calledOnce).to.be.true;
    });

    it('當 PostgreSQL 連接失敗時應該拋出錯誤', async () => {
      // 模擬 PostgreSQL 連接失敗
      sinon.stub(postgresql, 'connectPostgreSQL').resolves(false);

      try {
        await connectDatabases();
        expect.fail('應該拋出錯誤');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('PostgreSQL: 連接失敗');
      }
    });
  });

  describe('disconnectDatabases()', () => {
    it('應該成功斷開數據庫連接', async () => {
      // 模擬成功的數據庫斷開連接
      const postgresStub = sinon.stub(postgresql, 'disconnectPostgreSQL').resolves();

      await disconnectDatabases();

      expect(postgresStub.calledOnce).to.be.true;
    });

    it('當 PostgreSQL 斷開連接失敗時應該繼續執行', async () => {
      // 模擬 PostgreSQL 斷開連接失敗
      const postgresStub = sinon.stub(postgresql, 'disconnectPostgreSQL').rejects(new Error('PostgreSQL斷開連接錯誤'));

      await disconnectDatabases();

      expect(postgresStub.calledOnce).to.be.true;
    });
  });

  describe('checkConnections()', () => {
    it('應該正確回報數據庫的連接狀態', async () => {
      // 模擬數據庫連接成功
      sinon.stub(postgresql, 'checkPostgreSQLConnection').resolves(true);

      const status = await checkConnections();

      expect(status).to.deep.equal({
        postgresql: true
      });
    });

    it('當檢查過程發生異常錯誤時應該將狀態設為 false', async () => {
      // 模擬 PostgreSQL 檢查拋出錯誤
      sinon.stub(postgresql, 'checkPostgreSQLConnection').rejects(new Error('檢查失敗'));

      const status = await checkConnections();

      expect(status).to.deep.equal({
        postgresql: false
      });
    });
  });
});