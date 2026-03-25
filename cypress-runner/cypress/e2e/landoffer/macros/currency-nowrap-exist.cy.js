const targetUrl = Cypress.env('targetUrl');

describe('На странице необходимо подключеие макроса {{aio:macros:currency_nowrap}}', () => {
  it('Макрос Currency Nowrap присутствует и подключен корректно {{aio:macros:currency_nowrap}}', () => {
    cy.visit(targetUrl);

    cy.document().then((doc) => {
      const html = doc.documentElement.outerHTML;
      const macroRegex = /\{\{\s*aio:macros:currency_nowrap\s*\}\}/gi;
      
      if (!html.match(macroRegex)) {
        throw new Error('Отсутствует подключение макроса Currency Nowrap. Ожидается строка подключения: {{aio:macros:currency_nowrap}}');
      }
    });
  });
});