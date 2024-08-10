import colors from 'vuetify/lib/util/colors';

export default {
  theme: {
    light: true,
    themes: {
      light: {
        primary: '#F0921D',
        accent: colors.grey.darken3,
        secondary: colors.amber.darken3,
        info: colors.teal.lighten1,
        warning: colors.amber.base,
        error: colors.deepOrange.accent4,
        success: colors.green.darken3,
      },
      dark: {
        primary: '#4C5CAC',
      },
    },
  },
  icons: {
    iconfont: 'mdi',
  },
};
