/// <reference types="cypress" />

describe('電影評分功能', () => {
  it('未登入時點擊第一部電影的評分顯示登入提示', () => {
    // 點擊第一部電影進入詳情頁
    cy.visit('/');
    cy.get('[data-testid="movie-card"]', { timeout: 10000 }).first().click();
    
    // 點擊評分按鈕
    cy.get('[data-testid="rating-input"]', { timeout: 10000 }).click();
    
    // 驗證登入提示
    cy.contains('請先登入會員').should('be.visible');
  });
});