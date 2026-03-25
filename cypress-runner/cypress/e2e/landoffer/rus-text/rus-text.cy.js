const targetUrl = Cypress.env('targetUrl');

describe('Проверка на кириллицу и пустые комментарии в CSS, JS и HTML', () => {
  const problems = [];
  const checkedCss = new Set();

  const findCyrillic = (text) => {
    const matches = text.match(/[А-Яа-яЁё]/g);
    return matches ? matches.join('') : null;
  };

  const findEmptyComments = (text, type) => {
    const patterns = {
      HTML: /<!--\s*-->/g,
      CSS: /\/\*\s*\*\//g,
      JS: /(?:\/\/\s*$)|(?:\/\*\s*\*\/)/gm,
    };
    return text.match(patterns[type]) || null;
  };

  const resolveImportUrl = (parentUrl, importPath) => {
    if (importPath.startsWith('http')) return importPath;
    const base = parentUrl.split('/').slice(0, -1).join('/');
    const normalized = importPath.replace(/^\.?\//, '');
    return `${base}/${normalized}`;
  };

  function checkCssRecursively(cssUrl) {
    if (checkedCss.has(cssUrl)) return;
    checkedCss.add(cssUrl);

    cy.request({ url: cssUrl, failOnStatusCode: false }).then((resp) => {
      if (resp.status !== 200) return;

      const css = resp.body;
      const fileName = cssUrl.split('/').pop();

      const foundCyr = findCyrillic(css);
      if (foundCyr)
        problems.push(`${fileName}: Кириллица: ${foundCyr}`);

      const foundComments = findEmptyComments(css, 'CSS');
      if (foundComments)
        problems.push(`${fileName}: Пустой комментарий`);

      const imports = [...css.matchAll(/@import\s+['"]([^'"]+)['"]/gi)];
      for (const imp of imports) {
        const importHref = imp[1];
        const resolvedUrl = resolveImportUrl(cssUrl, importHref);
        checkCssRecursively(resolvedUrl);
      }
    });
  }

  it('Не должно быть кириллицы и пустых комментариев в HTML, CSS и JS', () => {
    cy.visit(targetUrl);

    cy.get('link[rel="stylesheet"]').each(($link) => {
      const href = $link.prop('href');
      if (href) {
        const cssUrl = href.startsWith('http')
          ? href
          : `${targetUrl.replace(/\/$/, '')}/${href.replace(/^\.?\//, '')}`;
        checkCssRecursively(cssUrl);
      }
    });

    cy.get('script[src]').each(($script) => {
      const src = $script.prop('src');
      if (src) {
        const jsUrl = src.startsWith('http')
          ? src
          : `${targetUrl.replace(/\/$/, '')}/${src.replace(/^\.?\//, '')}`;
        cy.request({ url: jsUrl, failOnStatusCode: false }).then((resp) => {
          const body = resp.body;
          const fileName = jsUrl.split('/').pop();

          const foundCyr = findCyrillic(body);
          if (foundCyr)
            problems.push(`${fileName}: Кириллица: ${foundCyr}`);

          const foundComments = findEmptyComments(body, 'JS');
          if (foundComments)
            problems.push(`${fileName}: Пустой комментарий`);
        });
      }
    });

    cy.document().then((doc) => {
      const html = doc.documentElement.outerHTML;

      const foundCyr = findCyrillic(html);
      if (foundCyr)
        problems.push(`index.html: Кириллица: ${foundCyr}`);

      const foundComments = findEmptyComments(html, 'HTML');
      if (foundComments)
        problems.push(`index.html: Пустой комментарий`);
    });
  });

  after(() => {
    cy.then(() => {
      if (problems.length > 0) {
        const message = problems.join('\n');
        throw new Error(`Обнаружены проблемы:\n\n${message}`);
      }
    });
  });
});