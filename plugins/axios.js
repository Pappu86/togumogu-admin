export default function ({ $axios }) {
  $axios.onRequest((config) => {
    config.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  });
}
