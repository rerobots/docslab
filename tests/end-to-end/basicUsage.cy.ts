describe('quickly open and close CubeCell example', () => {
    it('passes', () => {
        cy.visit('http://localhost:8080/cubecell.html');
        cy.get('div.docslab')
            .first()
            .within(() => {
                cy.get('button').should('have.length', 1);
                cy.get('button').contains('Run').click();
                cy.get('button').should('have.length.gt', 1);
                cy.get('button').contains('Teardown').should('exist');
                cy.get('button').contains('Teardown ').click();
                cy.get('button').should('have.length', 1);
            });
    });
});
