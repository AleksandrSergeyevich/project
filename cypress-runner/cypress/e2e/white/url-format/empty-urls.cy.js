const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

const EMPTY_URL_PATTERNS = [
  'url("")',
  "url('')",
  'url()',
];

function containsEmptyUrl(content = '') {
  return EMPTY_URL_PATTERNS.some((p) => content.includes(p));
}

function isExternal(path) {
  return /^(https?:)?\/\//i.test(path);
}

describe('Проверка отсутствия пустых url("")', () => {
  const problems = [];
  let htmlFiles = [];

  before(() => {
    cy.task('getHtmlFiles', landerDir).then((files) => {
      htmlFiles = files;
    });
  });

  it('HTML, CSS и JS файлы не должны содержать пустых url("")', () => {
    htmlFiles.forEach((fileName) => {
      const htmlPath = normalizePath(`${landerDir}/${fileName}`);

      cy.readFile(htmlPath, { log: false }).then((html) => {
        if (containsEmptyUrl(html)) {
          problems.push(`${fileName} — пустой url("") в HTML`);
        }

        const styleBlocks = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
        styleBlocks.forEach((block) => {
          if (containsEmptyUrl(block)) {
            problems.push(`${fileName} — пустой url("") в <style>`);
          }
        });

        const inlineStyles = html.match(/style\s*=\s*["'][^"']*["']/gi) || [];
        inlineStyles.forEach((attr) => {
          if (containsEmptyUrl(attr)) {
            problems.push(`${fileName} — пустой url("") в inline-style`);
          }
        });

        const cssLinks = [...html.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/gi)];
        cssLinks.forEach(([, href]) => {
          if (isExternal(href)) return;

          const cssPath = normalizePath(`${landerDir}/${href.replace(/^\//, '')}`);
          cy.readFile(cssPath, { log: false }).then(
            (css) => {
              if (containsEmptyUrl(css)) {
                problems.push(`${fileName} → ${href} — пустой url("") в CSS`);
              }
            },
            () => {
              problems.push(`${fileName} → ${href} — CSS файл не найден`);
            }
          );
        });

        const jsScripts = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/gi)];
        jsScripts.forEach(([, src]) => {
          if (isExternal(src)) return;

          const jsPath = normalizePath(`${landerDir}/${src.replace(/^\//, '')}`);
          cy.readFile(jsPath, { log: false }).then(
            (js) => {
              if (containsEmptyUrl(js)) {
                problems.push(`${fileName} → ${src} — пустой url("") в JS`);
              }
            },
            () => {
              problems.push(`${fileName} → ${src} — JS файл не найден`);
            }
          );
        });
      });
    });

    cy.then(() => {
      if (problems.length > 0) {
        throw new Error(
          `Найдены пустые url(""):\n\n${problems.join('\n')}`
        );
      }
    });
  });
});
