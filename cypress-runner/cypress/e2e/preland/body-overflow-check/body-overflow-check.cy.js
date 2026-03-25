const targetUrl = cy.env('targetUrl');

describe('Проверка overflow на <body> с подсветкой файлов', () => {
  const problems = [];

  it('overflow для <body>: запрещён hidden, кроме overflow-x', () => {
    cy.visit(targetUrl);
    cy.wait(500);

    cy.document().then((doc) => {
      const body = doc.body;

      if (body.style.overflowY === 'hidden') {
        problems.push('index.html (inline style)');
      }

      Array.from(doc.styleSheets).forEach((sheet) => {
        try {
          const rules = sheet.cssRules || [];
          for (const rule of rules) {
            if (
              rule.selectorText &&
              (rule.selectorText === 'body' || rule.selectorText === 'html, body')
            ) {
              const overflowY = rule.style?.overflowY || rule.style?.overflow;
              if (overflowY === 'hidden') {
                problems.push(sheet.href ? sheet.href.split('/').pop() : 'inline <style>');
              }
            }
          }
        } catch (e) {
        }
      });
    });
  });

  after(() => {
    if (problems.length > 0) {
      const report = [...new Set(problems)]
        .map(
          (f) =>
            `Найдено недопустимое значение overflow для элемента <body> в файле: ${f}. Горизонтальная прокрутка должна быть отключена, вертикальная — доступна.`
        )
        .join('\n');

      throw new Error(report);
    }
  });
});
