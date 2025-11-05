/// <reference types="cypress" />

describe('首頁功能', () => {
  it('訪問首頁顯示熱門電影', () => {
    // 訪問首頁
    cy.visit('/');
    
    // 檢查電影卡片是否存在且數量大於 0
    cy.get('[data-testid="movie-card"]', { timeout: 10000 })
      .should('exist')
      .should('have.length.gt', 0);
  });
});