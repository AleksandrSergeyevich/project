const targetUrl = Cypress.env('targetUrl');

describe('Проверка наличия плейсхолдера {{aio}} в HTML-разметке', function () {
  it('На странице должен быть плейсхолдер {{aio}}', function () {
    cy.visit(targetUrl);

    cy.document().then((doc) => {
      const htmlContent = doc.documentElement.outerHTML;

      if (!htmlContent.includes('{{aio}}')) {
        throw new Error('Плейсхолдер {{aio}} отсутствует в HTML-разметке');
      }
    });
  });
});
