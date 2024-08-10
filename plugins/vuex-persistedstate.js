import createPersistedState from 'vuex-persistedstate';
import Cookies from 'js-cookie';
import { addHours } from 'date-fns';
export default ({ store, isDev }) => {
  createPersistedState({
    storage: {
      getItem: (key) => Cookies.get(key),
      setItem: (key, value) =>
        Cookies.set(key, value, {
          expires: addHours(new Date(), 2),
          secure: !isDev,
        }),
      removeItem: (key) => Cookies.remove(key),
    },
    key: 'vuex',
    paths: ['auth'],
  })(store);
};
