import { expect } from 'chai';
import sinon from 'sinon';

import { connectDatabases, disconnectDatabases, checkConnections } from '../../config/database/connection';
import * as mongodb from '../../config/database/mongodb';
import * as postgresql from '../../config/database/postgresql';

describe('數據庫連接測試', () => {
  // 在每個測試後重置所有 stub
  afterEach(() => {
    sinon.restore();
  });

  describe('connectDatabases()', () => {
    it('應該成功連接所有數據庫', async () => {
      // 模擬成功的數據庫連接
      const mongoStub = sinon.stub(mongodb, 'connectMongoDB').resolves(true);
      const postgresStub = sinon.stub(postgresql, 'connectPostgreSQL').resolves(true);

      await connectDatabases();

      expect(mongoStub.calledOnce).to.be.true;
      expect(postgresStub.calledOnce).to.be.true;
    });

    it('當 MongoDB 連接失敗時應該拋出錯誤', async () => {
      // 模擬 MongoDB 連接失敗
      sinon.stub(mongodb, 'connectMongoDB').resolves(false);
      sinon.stub(postgresql, 'connectPostgreSQL').resolves(true);

      try {
        await connectDatabases();
        expect.fail('應該拋出錯誤');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('MongoDB: 連接失敗');
      }
    });

    it('當 PostgreSQL 連接失敗時應該拋出錯誤', async () => {
      // 模擬 PostgreSQL 連接失敗
      sinon.stub(mongodb, 'connectMongoDB').resolves(true);
      sinon.stub(postgresql, 'connectPostgreSQL').resolves(false);

      try {
        await connectDatabases();
        expect.fail('應該拋出錯誤');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('PostgreSQL: 連接失敗');
      }
    });

    it('當兩個數據庫都連接失敗時應該拋出包含兩個錯誤的錯誤信息', async () => {
      // 模擬兩個數據庫都連接失敗
      sinon.stub(mongodb, 'connectMongoDB').resolves(false);
      sinon.stub(postgresql, 'connectPostgreSQL').resolves(false);

      try {
        await connectDatabases();
        expect.fail('應該拋出錯誤');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('MongoDB: 連接失敗');
        expect((error as Error).message).to.include('PostgreSQL: 連接失敗');
      }
    });
  });

  describe('disconnectDatabases()', () => {
    it('應該成功斷開所有數據庫連接', async () => {
      // 模擬成功的數據庫斷開連接
      const mongoStub = sinon.stub(mongodb, 'disconnectMongoDB').resolves();
      const postgresStub = sinon.stub(postgresql, 'disconnectPostgreSQL').resolves();

      await disconnectDatabases();

      expect(mongoStub.calledOnce).to.be.true;
      expect(postgresStub.calledOnce).to.be.true;
    });

    it('當 MongoDB 斷開連接失敗時應該繼續執行', async () => {
      // 模擬 MongoDB 斷開連接失敗
      const mongoStub = sinon.stub(mongodb, 'disconnectMongoDB').rejects(new Error('MongoDB斷開連接錯誤'));
      const postgresStub = sinon.stub(postgresql, 'disconnectPostgreSQL').resolves();

      await disconnectDatabases();

      expect(mongoStub.calledOnce).to.be.true;
      expect(postgresStub.calledOnce).to.be.true;
    });

    it('當 PostgreSQL 斷開連接失敗時應該繼續執行', async () => {
      // 模擬 PostgreSQL 斷開連接失敗
      const mongoStub = sinon.stub(mongodb, 'disconnectMongoDB').resolves();
      const postgresStub = sinon.stub(postgresql, 'disconnectPostgreSQL').rejects(new Error('PostgreSQL斷開連接錯誤'));

      await disconnectDatabases();

      expect(mongoStub.calledOnce).to.be.true;
      expect(postgresStub.calledOnce).to.be.true;
    });
  });

  describe('checkConnections()', () => {
    it('應該正確回報所有數據庫的連接狀態', async () => {
      // 模擬兩個數據庫都連接成功
      sinon.stub(mongodb, 'checkMongoDBConnection').returns(true);
      sinon.stub(postgresql, 'checkPostgreSQLConnection').resolves(true);

      const status = await checkConnections();

      expect(status).to.deep.equal({
        mongodb: true,
        postgresql: true
      });
    });

    it('當正常檢查時發現某個數據庫未連接應該回報 false', async () => {
      // 模擬 MongoDB 正常檢查返回未連接，PostgreSQL 正常檢查返回已連接
      sinon.stub(mongodb, 'checkMongoDBConnection').returns(false);
      sinon.stub(postgresql, 'checkPostgreSQLConnection').resolves(true);

      const status = await checkConnections();

      expect(status).to.deep.equal({
        mongodb: false,
        postgresql: true
      });
    });

    it('當檢查過程發生異常錯誤時應該將狀態設為 false', async () => {
      // 模擬 PostgreSQL 檢查拋出錯誤
      sinon.stub(mongodb, 'checkMongoDBConnection').returns(true);
      sinon.stub(postgresql, 'checkPostgreSQLConnection').rejects(new Error('檢查失敗'));

      const status = await checkConnections();

      expect(status).to.deep.equal({
        mongodb: true,
        postgresql: false
      });
    });
  });
});