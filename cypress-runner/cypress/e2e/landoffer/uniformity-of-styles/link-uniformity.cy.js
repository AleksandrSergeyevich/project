const targetUrl = Cypress.env('targetUrl');

// Функция для преобразования RGBA в HEX
const rgbaToHex = (rgba) => {
  const rgbaValues = rgba.match(/\d+/g);
  const r = parseInt(rgbaValues[0]).toString(16).padStart(2, '0');
  const g = parseInt(rgbaValues[1]).toString(16).padStart(2, '0');
  const b = parseInt(rgbaValues[2]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
};

describe('Проверка стилей ссылок', () => {
  it('Ссылки внутри тегов <p> должны быть синими (#007fff) или красными (#e11229), исключая aside, header, footer', () => {
    cy.visit(targetUrl);

    const blueHex = '#007fff';
    const redHex = '#e11229';

    cy.get('p a:not(aside p a):not(header p a):not(footer p a)').each(($link) => {
      cy.wrap($link).then(($el) => {
        cy.wrap($el).scrollIntoView();

        const defaultColor = $el.css('color');
        const colorHex = rgbaToHex(defaultColor);

        expect(
          [blueHex, redHex].includes(colorHex),
          `Цвет ссылки должен быть ${blueHex} или ${redHex}, а не ${colorHex}`
        ).to.be.true;

        cy.wrap($el)
          .trigger('mouseover', {force: true})
          .then(() => {
            const hoverColor = $el.css('color');
            const hoverColorHex = rgbaToHex(hoverColor);

            expect(
              [blueHex, redHex].includes(hoverColorHex),
              `Цвет ссылки при наведении должен быть ${blueHex} или ${redHex}, а не ${hoverColorHex}`
            ).to.be.true;

            cy.wrap($el).trigger('mouseout', {force: true});
          });
      });
    });
  });
});
