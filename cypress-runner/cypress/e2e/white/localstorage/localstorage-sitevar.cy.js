const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

describe('Проверка содержимого siteVar', () => {
  const problems = [];
  const allVarsByPage = {};
  const skipDiffKeys = new Set();
  let htmlFiles = [];

  const formatPath = (path) => {
    if (path === '/' || path === '') return 'index.html';
    let clean = path.replace(/^\//, '');
    if (!clean.endsWith('.html')) clean += '.html';
    return clean;
  };

  before(() => {
    cy.task('getHtmlFiles', landerDir).then((files) => {
      htmlFiles = files;
    });
  });

  it('На всех страницах siteVar присутствует и корректен', () => {
    cy.wrap(htmlFiles).each((fileName) => {
      const filePath = normalizePath(`${landerDir}/${fileName}`);

      cy.readFile(filePath).then((html) => {
        const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        const headContent = headMatch ? headMatch[1] : '';

        const regex = /localStorage\.setItem\s*\(\s*["'](siteVar-[^"']+)["']\s*,\s*["']([^"']*)["']\s*\)/g;
        const vars = {};
        let match;
        while ((match = regex.exec(headContent)) !== null) {
          vars[match[1]] = match[2].trim();
        }

        const pageName = formatPath(fileName);

        if (Object.keys(vars).length === 0) {
          problems.push(`${pageName}: не найден блок siteVar в <head>`);
        } else {
          allVarsByPage[fileName] = vars;

          Object.entries(vars).forEach(([key, value]) => {
            if (key === 'siteVar-postAddress') {
              problems.push(`${pageName}: обнаружена запрещённая переменная "siteVar-postAddress"`);
              skipDiffKeys.add(key);
            }

            if (key === 'siteVar-companyName') {
              if (value !== '{{visit.domain.short}}') {
                problems.push(
                  `${pageName}: siteVar-companyName должен быть "{{visit.domain.short}}", сейчас: "${value}"`
                );
                skipDiffKeys.add(key);
              }
            }

            if (key === 'siteVar-email') {
              if (!value.endsWith('@{{aio.visit.domain}}')) {
                problems.push(
                  `${pageName}: siteVar-email должен заканчиваться на "@{{aio.visit.domain}}", сейчас: "${value}"`
                );
                skipDiffKeys.add(key);
              }
            }
          });
        }
      });
    })
      .then(() => {
        const allKeys = new Set();
        Object.values(allVarsByPage).forEach((vars) => {
          Object.keys(vars).forEach((k) => allKeys.add(k));
        });

        allKeys.forEach((key) => {
          if (skipDiffKeys.has(key)) return;

          const valuesByPage = {};
          for (const [page, vars] of Object.entries(allVarsByPage)) {
            valuesByPage[page] = vars[key] ?? 'отсутствует';
          }

          const entries = Object.entries(valuesByPage);
          if (entries.length === 0) return;

          const freq = {};
          for (const [, v] of entries) freq[v] = (freq[v] || 0) + 1;
          const baseline = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];

          const diffs = entries.filter(([, v]) => v !== baseline);
          if (diffs.length > 0) {
            const diffList = diffs.map(([p, v]) => `${formatPath(p)} — ${v}`).join('\n');
            problems.push(`Параметр ${key} отличается на страницах:\n${diffList}`);
          }
        });

        if (problems.length > 0) {
          throw new Error(`Обнаружены проблемы с siteVar:\n\n${problems.join('\n\n')}`);
        }
      });
  });
});
