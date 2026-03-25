const targetUrl = Cypress.env('targetUrl');

describe('Проверка подключения time-scripts', () => {
  it('В HTML-разметке должен присутствовать тег <script> с подключением time-scripts', () => {
    cy.visit(targetUrl);

    cy.document().then((doc) => {
      const scriptExists = doc.querySelector('script[src*="time-scripts/main.js"]') !== null;
      expect(
        scriptExists,
        'Отсутствует подключение скрипта time-scripts. Путь должен быть указан как (&lt;script type="module" src="time-scripts/main.js"&gt;&lt;/script&gt;).'
      ).to.be.true;
    });
  });

  it('В HTML-разметке должны быть атрибуты data-time-function', () => {
    cy.visit(targetUrl);

    cy.get('[data-time-function]').should(($elements) => {
      expect(
        $elements.length,
        'В HTML-разметке отсутствуют атрибуты data-time-function.'
      ).to.be.at.least(1);
    });
  });
});
