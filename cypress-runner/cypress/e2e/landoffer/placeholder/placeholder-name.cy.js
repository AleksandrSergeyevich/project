const targetUrl = Cypress.env('targetUrl');

describe('Проверка корректности плейсхолдеров в HTML-разметке', function () {
  it('На странице должен быть плейсхолдер {{aio.visit.fields.offer_name.for_visitor}} и отсутствовать устаревший {offer_name}', function () {
    cy.visit(targetUrl);

    cy.document().then((doc) => {
      const htmlContent = doc.documentElement.outerHTML;
      const correctPlaceholder = '{{aio.visit.fields.offer_name.for_visitor}}';
      const incorrectPlaceholder = '{offer_name}';

      if (!htmlContent.includes(correctPlaceholder)) {
        throw new Error(`Плейсхолдер ${correctPlaceholder} отсутствует в HTML-разметке`);
      }

      if (htmlContent.includes(incorrectPlaceholder)) {
        throw new Error(
          `В HTML-разметке найден устаревший плейсхолдер ${incorrectPlaceholder}. ` +
            `Используйте корректный формат: ${correctPlaceholder}`
        );
      }
    });
  });
});
