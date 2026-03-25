// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

Cypress.Commands.add('removeSkippedElements', () => {
  cy.document().then((doc) => {
    const elementsToRemove = [];

    // Проходим по всем узлам документа
    doc.querySelectorAll('*').forEach((element) => {
      const previousSibling = element.previousSibling;
      if (
        previousSibling &&
        previousSibling.nodeType === Node.COMMENT_NODE &&
        previousSibling.nodeValue.trim() === 'skip test'
      ) {
        // Если перед элементом есть комментарий <!-- skip test -->, добавляем в список для удаления
        elementsToRemove.push(element);
      }
    });

    // Удаляем все элементы, помеченные для пропуска
    elementsToRemove.forEach((el) => el.parentNode.removeChild(el));

    // Обязательно дожидаемся завершения операции
    return cy.wrap(null);
  });
});
