const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

describe('Проверка мета-тегов на всех страницах', () => {
  let htmlFiles = [];
  const problems = [];

  before(() => {
    cy.task('getHtmlFiles', landerDir).then((files) => {
      htmlFiles = files;
    });
  });

  it('Все страницы должны содержать корректные мета-теги', () => {
    cy.wrap(htmlFiles).each((fileName) => {
      const filePath = normalizePath(`${landerDir}/${fileName}`);

      cy.readFile(filePath, { log: false }).then((html) => {
        const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        const headContent = headMatch ? headMatch[1] : '';

        const metaMatch = headContent.match(/<meta\s+name=["']format-detection["']\s+content=["']([^"']*)["']/i);
        if (!metaMatch) {
          problems.push(`${fileName}: <meta[name="format-detection"]> отсутствует`);
        } else {
          const content = metaMatch[1].toLowerCase().replace(/\s+/g, '');
          ['telephone=no', 'date=no', 'address=no', 'email=no'].forEach((attr) => {
            if (!content.includes(attr)) {
              problems.push(`${fileName}: <meta[name="format-detection"]> не содержит "${attr}" (найдено: "${content}")`);
            }
          });
        }

        const hasUtf8 = /<meta\s+charset=["']UTF-8["']\s*\/?>/i.test(headContent);
        const hasContentType = /<meta\s+http-equiv=["']Content-Type["']\s+content=["']text\/html;\s*charset=UTF-8["']\s*\/?>/i.test(headContent);
        if (!hasUtf8 && !hasContentType) {
          problems.push(`${fileName}: отсутствует <meta charset="UTF-8"> или <meta http-equiv="Content-Type">`);
        }

        const vpMatch = headContent.match(/<meta\s+name=["']viewport["']\s+content=["']([^"']*)["']/i);
        if (!vpMatch) {
          problems.push(`${fileName}: <meta[name="viewport"]> отсутствует`);
        } else {
          const vpContent = vpMatch[1].trim();
          ['width=device-width', 'initial-scale=1.0'].forEach((part) => {
            if (!vpContent.includes(part)) {
              problems.push(`${fileName}: <meta[name="viewport"]> не содержит "${part}" (найдено: "${vpContent}")`);
            }
          });
        }
      });
    });

    cy.then(() => {
      if (problems.length > 0) {
        throw new Error(`Найдены проблемы с мета-тегами:\n\n${problems.join('\n')}`);
      }
    });
  });
});