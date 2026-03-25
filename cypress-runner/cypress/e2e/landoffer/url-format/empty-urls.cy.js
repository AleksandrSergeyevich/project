const targetUrl = Cypress.env('targetUrl');

function containsEmptyUrl(content) {
  const emptyUrlPatterns = ['url("")', "url('')", 'url()'];
  return emptyUrlPatterns.some((pattern) => content.includes(pattern));
}

describe('Проверка отсутствия пустых url("") в файлах', function () {
  it('HTML-файлы не должны содержать пустых url("")', function () {
    cy.visit(targetUrl);

    cy.document().then((doc) => {
      const htmlContent = doc.documentElement.outerHTML;
      if (containsEmptyUrl(htmlContent)) {
        throw new Error('В HTML найдены пустые url("").');
      }
    });
  });

  it('CSS-файлы не должны содержать пустых url("")', function () {
    cy.visit(targetUrl);

    cy.document().then((doc) => {
      const linkElements = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
      if (!linkElements.length) return;

      const requests = linkElements.map((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        return cy.request({url: href, failOnStatusCode: false}).then((response) => {
          if (response.status === 200 && typeof response.body === 'string') {
            if (containsEmptyUrl(response.body)) {
              throw new Error(`В CSS-файле ${href} найдены пустые url("").`);
            }
          }
        });
      });

      return Cypress.Promise.all(requests);
    });
  });

  it('JS-файлы не должны содержать пустых url("")', function () {
    cy.visit(targetUrl);

    cy.document().then((doc) => {
      const scriptElements = Array.from(doc.querySelectorAll('script[src]'));
      if (!scriptElements.length) return;

      const requests = scriptElements.map((script) => {
        const src = script.getAttribute('src');
        if (!src) return;

        return cy.request({url: src, failOnStatusCode: false}).then((response) => {
          if (response.status === 200 && typeof response.body === 'string') {
            if (containsEmptyUrl(response.body)) {
              throw new Error(`В JS-файле ${src} найдены пустые url("").`);
            }
          }
        });
      });

      return Cypress.Promise.all(requests);
    });
  });

  it('Встроенные стили не должны содержать пустых url("")', function () {
    cy.visit(targetUrl);

    cy.document().then((doc) => {
      const styleElements = Array.from(doc.querySelectorAll('style'));
      if (!styleElements.length) return;

      styleElements.forEach((styleEl) => {
        const content = styleEl.textContent || '';
        if (containsEmptyUrl(content)) {
          throw new Error('Во встроенных стилях найдены пустые url("").');
        }
      });
    });
  });

  it('Инлайн-стили не должны содержать пустых url("")', function () {
    cy.visit(targetUrl);

    cy.document().then((doc) => {
      const inlineStyledElements = Array.from(doc.querySelectorAll('[style]'));
      if (!inlineStyledElements.length) return;

      inlineStyledElements.forEach((el) => {
        const styleAttr = el.getAttribute('style') || '';
        if (containsEmptyUrl(styleAttr)) {
          throw new Error('В инлайн-стилях найдены пустые url("").');
        }
      });
    });
  });
});
