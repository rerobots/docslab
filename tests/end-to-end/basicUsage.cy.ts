describe('quickly open and close CubeCell example', () => {
    it('passes', () => {
        cy.visit('http://localhost:8080/cubecell.html');
        cy.get('div.docslab')
            .first()
            .within(() => {
                cy.get('button').should('have.length', 2);
                cy.get('button').contains('Run').click();
                cy.get('button').should('have.length.gt', 2);
                cy.get('button').contains('Teardown').should('exist');
                cy.get('button').contains('Teardown ').click();
                cy.get('button').should('have.length', 2);
            });
    });
});

describe('enter and exit full screen mode', () => {
    it('passes', () => {
        cy.visit('http://localhost:8080/cubecell.html');
        cy.get('div.docslab').first().as('snippet');
        cy.get('@snippet').contains('button', 'Full screen').click();
        cy.get('@snippet').should('have.class', 'dl-fullscreen');
        cy.document().then((doc) => {
            cy.get('@snippet').then(($el) => {
                const rect = $el[0].getBoundingClientRect();
                expect(rect.left).to.equal(0);
                expect(rect.top).to.equal(0);
                expect(rect.width).to.equal(doc.documentElement.clientWidth);
                expect(rect.height).to.equal(doc.documentElement.clientHeight);
            });
        });
        cy.get('@snippet').contains('button', 'Exit full screen').click();
        cy.get('@snippet').should('not.have.class', 'dl-fullscreen');
        cy.get('@snippet').contains('button', 'Full screen').should('exist');
    });
});
