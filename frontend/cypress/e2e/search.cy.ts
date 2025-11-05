/// <reference types="cypress" />

describe('Search Feature', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001')
  })

  it('應該能夠搜尋電影', () => {
    cy.get('[data-testid="search-input"]').type('復仇者聯盟')
    cy.get('[data-testid="search-btn"]').click()

    // 等待 API 響應並檢查結果
    cy.get('[data-testid="movie-card"]', { timeout: 10000 }).should('have.length.gt', 0)
    
    // 驗證搜尋結果是否包含關鍵字
    cy.get('[data-testid="movie-title"]').first().should('contain', '復仇者')
  })

  it('搜尋無結果時應顯示提示訊息', () => {
    cy.get('[data-testid="search-input"]').type('絕對不會有這部電影')
    cy.get('[data-testid="search-btn"]').click()

    cy.get('[data-testid="no-results"]').should('exist')
    cy.get('[data-testid="no-results"]').should('contain', '找不到相關電影')
  })
})