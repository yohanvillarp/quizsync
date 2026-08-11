module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['step_definitions/**/*.ts', 'support/**/*.ts'],
    format: ['progress-bar', 'html:cucumber-report.html', 'json:cucumber-report.json'],
    formatOptions: { snippetInterface: 'async-await' }
  }
}
