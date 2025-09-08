module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'none',
  printWidth: 150,
  tabWidth: 2,
  arrowParens: 'avoid',
  bracketSpacing: true,
  bracketSameLine: false,
  plugins: [
    'prettier-plugin-packagejson',
    'prettier-plugin-java'
  ],
  overrides: [
    {
      files: '*.java',
      options: {
        tabWidth: 4
      }
    }
  ]
}
