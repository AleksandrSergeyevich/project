const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');
const IGNORED_FILES = ['intlTelInput.min.js'];
const IGNORED_WORDS = [
  'Россия', 'Беларусь', 'Босна', 'Херцеговина', 'България',
  'Казахстан', 'Кыргызстан', 'Македони', 'Монгол', 'Срби',
  'Укра', 'на', 'и', 'а',
];
const CYRILLIC_REGEX = /[А-Яа-яЁё]+/gu;
const EMPTY_COMMENT_PATTERNS = {
  HTML: /<!--\s*-->/g,
  CSS: /\/\*\s*\*\//g,
  JS: /(?:\/\/\s*$)|(?:\/\*\s*\*\/)/gm,
};

describe('Проверка всех файлов на кириллицу и пустые комментарии', () => {
  const problems = [];
  let htmlFiles = [];

  before(() => {
    cy.task('getHtmlFiles', landerDir).then((files) => {
      htmlFiles = files;
    });
  });

  it('HTML, JS и CSS файлы не должны содержать кириллицу и пустые комментарии', () => {
    htmlFiles.forEach((fileName) => {
      const htmlPath = normalizePath(`${landerDir}/${fileName}`);
      cy.readFile(htmlPath).then((htmlContent) => {
        checkContent(htmlContent, fileName, 'HTML');

        const cssMatches = [...htmlContent.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)];
        cssMatches.forEach(([_, href]) => {
          if (href.startsWith('http')) return;
          const cssFile = href.split('/').pop();
          if (IGNORED_FILES.includes(cssFile)) return;
          const cssPath = normalizePath(`${landerDir}/${href.replace(/^\//, '')}`);
          cy.readFile(cssPath, { log: false }).then((cssContent) => checkContent(cssContent, cssFile, 'CSS'));
        });

        const jsMatches = [...htmlContent.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)];
        jsMatches.forEach(([_, src]) => {
          if (src.startsWith('http')) return;
          const jsFile = src.split('/').pop();
          if (IGNORED_FILES.includes(jsFile)) return;
          const jsPath = normalizePath(`${landerDir}/${src.replace(/^\//, '')}`);
          cy.readFile(jsPath, { log: false }).then((jsContent) => checkContent(jsContent, jsFile, 'JS'));
        });
      });
    });

    cy.then(() => {
      if (problems.length > 0) {
        throw new Error(`Обнаружены проблемы:\n\n${problems.join('\n')}`);
      }
    });
  });

  function checkContent(content, fileName, type) {
    const matches = content.match(CYRILLIC_REGEX);
    if (matches) {
      const filtered = [...new Set(matches)].filter((w) => !IGNORED_WORDS.includes(w));
      if (filtered.length > 0) problems.push(`${fileName} — Кириллица: ${filtered.join(', ')}`);
    }

    const emptyComments = content.match(EMPTY_COMMENT_PATTERNS[type]);
    if (emptyComments) problems.push(`${fileName} — Пустой комментарий`);
  }
});
