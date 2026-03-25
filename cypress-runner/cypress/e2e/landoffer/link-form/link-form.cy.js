const targetUrl = Cypress.env('targetUrl');

describe('Проверка наличия id="form" и корректного якоря', () => {
  const problems = [];

  Cypress.on('uncaught:exception', () => false);

  it('Для формы должен использоваться идентификатор id="form". Якорная навигация на форму должна иметь формат <a href="#form">', () => {

    cy.visit(targetUrl);
    cy.wait(500);

    cy.document().then((doc) => {
      const html = doc.documentElement.outerHTML;

      if (!/id=["']form["']/i.test(html)) {
        problems.push('Не найден элемент с id="form"');
      }

      const exactAnchorExists = /<a[^>]+href=["']#form["'][^>]*>/i.test(html);

      const badAnchors = [...html.matchAll(/<a[^>]+href=["'](#form[^"']+)["'][^>]*>/gi)]
        .map((m) => m[1])
        .filter((href) => href.toLowerCase() !== '#form');

      const templateAnchor = /<a[^>]+href=["']\{\{link\}\}["'][^>]*>/i.test(html);

      if (!exactAnchorExists && badAnchors.length === 0) {
        problems.push('Не найдена ссылка <a href="#form">');
      }

      badAnchors.forEach((href) => {
        problems.push(`Найдена некорректная ссылка "${href}", ожидается "#form"`);
      });

      if (templateAnchor) {
        problems.push('Найдена запрещённая ссылка <a href="{{link}}">, ожидается <a href="#form">');
      }
    });
  });

  after(() => {
    if (problems.length > 0) {
      throw new Error(
        `Обнаружены проблемы с якорем формы:\n\n${problems.join('\n')}`
      );
    }
  });
});
