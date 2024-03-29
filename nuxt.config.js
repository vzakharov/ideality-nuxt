const coffeeLoader = require('coffee-loader')

if (!global.coffeeScriptRegistered) {
  require('coffeescript/register')
  global.coffeeScriptRegistered = true
}


export default {

  env: {
    NUXT_ENV_BUBBLE_URL: process.env.NUXT_ENV_BUBBLE_URL || 'https://b.ideality.app/api/1.1/',
    NUXT_ENV_LOGMODE: process.env.NUXT_ENV_LOGMODE
  },

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
      { name: 'format-detection', content: 'telephone=no' },
      { hid: 'og:title', name: 'og:title', content: 'Ideality 🔺 AI-driven ideation platform' },
      { hid: 'og:description', name: 'og:description', content: 'Ideality is a set of AI-driven tools built to make ideas come to life. Ideality helps explore, refine and flesh out ideas that will one day change the world.' },
      { hid: 'og:image', name: 'og:image', content: 'https://ideality.app/image.png'}
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
    '~/plugins/mixin.js',
    '~/plugins/vue-reactive-refs.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    ['bootstrap-vue/nuxt', {icons: true}],
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
    // 'vue-async-computed'
    '@nuxtjs/markdownit',
    ['nuxt-clipboard', { autoSetContainer: true }],
    // coffee script
    'nuxt-coffeescript-module'
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
          login: {url: process.env.NUXT_ENV_BUBBLE_URL+'wf/login', method: 'post'},
          logout: {url: process.env.NUXT_ENV_BUBBLE_URL+'wf/logout', method: 'post'},
          user: false
        }
      }
    },
    redirect: {
      logout: '/',
      login: false
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
    },

    // Use coffee-loader for .coffee files

    extend (config) {
      config.module.rules.push({
        test: /\.coffee$/,
        loader: coffeeLoader
      })
    }

  },

  server: {
    port: process.env.PORT || 80,
  },
  
  serverMiddleware: {
    '/api/': '~/api/',
    '/api/notion/': '~/api/notion/',
    '/api/eli5': '~/api/eli5/',
    '/api/mindy': '~/api/mindy',
    '/api/polygon': '~/api/polygon/index.coffee',
  },

  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js',
      type: 'text/javascript'
    }
  ],
  ssr: process.env.SSR || false
}
