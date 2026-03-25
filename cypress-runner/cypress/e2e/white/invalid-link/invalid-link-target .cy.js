const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

describe('Проверка отсутствия target="_blank" на всех страницах', () => {
  let htmlFiles = [];
  const problems = [];

  before(() => {
    cy.task('getHtmlFiles', landerDir).then((files) => {
      htmlFiles = files;
    });
  });

  it('На страницах не должно быть ссылок с target="_blank"', () => {
    cy.wrap(htmlFiles).each((fileName) => {
      const filePath = normalizePath(`${landerDir}/${fileName}`);

      cy.readFile(filePath).then((html) => {
        const aTags = [...html.matchAll(/<a\s+[^>]*>/gi)];

        aTags.forEach((tag) => {
          const targetMatch = tag[0].match(/target=["']([^"']*)["']/i);
          if (targetMatch && targetMatch[1].toLowerCase() === '_blank') {
            problems.push(`${fileName}: ссылка с target="_blank" найдена — ${tag[0]}`);
          }
        });
      });
    });

    cy.then(() => {
      if (problems.length > 0) {
        throw new Error(`Найдены недопустимые ссылки с target="_blank":\n${problems.join('\n')}`);
      }
    });
  });
});