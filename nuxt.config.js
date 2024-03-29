import stroskovnik from './stroskovnik.config'
import pkg from './package'
import colors from 'vuetify/es5/util/colors'

export default {
  /*
   ** Headers of the page
   */
  ssr: true,

  render: {
    bundleRenderer: {
      runInNewContext: false,
      // Without this validation for props with type Date throws errors in dev
      // https://github.com/nuxt/nuxt.js/issues/5565
    },
  },

  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
      }
    ]
  },

  router: {
    middleware: 'auth'
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: [],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@plugins/vee-validate', 
    '@plugins/firebase', 
    '@plugins/format'
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/apollo'
  ],
  buildModules: [
    '@nuxtjs/vuetify', 
    '@nuxtjs/dotenv'
  ],


  apollo: {
    // See https://github.com/nuxt-community/apollo-module
    clientConfigs: {
      default: {
        httpEndpoint: stroskovnik.graphqlEndpoint,
        wsEndpoint: stroskovnik.wssEndpoint
      }
    },
    cookieAttributes: {
      sameSite: 'Strict'
    }
  },

  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
          options: {
            fix: true
          }
        })
      }

      config.externals = {moment: 'moment'}
    }
  }
}
