<template>
  <div>
    <Nuxt />
  </div>
</template>

<script>
export default {
  name: 'PrintLayout',
  head: {
    link: [
      {
        rel: 'stylesheet',
        href:
          'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
      },
      // {
      //   rel: 'stylesheet',
      //   href:
      //     'https://cdnjs.cloudflare.com/ajax/libs/paper-css/0.4.1/paper.min.css'
      // },
      {
        rel: 'stylesheet',
        href: '/print.css',
      },
    ],
  },
};
</script>
