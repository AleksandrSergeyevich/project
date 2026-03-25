const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

describe('Проверка размера шрифта в полях формы', () => {
  const problemsByPage = {};
  let htmlFiles = [];

  const formatPath = (p) => (p === '/' ? 'Главная страница' : p);

  function pushProblem(page, msg) {
    const key = page || '/';
    problemsByPage[key] = problemsByPage[key] || new Set();
    problemsByPage[key].add(msg);
  }

  before(() => {
    cy.task('getHtmlFiles', landerDir).then((files) => {
      htmlFiles = files;
    });
  });

  it('На странице в форме не должен быть размер шрифта (font-size) меньше 16px', () => {
    htmlFiles.forEach((fileName) => {
      const filePath = normalizePath(`${landerDir}/${fileName}`);

      cy.readFile(filePath, { log: false }).then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const inputs = doc.querySelectorAll('input, textarea, select');

        if (inputs.length === 0) return;

        inputs.forEach((el) => {
          const fontSizeStr = el.style.fontSize || '16px';
          const fontSizeValue = parseFloat(fontSizeStr);

          if (fontSizeValue < 16) {
            const tagName = el.tagName.toLowerCase();
            const elementId = el.id ? `#${el.id}` : '';
            pushProblem(
              fileName,
              `${formatPath(fileName)} — ${tagName}${elementId} имеет font-size: ${fontSizeStr}, ожидалось >=16px`
            );
          }
        });
      });
    });

    cy.then(() => {
      const pages = Object.keys(problemsByPage);
      const messages = [];

      pages.forEach((p) => {
        const set = problemsByPage[p];
        if (set && set.size > 0) {
          set.forEach((m) => messages.push(m));
        }
      });

      if (messages.length > 0) {
        throw new Error(
          `Обнаружены поля ввода с font-size меньше 16px:\n\n${messages.join('\n')}`
        );
      }
    });
  });
});
