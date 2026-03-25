const landerDir = Cypress.env('landerDir');

describe('Проверка на наличие обязательных JS-файлов', () => {
  const REQUIRED_FILES = [
    'short-domain.js',
    'siteVars.js',
    'routeLinker.js',
    'form-mask.js',
    'intlTelInput.min.js',
    'formValidator.js',
  ];

  const SEARCH_PATHS = ['assets/js', 'assets/js/blocks'];

  it('Все обязательные JS-файлы должны существовать в проекте', () => {
    cy.task('checkFiles', { projectRoot: landerDir, files: REQUIRED_FILES, searchPaths: SEARCH_PATHS })
      .then((missingFiles) => {
        if (missingFiles.length) {
          throw new Error(`Не найдены обязательные JS-файлы: ${missingFiles.join(', ')}`);
        }
      });
  });
});
