export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'ideality',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // '~/plugins/ideality.js',
    // '~/plugins/vue-lodash'
    '~/plugins/mixin.js',
    // '~/plugins/helpers.rs'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
    // 'vue-async-computed'
  ],

  auth: {
    strategies: {
      local: {
        token: {
          property: 'response.token',
          global: true
        },
        user: {
          property: 'response.id'
        },
        endpoints: {
          login: {url: 'https://ideality.app/version-test/api/1.1/wf/login', method: 'post'},
          logout: {url: 'https://ideality.app/version-test/api/1.1/wf/logout', method: 'post'},
          user: {url: 'https://ideality.app/version-test/api/1.1/wf/getUserInfo', method: 'post'}
        }
      }
    },
    redirect: false
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: 'http://localhost:3000', // Used as fallback if no runtime config is provided
  },

  publicRuntimeConfig: {
    axios: {
      browserBaseURL: process.env.BROWSER_BASE_URL
    }
  },

  privateRuntimeConfig: {
    axios: {
      baseURL: process.env.BASE_URL
    }
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    loaders: {
      vue: {
        compilerOptions: {
          preserveWhitespace: false
        }
      }
    }
    // extend(config, ctx) {
    //   if (ctx.isDev && ctx.isClient) {
    //     config.module.rules.push({
    //       enforce: 'pre',
    //       test: /\.(js|vue)$/,
    //       loader: 'eslint-loader',
    //       exclude: /(node_modules)/
    //     })
    //   }

    //   if (ctx.isDev) {
    //     config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
    //   }
    // }
  },
  
  serverMiddleware: {
    '/api': '~/api'
  },

  ssr: false
}
