const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

function isSimilar(a, b) {
  if (!a || !b) return false;
  const shorter = a.length < b.length ? a : b;
  const longer = a.length >= b.length ? a : b;
  const distance = levenshteinDistance(shorter, longer);
  return distance <= 3;
}

function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

describe('Проверка корректности siteRoutes', () => {
  const routes = new Set();
  const siteRoutesData = {};
  const problems = [];
  let htmlFiles = [];

  before(() => {
    cy.task('getHtmlFiles', landerDir).then((files) => {
      htmlFiles = files;
    });
  });

  it('Проверяет siteRoutes на всех страницах', () => {
    cy.wrap(htmlFiles).each((fileName) => {
      const filePath = normalizePath(`${landerDir}/${fileName}`);

      cy.readFile(filePath).then((html) => {
        const match = html.match(
          /localStorage\.setItem\s*\(\s*["']siteRoutes["']\s*,\s*JSON\.stringify\s*\(([\s\S]*?)\)\s*\)/i
        );

        if (!match) {
          problems.push(`${fileName}: отсутствует блок siteRoutes`);
          return;
        }

        try {
          const jsonText = match[1].replace(/^[\s\n]+|[\s\n]+$/g, '').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          const parsed = eval('(' + jsonText + ')'); 
          siteRoutesData[fileName] = parsed;
        } catch (e) {
          problems.push(`${fileName}: ошибка парсинга JSON в siteRoutes (${e.message})`);
        }
      });
    })
      .then(() => {
        const pages = Object.keys(siteRoutesData);
        if (pages.length === 0) {
          throw new Error('Не найдено ни одного блока siteRoutes для сравнения.');
        }

        const referencePage = pages.includes('index.html') ? 'index.html' : pages[0];
        const reference = siteRoutesData[referencePage];
        const seenPairs = new Set();

        const findDiffs = (ref, current, pageName) => {
          const diffs = [];
          const allKeys = new Set([...Object.keys(ref), ...Object.keys(current)]);

          allKeys.forEach((key) => {
            if (!(key in current)) {
              const similar = Object.keys(current).find((k) => isSimilar(k, key));
              if (similar) {
                const pair = [key, similar].sort().join('|');
                if (!seenPairs.has(pair)) {
                  diffs.push(`${pageName}: Параметр "${similar}" ожидается: "${key}"`);
                  seenPairs.add(pair);
                }
              } else {
                diffs.push(`${pageName}: Отсутствует параметр "${key}"`);
              }
            } else if (!(key in ref)) {
              const similar = Object.keys(ref).find((k) => isSimilar(k, key));
              if (similar) {
                const pair = [key, similar].sort().join('|');
                if (!seenPairs.has(pair)) {
                  diffs.push(`${pageName}: Параметр "${key}" ожидается: "${similar}"`);
                  seenPairs.add(pair);
                }
              } else {
                diffs.push(`${pageName}: Лишний параметр "${key}"`);
              }
            } else if (ref[key] !== current[key]) {
              diffs.push(
                `${pageName}: Параметр "${key}" отличается (ожидалось "${ref[key]}", сейчас "${current[key]}")`
              );
            }
          });

          return diffs;
        };

        pages.forEach((page) => {
          if (page === referencePage) return;
          const diffs = findDiffs(reference, siteRoutesData[page], page);
          problems.push(...diffs);
        });
      })
      .then(() => {
        if (problems.length > 0) {
          throw new Error(`Найдены проблемы с siteRoutes:\n\n${problems.join('\n')}`);
        }
      });
  });
});