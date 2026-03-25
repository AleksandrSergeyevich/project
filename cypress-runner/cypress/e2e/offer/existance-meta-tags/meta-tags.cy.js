const targetUrl = Cypress.env('targetUrl');

describe('meta tags', function () {
  beforeEach(() => {
    cy.visit(targetUrl);
  });
  it('Должен содержать мета-теги format-detection=no', function () {
    const expectedAttributes = ['telephone=no', 'date=no', 'address=no', 'email=no'];

    cy.get('meta[name="format-detection"]').then((metaTags) => {
      if (metaTags.length === 1) {
        cy.wrap(metaTags)
          .should('have.attr', 'content')
          .then((content) => {
            expectedAttributes.forEach((attr) => {
              expect(content).to.include(attr);
            });
          });
      } else if (metaTags.length > 1) {
        cy.get('meta[name="format-detection"]')
          .should('have.length', 4)
          .then((metaTags) => {
            const actualContents = metaTags
              .map((index, meta) => Cypress.$(meta).attr('content'))
              .get();

            expectedAttributes.forEach((attr) => {
              expect(actualContents).to.include(attr);
            });
          });
      }
    });
  });

  it('Должен содержать мета-тег charset="UTF-8"', () => {
    cy.get('head').then(($head) => {
      if ($head.find('meta[charset="UTF-8"]').length > 0) {
        cy.get('meta[charset="UTF-8"]').should('exist');
      } else {
        cy.get('meta[http-equiv="Content-Type"]').should(
          'have.attr',
          'content',
          'text/html; charset=UTF-8'
        );
      }
    });
  });

  it('Должен содержать тег viewport с содержимым "width=device-width, initial-scale=1.0"', function () {
    cy.get('meta[name="viewport"]').should('exist');
    cy.get('meta[name="viewport"]')
      .should('have.attr', 'content')
      .and((content) => {
        expect(content).to.match(/width=device-width, initial-scale=1(\.0)?/);
      });
  });
});
