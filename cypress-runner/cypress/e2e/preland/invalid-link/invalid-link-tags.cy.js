const targetUrl = Cypress.env('targetUrl');

describe('Проверка отсутствия некорректных ссылок в тегах <link>', function () {
  it('Теги link не должны содержать href="{{link}}"', function () {
    cy.visit(targetUrl);

    cy.get('link').each(($link) => {
      const href = $link.attr('href');

      if (href === '{{link}}') {
        throw new Error('Найден некорректный тег link с href="{{link}}".');
      }
    });
  });
});
