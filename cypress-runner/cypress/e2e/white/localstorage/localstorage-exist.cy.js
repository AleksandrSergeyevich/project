const landerDir = Cypress.env('landerDir');
const normalizePath = (p) => p.replace(/\\/g, '/');

describe('Проверка блоков siteVar и siteRoutes в head', () => {
  const problems = [];

  it('Проверка всех HTML файлов', () => {
    cy.task('getHtmlFiles', landerDir).then((htmlFiles) => {
      cy.wrap(htmlFiles).each((fileName) => {
        const filePath = normalizePath(`${landerDir}/${fileName}`);

        cy.readFile(filePath).then((html) => {
          const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
          const headContent = headMatch ? headMatch[1] : '';

          const hasSiteRoutes = /localStorage\.setItem\s*\(\s*["']siteRoutes["']/.test(headContent);
          const hasSiteVar = /localStorage\.setItem\s*\(\s*["']siteVar-/.test(headContent);

          if (!hasSiteRoutes && !hasSiteVar) {
            problems.push(`${fileName}: отсутствуют оба блока siteRoutes и siteVar`);
          } else if (!hasSiteRoutes) {
            problems.push(`${fileName}: отсутствует блок siteRoutes`);
          } else if (!hasSiteVar) {
            problems.push(`${fileName}: отсутствует блок siteVar`);
          }
        });
      });

      cy.then(() => {
        if (problems.length > 0) {
          throw new Error(`Найдены проблемы:\n\n${problems.join('\n')}`);
        }
      });
    });
  });
});









// const targetUrl = Cypress.env('targetUrl');

// describe('Проверка наличия блоков siteVar и siteRoutes в head на всех страницах', () => {
//   const routes = new Set();
//   const problems = [];

//   before(() => {
//     cy.visit(targetUrl);

//     cy.window().then((win) => {
//       const stored = win.localStorage.getItem('siteRoutes');
//       if (stored) {
//         const parsed = JSON.parse(stored);
//         Object.values(parsed).forEach((path) => routes.add(path));
//       }
//     });

//     cy.get('a[href]').each(($a) => {
//       const href = $a.attr('href');
//       if (
//         href &&
//         !href.startsWith('javascript') &&
//         !href.startsWith('#') &&
//         !href.startsWith('mailto')
//       ) {
//         routes.add(href);
//       }
//     });
//   });

//   it('На всех страницах должны присутствовать блоки siteVar и siteRoutes в head', () => {
//     Array.from(routes).forEach((path) => {
//       const fullUrl = path.startsWith('http') ? path : `${targetUrl}${path}`;

//       let pageName = path;
//       if (pageName === '/' || pageName === '') {
//         pageName = 'index.html';
//       } else {
//         pageName = pageName.replace(/^\//, '');
//         if (!pageName.endsWith('.html')) pageName += '.html';
//       }

//       cy.request(fullUrl).then((resp) => {
//         if (resp.status !== 200) {
//           problems.push(`${pageName}: страница недоступна (код ${resp.status})`);
//           return;
//         }

//         const html = resp.body;
//         const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
//         const headContent = headMatch ? headMatch[1] : '';

//         const hasSiteRoutes = /localStorage\.setItem\s*\(\s*["']siteRoutes["']\s*,\s*JSON\.stringify\s*\(\s*{/.test(headContent);
//         const hasSiteVar = /localStorage\.setItem\s*\(\s*["']siteVar-[^"']+["']/.test(headContent);

//         if (!hasSiteRoutes && !hasSiteVar) {
//           problems.push(`${pageName}: отсутствуют оба блока siteRoutes и siteVar`);
//         } else {
//           if (!hasSiteRoutes) problems.push(`${pageName}: отсутствует блок siteRoutes`);
//           if (!hasSiteVar) problems.push(`${pageName}: отсутствует блок siteVar`);
//         }
//       });
//     });

//     cy.then(() => {
//       if (problems.length > 0) {
//         throw new Error(`Найдены проблемы:\n\n${problems.join('\n')}`);
//       }
//     });
//   });
// });
