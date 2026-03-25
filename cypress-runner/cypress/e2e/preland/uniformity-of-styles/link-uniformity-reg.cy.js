const targetUrl = Cypress.env('targetUrl');

describe('Проверка CSS-стилей кнопки регистрации', () => {

  function rgbToHex(color) {
    if (!color) return null;

    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!m) return null;

    return (
      '#' +
      [m[1], m[2], m[3]]
        .map((n) => parseInt(n, 10).toString(16).padStart(2, '0'))
        .join('')
    ).toLowerCase();
  }

  it('Цвет кнопки регистрации и её hover-цвет должны соответствовать: #007fff ⇄ #e11229. Цвет текста – белый во всех состояниях кнопки', () => {
    cy.visit(targetUrl);

    cy.get('a[href*="&place=button"]').should('exist').then(($btn) => {
      const el = $btn[0];
      const className = [...el.classList].join('.');
      if (!className) throw new Error('У кнопки нет класса для проверки CSS.');

      const selector = '.' + className;
      const selectorHover = selector + ':hover';

      const RED = '#e11229';
      const BLUE = '#007fff';
      const WHITE = '#ffffff';

      cy.document().then((doc) => {
        const sheets = [...doc.styleSheets];
        let normalBg, hoverBg, textColor;

        for (const sheet of sheets) {
          let rules;
          try {
            rules = sheet.cssRules || sheet.rules;
          } catch (e) {
            continue;
          }
          if (!rules) continue;

          for (const rule of rules) {
            if (!rule.selectorText) continue;

            if (rule.selectorText === selector && rule.style.backgroundColor) {
              normalBg = rule.style.backgroundColor;
            }
            if (rule.selectorText === selector && rule.style.color) {
              textColor = rule.style.color;
            }
            if (rule.selectorText === selectorHover && rule.style.backgroundColor) {
              hoverBg = rule.style.backgroundColor;
            }
          }
        }

        if (!normalBg) throw new Error(`Не найден background для нормального состояния: ${selector}`);
        if (!hoverBg) throw new Error(`Не найден background для hover: ${selectorHover}`);
        if (!textColor) throw new Error(`Не найден цвет текста кнопки: ${selector}`);

        const normalHex = rgbToHex(normalBg);
        const hoverHex = rgbToHex(hoverBg);
        const textHex = rgbToHex(textColor);

        cy.log(`Normal background: ${normalHex}`);
        cy.log(`Hover background: ${hoverHex}`);
        cy.log(`Text color: ${textHex}`);

        const allowed = [RED, BLUE];
        const opposite = { [RED]: BLUE, [BLUE]: RED };

        if (!allowed.includes(normalHex)) {
          throw new Error(`Некорректный цвет кнопки: ${normalHex}. Ожидается ${RED} или ${BLUE}`);
        }

        if (hoverHex !== opposite[normalHex]) {
          throw new Error(`Некорректный hover-цвет кнопки. Ожидается ${opposite[normalHex]}, получено: ${hoverHex}`);
        }

        if (textHex !== WHITE) {
          throw new Error(`Цвет текста кнопки должен быть белым. Ожидается #ffffff, получено: ${textHex}`);
        }
      });
    });
  });
});