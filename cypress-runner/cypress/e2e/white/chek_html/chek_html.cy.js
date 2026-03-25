const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

describe('Проверка на отсутствие .html в коде страниц', () => {
  const problems = [];
  let htmlFiles = [];

  before(() => {
    cy.task('getHtmlFiles', landerDir).then((files) => {
      htmlFiles = files;
    });
  });

  it('HTML-файлы не должны содержать ссылок с расширением .html', () => {
    htmlFiles.forEach((fileName) => {
      const filePath = normalizePath(`${landerDir}/${fileName}`);

      cy.readFile(filePath, { log: false }).then((html) => {
        const hasHtml = /\.html(\b|["'?])/gi.test(html);

        if (hasHtml) {
          problems.push(fileName);
        }
      });
    });

    cy.then(() => {
      if (problems.length > 0) {
        const report = problems
          .map((p) => `Файл ${p}`)
          .join('\n');

        throw new Error(
          `Найдены упоминания ".html" в коде HTML-файлов:\n\n${report}`
        );
      }
    });
  });
});