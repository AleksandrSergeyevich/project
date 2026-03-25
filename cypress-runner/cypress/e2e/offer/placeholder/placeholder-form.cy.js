const targetUrl = Cypress.env('targetUrl');

describe('Проверка наличия плейсхолдера {{form}} в HTML-разметке', function () {
  it('На странице должен быть плейсхолдер {{form}}', function () {
    cy.visit(targetUrl);

    cy.document().then((doc) => {
      const htmlContent = doc.documentElement.outerHTML;

      if (!htmlContent.includes('{{form}}')) {
        throw new Error('Плейсхолдер {{form}} отсутствует в HTML-разметке');
      }
    });
  });
});
