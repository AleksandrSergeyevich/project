const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

describe('Проверка siteRoutes на соответствие существующим файлам', () => {
  const problems = [];

  before(() => {
    cy.task('getHtmlFiles', landerDir).as('htmlFiles');
  });

  it('Все siteRoutes соответствуют существующим HTML-файлам', function () {
    const htmlFiles = this.htmlFiles;

    Cypress._.each(htmlFiles, (fileName) => {
      const filePath = `${landerDir}/${fileName}`;
      cy.readFile(normalizePath(filePath)).then((html) => {
        const match = html.match(
          /localStorage\.setItem\(\s*['"]siteRoutes['"]\s*,\s*JSON\.stringify\(([\s\S]*?)\)\s*\)/i
        );
        if (!match) {
          problems.push(`${fileName}: блок siteRoutes не найден`);
          return;
        }

        let routes;
        try {
          routes = eval('(' + match[1] + ')');
        } catch (e) {
          problems.push(`${fileName}: ошибка парсинга siteRoutes (${e.message})`);
          return;
        }

        Object.entries(routes).forEach(([routeName, routePath]) => {
          const expectedFile = `${routePath.replace(/^\//, '')}.html`;
          if (!htmlFiles.includes(expectedFile)) {
            problems.push(`${fileName}: route "${routeName}" → "${routePath}" файл "${expectedFile}" отсутствует`);
          }
        });
      });
    });

    cy.then(() => {
      if (problems.length > 0) {
        throw new Error(`Найдены ошибки в siteRoutes:\n${problems.join('\n')}`);
      }
    });
  });
});
