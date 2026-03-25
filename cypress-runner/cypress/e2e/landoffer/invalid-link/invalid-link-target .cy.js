const targetUrl = Cypress.env('targetUrl');

describe('Проверка отсутствия target="_blank" в ссылках <a>', () => {
  it('Теги <a> не должны содержать target="_blank"', () => {
    cy.visit(targetUrl);

    cy.get('a').each(($a) => {
      const target = $a.attr('target');

      if (target === '_blank') {
        throw new Error('Обнаружена ссылка с target="_blank"');
      }
    });
  });
});
