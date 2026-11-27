function expectFullScreen(doc) {
    cy.get('@snippet').then((el) => {
        const rect = el[0].getBoundingClientRect();
        expect(rect.left).to.equal(0);
        expect(rect.top).to.equal(0);
        expect(rect.width).to.equal(doc.documentElement.clientWidth);
        expect(rect.height).to.equal(doc.documentElement.clientHeight);
    });
}

describe('quickly open and close CubeCell example', () => {
    it('passes', () => {
        cy.visit('http://localhost:8080/devboards.html');
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

describe('enter and exit fullscreen mode', () => {
    it('passes', () => {
        cy.visit('http://localhost:8080/devboards.html');
        cy.get('div.docslab').first().as('snippet');
        cy.get('@snippet').contains('button', 'Fullscreen').click();
        cy.get('@snippet').should('have.class', 'dl-fullscreen');
        cy.document().then(expectFullScreen);
        cy.get('@snippet').contains('button', 'Exit fullscreen').click();
        cy.get('@snippet').should('not.have.class', 'dl-fullscreen');
        cy.get('@snippet').contains('button', 'Fullscreen').should('exist');
    });
});

describe('changing layouts', () => {
    it('switches among tabs', () => {
        cy.visit('http://localhost:8080/layout.html');
        cy.get('div#exampleWithTabs').first().as('snippet');
        cy.get('@snippet').should('have.class', 'dl-tabs');
        cy.get('@snippet').find('[role=tab]').should('have.length', 3);
        cy.get('@snippet')
            .contains('[role=tab]', 'Code')
            .should('have.attr', 'aria-selected', 'true');
        cy.get('@snippet')
            .contains('[role=tab]', 'Terminal')
            .should('be.disabled');
        cy.get('@snippet')
            .contains('[role=tab]', 'Camera')
            .should('be.disabled');
        cy.get('@snippet').find('.docslabEditor').should('be.visible');

        cy.get('@snippet').contains('button', 'Run').click();
        cy.get('@snippet')
            .contains('[role=tab]', 'Terminal')
            .should('not.be.disabled')
            .and('have.attr', 'aria-selected', 'true');
        cy.get('@snippet').find('.dl-terminalContainer').should('be.visible');
        cy.get('@snippet').find('.docslabEditor').should('not.be.visible');

        cy.get('@snippet').contains('[role=tab]', 'Code').click();
        cy.get('@snippet').find('.docslabEditor').should('be.visible');
        cy.get('@snippet')
            .find('.dl-terminalContainer')
            .should('not.be.visible');

        cy.get('@snippet').contains('button', 'Teardown').click();
        cy.get('@snippet')
            .contains('[role=tab]', 'Terminal')
            .should('be.disabled');
        cy.get('@snippet')
            .contains('[role=tab]', 'Code')
            .should('have.attr', 'aria-selected', 'true');
    });

    it('supports fullscreen mode with tabs', () => {
        cy.visit('http://localhost:8080/layout.html');
        cy.get('div#exampleWithTabs').first().as('snippet');
        cy.get('@snippet').contains('button', 'Fullscreen').click();
        cy.document().then(expectFullScreen);
        cy.get('@snippet').contains('button', 'Run').click();
        cy.get('@snippet')
            .contains('[role=tab]', 'Terminal')
            .should('not.be.disabled')
            .and('have.attr', 'aria-selected', 'true');
        cy.get('@snippet').contains('[role=tab]', 'Code').click();
        cy.get('@snippet').find('.docslabEditor').should('be.visible');
        cy.get('@snippet').contains('button', 'Exit fullscreen').click();
    });
});
