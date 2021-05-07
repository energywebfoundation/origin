describe('ui-core: UiCore component', () => {
  beforeEach(() => cy.visit('/iframe.html?id=uicore--primary'));

  it('should render the component', () => {
    cy.get('h1').should('contain', 'Welcome to ui-core!');
  });
});
