const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

function walkDir(dir, ext, result = []) {
  const entries = fs.readdirSync(dir);
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, ext, result);
    } else if (entry.endsWith(ext)) {
      result.push(fullPath.replace(/\\/g, '/'));
    }
  });
  return result;
}

module.exports = defineConfig({
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/results/.raw',
    overwrite: false,
    html: false,
    json: true,
  },

  env: {
    targetUrl: process.env.TARGET_URL || 'http://web:3000',
  },

  defaultCommandTimeout: 5000,
  viewportWidth: 1400,
  viewportHeight: 600,

  component: {
    viewportWidth: 500,
    viewportHeight: 500,
  },

  e2e: {
    defaultCommandTimeout: 10000,
    baseUrl: process.env.BASE_URL || 'http://web:3000',

    setupNodeEvents(on, config) {
      // Подключаем плагин для БД
      require('./plugins/db-reporter.js')(on, config);

      // Ваши существующие задачи
      on('task', {
        getHtmlFiles(folderPath) {
          const absolutePath = path.resolve(folderPath);
          return walkDir(absolutePath, '.html').map((file) =>
            path.relative(process.cwd(), file)
          );
        },
        getCssFiles(folderPath) {
          const absolutePath = path.resolve(folderPath);
          return walkDir(absolutePath, '.css').map((file) =>
            path.relative(process.cwd(), file)
          );
        },
        checkFiles({ projectRoot, files, searchPaths }) {
          const missing = [];
          files.forEach((file) => {
            let found = false;
            searchPaths.forEach((folder) => {
              const filePath = path.join(projectRoot, folder, file);
              if (fs.existsSync(filePath)) found = true;
            });
            if (!found) missing.push(file);
          });
          return missing;
        },
        checkFileExists(filePath) {
          return fs.existsSync(path.resolve(filePath));
        },
      });

      return config;
    },
  },
});