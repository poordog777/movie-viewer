import { expect } from 'chai';
import { StateManager } from '../../config/oauth';

describe('StateManager 測試', () => {
  beforeEach(() => {
    // 清理任何現存的 state
    StateManager.clearExpiredStates();
  });

  after(() => {
    // 清理所有計時器
    StateManager.clearTimers();
  });

  it('應該能生成有效的 state 參數', () => {
    const state = StateManager.generateState();
    expect(state).to.be.a('string');
    expect(state.length).to.be.greaterThan(0);
  });

  it('應該能驗證有效的 state', () => {
    const state = StateManager.generateState();
    const isValid = StateManager.verifyState(state);
    expect(isValid).to.be.true;
  });

  it('驗證後的 state 應該被刪除（不能重複使用）', () => {
    const state = StateManager.generateState();
    
    // 第一次驗證
    const firstVerify = StateManager.verifyState(state);
    expect(firstVerify).to.be.true;
    
    // 第二次驗證應該失敗
    const secondVerify = StateManager.verifyState(state);
    expect(secondVerify).to.be.false;
  });

  it('應該拒絕無效的 state', () => {
    const invalidState = 'invalid-state';
    const isValid = StateManager.verifyState(invalidState);
    expect(isValid).to.be.false;
  });
});