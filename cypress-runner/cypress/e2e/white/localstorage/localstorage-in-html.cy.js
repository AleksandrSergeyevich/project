const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

describe('Проверка корректного использования siteVar переменных в разметке', () => {
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

  it('Проверяет корректное использование siteVar в HTML (data-site-var)', () => {
    cy.wrap(htmlFiles).each((fileName) => {
      const filePath = normalizePath(`${landerDir}/${fileName}`);

      cy.readFile(filePath).then((html) => {
        const extractSiteVars = (htmlContent) => {
          const regex = /localStorage\.setItem\s*\(\s*["'](siteVar-[^"']+)["']\s*,\s*["']([^"']*)["']\s*\)/g;
          const vars = {};
          let match;
          while ((match = regex.exec(htmlContent)) !== null) {
            vars[match[1]] = match[2].trim();
          }
          return vars;
        };

        const bodyHtml = html.replace(/<head[\s\S]*?<\/head>/gi, '');
        const vars = extractSiteVars(html);

        const logoMatches = [...html.matchAll(/<[^>]+data-site-var=["']logoText["'][^>]*>/gi)];
        const titleBlock = html.match(/<title[\s\S]*?<\/title>/gi) || [];
        const headerBlock = html.match(/<header[\s\S]*?<\/header>/gi) || [];
        const footerBlock = html.match(/<footer[\s\S]*?<\/footer>/gi) || [];
        const allowedZones = [...titleBlock, ...headerBlock, ...footerBlock].join('\n');

        const foundInAllowed = logoMatches.some((m) => allowedZones.includes(m[0]));
        if (!foundInAllowed) {
          pushProblem(
            fileName,
            `${formatPath(fileName)} — data-site-var="logoText" должно присутствовать в <title>, <header> или <footer>`
          );
        }

        Object.entries(vars).forEach(([key, value]) => {
          if (String(value).toLowerCase() === 'no') {
            const shortKey = key.replace(/^siteVar-/, '');
            const re = new RegExp(`data-site-var\\s*=\\s*["']${shortKey}["']`, 'i');
            if (re.test(bodyHtml)) {
              pushProblem(
                fileName,
                `${formatPath(fileName)} — переменная "${key}" имеет значение "no" и не должна использоваться в разметке`
              );
            }
          }
        });

        Object.entries(vars).forEach(([key, value]) => {
          if (value && String(value).toLowerCase() !== 'no' && !value.includes('{{') && String(value).length > 2 && !/^\d+$/.test(String(value))) {
            const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const rawRe = new RegExp(escaped, 'gi');
            const shortKey = key.replace(/^siteVar-/, '');
            const asVarRe = new RegExp(`data-site-var\\s*=\\s*["']${shortKey}["']`, 'gi');

            const rawMatches = bodyHtml.match(rawRe);
            const asVarMatches = bodyHtml.match(asVarRe);

            if (rawMatches && (!asVarMatches || asVarMatches.length < rawMatches.length)) {
              pushProblem(
                fileName,
                `${formatPath(fileName)} — значение "${value}" из ${key} встречается в тексте напрямую, без вызова через data-site-var`
              );
            }
          }
        });
      });
    });
  });

  after(() => {
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
        throw new Error(`Обнаружены проблемы с siteVar:\n\n${messages.join('\n')}`);
      }
    });
  });
});