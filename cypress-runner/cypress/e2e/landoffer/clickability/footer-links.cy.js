const targetUrl = Cypress.env('targetUrl');

describe('Все ссылки в блоке <footer> некликабельные', function () {
  it('Ссылки в блоке <footer> должны быть некликабельными', function () {
    cy.visit(targetUrl);

    cy.get('footer').then(($footer) => {
      if ($footer.find('a').length > 0) {
        const footerPointerEvents = $footer.css('pointer-events');

        if (footerPointerEvents === 'none') {
          cy.log('Все ссылки в блоке footer некликабельные через pointer-events: none');
        } else if ($footer.attr('inert')) {
          // Если у footer есть атрибут inert
          cy.log('Все ссылки в блоке footer некликабельные через атрибут inert');
        } else {
          cy.wrap($footer)
            .find('a')
            .each(($link) => {
              const linkPointerEvents = $link.css('pointer-events');
              if (linkPointerEvents !== 'none' && !$link.closest('[inert]').length) {
                throw new Error(
                  'Ссылка в блоке footer кликабельна и не имеет inert или pointer-events: none'
                );
              }
            });
          cy.log(
            'Все ссылки в блоке footer некликабельные через pointer-events: none или атрибут inert'
          );
        }
      } else {
        cy.log('Блок footer не имеет ссылок');
      }
    });
  });
});
