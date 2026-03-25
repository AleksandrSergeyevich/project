const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

const FORBIDDEN_EXT = /\.(jpg|jpeg|png)$/i;
const ALLOWED_EXT = /\.(webp|svg|avif|ico)$/i;

describe('Проверка форматов изображений', () => {
  const problems = [];
  let htmlFiles = [];

  before(() => {
    cy.task('getHtmlFiles', landerDir).then((files) => {
      htmlFiles = files;
    });
  });

  it('На страницах не должно быть изображений в форматах jpg / jpeg / png', () => {
    htmlFiles.forEach((fileName) => {
      const htmlPath = normalizePath(`${landerDir}/${fileName}`);

      cy.readFile(htmlPath, { log: false }).then((html) => {
        const images = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];

        if (!images.length) return;

        images.forEach(([, src]) => {
          if (!src) return;

          const cleanSrc = src.split('?')[0].toLowerCase();

          if (FORBIDDEN_EXT.test(cleanSrc)) {
            problems.push({
              page: fileName,
              file: src,
            });
          }
        });
      });
    });

    cy.then(() => {
      if (problems.length > 0) {
        const summary = problems
          .map((p) => `${p.page} → ${p.file}`)
          .join('\n');

        throw new Error(
          `Найдены изображения в недопустимом формате:\n\n${summary}\n\n` +
          `Допустимые форматы: .webp, .svg, .avif, .ico`
        );
      }
    });
  });
});