const targetUrl = Cypress.env('targetUrl');

describe('Проверка чека на фон и ширину', () => {
  it('В преленде для вертикального чека должны быть заданы стили #eeeeee для блока и width: 70% для самого чека', () => {
    cy.visit(targetUrl);

    cy.document().then((doc) => {
      const block = doc.querySelector('div.horizontal_check');

      if (!block) {
        return;
      }

      let errors = [];

      const style = getComputedStyle(block);
      const bg = style.backgroundColor || '';

      const allowedColors = ['#eeeeee', 'rgb(238, 238, 238)'];
      const hasCorrectBackground = allowedColors.some((c) =>
        bg.toLowerCase().includes(c)
      );

      if (!hasCorrectBackground) {
        errors.push('Цвет фона в блоке vertical_check некорректен. Ожидаемый цвет #eeeeee');
      }

      const link = block.querySelector('a');
      const img = link ? link.querySelector('img') : null;

      if (!img) {
        errors.push('Внутри .horizontal_check отсутствует <img>');
      } else {
        const imgStyle = img.getAttribute('style') || '';
        const hasWidth70 = /width\s*:\s*70%/.test(imgStyle);

        if (!hasWidth70) { 
          errors.push('Размер изображения внутри vertical_check некорректен. Ожидаемое свойство width: 70%');
        }
      }

      if (errors.length > 0) {
        throw new Error(`Ошибки в vertical_check:\n\n${errors.join('\n')}`);
      }
    });
  });
});
