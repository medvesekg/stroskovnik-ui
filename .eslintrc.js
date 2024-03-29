module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/vue'
  ],
  plugins: [
    'prettier'
  ],
  // add your custom rules here
  rules: {
    "no-console": "off",
    "no-unreachable": "off",
    "vue/no-unused-components": "off",
    "no-unused-vars": "off",
    "vue/no-unused-vars": "off",
    "import/no-named-as-default": "off"
  }
}
