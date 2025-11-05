/// <reference types="cypress" />

describe('登入功能', () => {
  it('點擊登入按鈕後重定向到 Google', () => {
    cy.visit('/');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', 'accounts.google.com');
  });
});