const targetUrl = Cypress.env('targetUrl');

describe('Все ссылки в блоке <aside> некликабельные', function () {
  it('Ссылки в блоке <aside> должны быть некликабельными', function () {
    cy.visit(targetUrl);

    cy.get('aside').then(($aside) => {
      if ($aside.find('a').length > 0) {
        const asidePointerEvents = $aside.css('pointer-events');

        if (asidePointerEvents === 'none') {
          cy.log('Все ссылки в блоке aside некликабельные через pointer-events: none');
        } else if ($aside.attr('inert')) {
          cy.log('Все ссылки в блоке aside некликабельные через атрибут inert');
        } else {
          cy.wrap($aside)
            .find('a')
            .each(($link) => {
              const linkPointerEvents = $link.css('pointer-events');
              if (linkPointerEvents !== 'none' && !$link.closest('[inert]').length) {
                throw new Error(
                  'Ссылка в блоке aside кликабельна и не имеет inert или pointer-events: none'
                );
              }
            });
          cy.log(
            'Все ссылки в блоке aside некликабельные через pointer-events: none или атрибут inert'
          );
        }
      } else {
        cy.log('Блок aside не имеет ссылок');
      }
    });
  });
});
