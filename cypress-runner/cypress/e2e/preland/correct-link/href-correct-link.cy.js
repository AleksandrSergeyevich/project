const targetUrl = Cypress.env('targetUrl');
const expectedLink = '{{link}}';
const specialButtonLink = '{{link}}&place=button';

describe('Проверка ссылок на странице', function () {
  it('Все ссылки (за исключением кнопок "Register Now" и элементов с атрибутом data-fslightbox) должны содержать атрибут href="{{link}}', function () {
    cy.visit(targetUrl);

    let specialLinkCount = 0;

    cy.get('body a')
      .each(($link) => {
        const href = $link.attr('href');
        const hasFslightbox = $link.attr('data-fslightbox');

        if (href === specialButtonLink) {
          specialLinkCount++;
        } else if (hasFslightbox) {
          cy.log(`Ссылка с data-fslightbox: ${href} - проверка пропущена`);
        } else {
          expect(href).to.equal(
            expectedLink,
            `Ссылка имеет некорректный href: ${href}, ожидалось ${expectedLink}`
          );
        }
      })
      .then(() => {
        expect(specialLinkCount, 'Ссылка {{link}}&place=button должна быть только одна').to.equal(
          1
        );
      });
  });
});
