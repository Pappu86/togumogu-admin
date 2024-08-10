export default {
  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  ssr: false,

  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: `%s | ${process.env.APP_NAME}`,
    title: process.env.APP_NAME,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Admin panel for togumogu website.',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Runtime config: https://go.nuxtjs.dev/nuxt-config
  publicRuntimeConfig: {
    appName: process.env.APP_NAME,
    apiURL: process.env.API_URL,
    apiBaseURL: process.env.API_BASE_URL,
    googleRecaptchaSiteKey: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
    fileApiUrl: `${process.env.API_BASE_URL}/file-api`,
  },

  /*
   ** Protect every route with auth middleware
   */
  router: {
    middleware: ['auth'],
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff', height: '4px' },

  /*
   ** Loading indicator
   */
  loadingIndicator: {
    name: 'rectangle-bounce',
    color: '#fff',
    background: '#F0921D',
  },

  /*
   ** Global CSS
   */
  css: [
    // app custom style
    '~/assets/style/theme.scss',
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    // filters
    '@/plugins/filters',
    // axios
    '@/plugins/axios',
    // vee-validate
    '@/plugins/vee-validate',
    // vue toasted
    '@/plugins/toast',
    // dark, light theme
    '@/plugins/theme-detect.client',
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: [
    '~/components/',
    '~/components/buttons',
    '~/components/forms',
    '~/components/headers',
    '~/components/widgets',
    '~/components/filters',
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    // dotenv
    '@nuxtjs/dotenv',
    // pwa
    '@nuxtjs/pwa',
    // nuxt auth for authentication
    '@nuxtjs/auth-next',
  ],

  /*
   ** Nuxt.js build modules
   */
  buildModules: [
    // vuetifyjs
    '@nuxtjs/vuetify',
    // eslint
    '@nuxtjs/eslint-module',
    // composition api
    '@nuxtjs/composition-api/module',
  ],

  /*
   ** Axios options
   */
  axios: {
    credentials: true,
    debug: process.env.NODE_ENV !== 'production',
  },

  // https://go.nuxtjs.dev/auth
  auth: {
    redirect: {
      login: '/auth/login',
      logout: '/auth/login',
      callback: '/auth/login',
      home: '/',
    },
    localStorage: false,
    resetOnError: true,
    strategies: {
      laravelSanctum: {
        provider: 'laravel/sanctum',
        url: process.env.API_BASE_URL,
        endpoints: {
          // (optional) If set, we send a get request to this endpoint before login
          login: {
            url: process.env.API_BASE_URL + '/admin/auth/login',
          },
          logout: {
            url: process.env.API_BASE_URL + '/admin/auth/logout',
          },
          user: {
            url: process.env.API_BASE_URL + '/admin/auth/me',
          },
        },
      },
    },
    plugins: ['@/plugins/directives'],
  },

  /*
   ** Build configuration
   */
  vuetify: {
    optionsPath: './vuetify.options.js',
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      name: process.env.APP_NAME,
      background_color: '#fff',
      theme_color: '#F0921D',
    },

    meta: {
      theme_color: '#F0921D',
    },
  },

  /*
   ** Build configuration
   */
  build: {},
};
