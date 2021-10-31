export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Ideality 🔺 AI-driven ideation platform',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 
        'Ideality is a set of AI-driven ideation tools built to make ideas come to life. ' +
        'Whether it’s about yourself or your users and customers, Ideality helps explore, ' + 
        'refine and flesh out that will one day change the world.' },
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
    '@nuxtjs/markdownit'
  ],

  markdownit: {
    runtime: true
  },

  auth: {
    strategies: {
      local: {
        token: {
          property: 'response.token',
          global: true
        },
        user: {
          property: 'user'
        },
        endpoints: {
          login: {url: 'https://b.ideality.app/api/1.1/wf/login', method: 'post'},
          logout: {url: 'https://b.ideality.app/api/1.1/wf/logout', method: 'post'},
          // user: false
          user: {url: 'api/auth/user'}
          // user: {url: 'https://b.ideality.app/api/1.1/wf/getUserInfo', method: 'post'}
        }
      }
    },
    redirect: {
      logout: '/'
    }
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: 'http://localhost:3000', // Used as fallback if no runtime config is provided
  },

  publicRuntimeConfig: {
    axios: {
      browserBaseURL: process.env.BROWSER_BASE_URL || 'http://localhost:3000/'
    }
  },

  privateRuntimeConfig: {
    axios: {
      baseURL: process.env.BASE_URL || 'http://localhost:3000/'
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
    '/api/': '~/api/'
  },

  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js',
      type: 'text/javascript'
    }
  ],
  ssr: false
}
