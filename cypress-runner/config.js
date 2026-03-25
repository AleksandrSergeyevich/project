// const { defineConfig } = require('cypress');
// // base url доработать
// module.exports = defineConfig({
//   e2e: {
//     setupNodeEvents(on, config) {},
//     baseUrl: 'http://5.45.74.202/landers/anupria_goenka_protest_wa_aa_bbc_in/Anupria-Goenka_protest_bbc/index.php',
//   },
// });

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // если нужно, можно ловить хуки здесь
    },
    baseUrl: 'http://127.0.0.1:3000', // <-- твой локальный стенд
    env: {
      targetUrl: 'http://127.0.0.1:3000', // <-- и для Cypress.env
    }
  },
});