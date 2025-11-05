/// <reference types="cypress" />

describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001')
  })

  it('應該顯示登入按鈕', () => {
    cy.get('[data-testid="login-btn"]').should('exist')
  })

  it('點擊登入按鈕應該導向 Google 登入頁面', () => {
    cy.get('[data-testid="login-btn"]').click()
    cy.url().should('include', 'accounts.google.com')
  })
})