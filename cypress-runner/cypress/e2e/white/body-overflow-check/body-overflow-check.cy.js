const landerDir = Cypress.env('landerDir');

describe('Проверка overflow на <body>', () => {
  const problems = [];

  let htmlFiles = [];
  let cssFiles = [];

  const BODY_SELECTOR_REGEX = /(body|html\s*,\s*body)/i;
  const BAD_OVERFLOW_REGEX =
    /(overflow\s*:\s*hidden\b|overflow-y\s*:\s*hidden\b)/i;

  before(() => {
    cy.task('getHtmlFiles', landerDir).then((files) => {
      htmlFiles = files;
    });

    cy.task('getCssFiles', landerDir).then((files) => {
      cssFiles = files;
    });
  });

  it('overflow для <body>: запрещён hidden, кроме overflow-x', () => {
    htmlFiles.forEach((filePath) => {
      cy.readFile(filePath, { log: false }).then((html) => {
        const inlineBodyStyle =
          /<body[^>]+style=["'][^"']*(overflow\s*:\s*hidden|overflow-y\s*:\s*hidden)[^"']*["']/i;

        if (inlineBodyStyle.test(html)) {
          problems.push(`${filePath} (inline body style)`);
        }

        const styleBlocks =
          html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];

        styleBlocks.forEach((block) => {
          if (
            BODY_SELECTOR_REGEX.test(block) &&
            BAD_OVERFLOW_REGEX.test(block)
          ) {
            problems.push(`${filePath} (<style> block)`);
          }
        });
      });
    });

    cssFiles.forEach((filePath) => {
      cy.readFile(filePath, { log: false }).then((css) => {
        const bodyRuleRegex =
          /(body|html\s*,\s*body)\s*\{[^}]*?(overflow\s*:\s*hidden|overflow-y\s*:\s*hidden)[^}]*?\}/gi;

        if (bodyRuleRegex.test(css)) {
          problems.push(filePath);
        }
      });
    });

    cy.then(() => {
      if (problems.length > 0) {
        const report = [...new Set(problems)]
          .map(
            (f) =>
              `Найдено недопустимое значение overflow для <body> в файле: ${f}. ` +
              `Вертикальная прокрутка должна быть доступна.`
          )
          .join('\n');

        throw new Error(report);
      }
    });
  });
});