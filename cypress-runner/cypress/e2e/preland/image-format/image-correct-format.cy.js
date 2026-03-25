const targetUrl = Cypress.env('targetUrl');

describe('Проверка форматов изображений', function () {
  it('На странице не должно быть изображений в форматах .jpg, .png, .jpeg, конвертируй в .webp', function () {
    cy.visit(targetUrl);

    cy.get('img', {timeout: 0}).then(($imgs) => {
      if ($imgs.length > 0) {
        cy.wrap($imgs).each(($img) => {
          const src = $img.attr('src');

          if (src) {
            expect(src).not.to.match(
              /\.(jpg|jpeg|png)(\?.*)?$/,
              `Недопустимый формат изображения: ${src}`
            );
          }
        });
      }
    });
  });
});
