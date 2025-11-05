/// <reference types="cypress" />

describe('電影搜尋功能', () => {
  it('搜尋 popular 第一部電影', () => {
    // 先獲取第一部電影的標題
    cy.visit('/');
    cy.get('[data-testid="movie-card"]').first()
      .find('[data-testid="movie-title"]')
      .invoke('text')
      .then((title) => {
        // 使用獲取到的標題進行搜尋
        cy.get('[data-testid="search-input"]').type(title);
        cy.get('[data-testid="search-btn"]').click();
        
        // 驗證搜尋結果
        cy.get('[data-testid="movie-card"]').first()
          .find('[data-testid="movie-title"]')
          .should('contain', title);
      });
  });
});