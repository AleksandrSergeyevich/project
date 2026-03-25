const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

describe('Проверка локали, time-scripts и года в футере', () => {
  const problems = [];
  let htmlFiles = [];

  before(() => {
    cy.task('getHtmlFiles', landerDir).then((files) => {
      htmlFiles = files;
    });
  });

  it('HTML файлы должны соответствовать требованиям', () => {
    htmlFiles.forEach((fileName) => {
      const filePath = normalizePath(`${landerDir}/${fileName}`);

      cy.readFile(filePath, { log: false }).then((html) => {
        const localeRegex = /const\s+dateLocaleCode\s*=\s*["'][a-z]{2}-[A-Z]{2}["']/;
        if (localeRegex.test(html)) {
          problems.push(
            `${fileName} — найден const dateLocaleCode (локаль должна быть удалена)`
          );
        }

        const timeScriptRegex =
          /<script[^>]+src=["'][^"']*time-scripts\/main\.js["'][^>]*><\/script>/i;
        if (timeScriptRegex.test(html)) {
          problems.push(
            `${fileName} — подключён time-scripts/main.js (должен быть удалён)`
          );
        }

        const hasTimeFunction =
          /<span[^>]+data-time-function=["']timeYear["'][^>]*><\/span>/i.test(html);
        const hasCurrentYear =
          /<span[^>]+data-current-year[^>]*><\/span>/i.test(html);

        if (!hasTimeFunction && !hasCurrentYear) {
          problems.push(
            `${fileName} — отсутствует <span data-time-function="timeYear"> или <span data-current-year>`
          );
        }
      });
    });

    cy.then(() => {
      if (problems.length > 0) {
        throw new Error(
          `Найдены проблемы (${problems.length}):\n\n${problems.join('\n')}`
        );
      }
    });
  });
});
