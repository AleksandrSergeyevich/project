const targetUrl = Cypress.env('targetUrl');

describe('Проверка размера шрифта в полях формы', () => {
  it('На странице не должно быть элементов input/textarea/select с font-size меньше 16px', () => {
    cy.visit(targetUrl);
    cy.wait(500);

    cy.document().then((doc) => {
      const problems = [];
      const inputs = doc.querySelectorAll('input, textarea, select');

      if (inputs.length === 0) {
        return;
      }

      inputs.forEach((el) => {
        const computedStyle = window.getComputedStyle(el);
        const fontSize = computedStyle.fontSize;
        const sizeValue = parseFloat(fontSize);

        if (sizeValue < 16) {
          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : '';

          problems.push(
            `${tag}${id} имеет font-size ${fontSize}, ожидалось 16px`
          );
        }
      });

      if (problems.length > 0) {
        throw new Error(
          `Обнаружены поля с font-size меньше 16px:\n\n${problems.join('\n')}`
        );
      }
    });
  });
});
