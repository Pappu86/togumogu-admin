<template>
  <div class="d-flex">
    <span
      v-if="isShowContent"
      class="d-inline-block text-truncate mt-1"
      :style="width"
    >
      {{ getLink(content) }}
    </span>
    <v-btn
      v-if="content"
      class="content-copy"
      :data-clipboard-text="content"
      icon
    >
      <v-icon title="Copy short link">mdi-content-copy</v-icon>
    </v-btn>
  </div>
</template>

<script>
import Clipboard from 'clipboard';
import { toast } from '@/plugins/sweetalert';

export default {
  name: 'CopyContent',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      copied: false,
      content: this.options && this.options.content,
      width: (this.options && this.options.width) || 100,
      isShowContent: !!(this.options && this.options.isShowContent),
      isShowToast: !!(this.options && this.options.isShowToast),
      getLink(link) {
        if (link) {
          const splitArray = link.split('/');
          const newLink = splitArray[splitArray.length - 1];
          return `../${newLink}`;
        } else return '';
      },
    };
  },
  watch: {},
  created() {},
  mounted() {
    // initiate clipboard
    const clipboard = new Clipboard('.content-copy');
    clipboard.on('success', (e) => {
      if (this.isShowToast) {
        toast('Link Copied!');
      }
      e.clearSelection();
    });
  },
  methods: {},
};
</script>
