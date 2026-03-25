const targetUrl = Cypress.env('targetUrl');

describe('Кнопка "regiser now" с заданной ссылкой {{link}}&place=button', function () {
  it('Кнопка "regiser now" должна иметь ссылку {{link}}&place=button', function () {
    cy.visit(targetUrl);

    cy.get('a').then(($links) => {
      const exactLink = $links.filter(
        (i, link) => link.getAttribute('href') === '{{link}}&place=button'
      );

      expect(exactLink.length).to.equal(1);
    });
  });
});
