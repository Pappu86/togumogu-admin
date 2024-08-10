<template>
  <div>
    <div :class="!isFieldValid() ? 'editor-invalid' : ''">
      <editor
        :id="editorId"
        v-model="innerValue"
        :rules="options.rules"
        :class="className"
        :init="init"
        :plugins="plugins"
        :toolbar="toolbar"
      ></editor>
      <div class="invalid-message">
        <small> The {{ options.fieldName }} field is required! </small>
      </div>
    </div>
    <v-dialog v-model="mediaDialog" scrollable max-width="93vw">
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Upload Files</span>
          <v-btn icon dark class="ma-0" @click.stop="mediaDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <media-library @use="useThisFile" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// Import TinyMCE
// eslint-disable-next-line no-unused-vars
import tinymce from 'tinymce/tinymce';
// A theme is also required
import 'tinymce/themes/silver';

// import plugins
import 'tinymce/plugins/print';
import 'tinymce/plugins/code';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/link';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/image';
import 'tinymce/plugins/media';
import 'tinymce/plugins/template';
import 'tinymce/plugins/table';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/toc';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/spellchecker';
import 'tinymce/plugins/textpattern';
import 'tinymce/plugins/help';
import 'tinymce/icons/default';

import Editor from '@tinymce/tinymce-vue';
import Cookie from 'js-cookie';

export default {
  name: 'BRichTextEditor',
  components: { Editor },
  props: {
    editorId: {
      type: String,
      default: 'content',
    },
    className: {
      type: String,
      default: 'mb-5',
    },
    options: {
      type: Object,
      default: () => {
        return {
          rules: '',
        };
      },
    },
    // must be included in props
    value: {
      type: null,
      default: null,
    },
  },
  data() {
    return {
      innerValue: '',
      mediaDialog: false,
      isFieldValid: () => {
        if (this.options && !this.options.rules) return true;
        else if (this.options && this.options.rules && !this.innerValue) {
          return false;
        } else return true;
      },
      toolbar:
        'fullscreen | formatselect | fontselect fontsizeselect | bold italic underline strikethrough forecolor backcolor | link insertdatetime code | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | spellchecker searchreplace removeformat | image media | custom',
      plugins:
        'print code preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template table charmap hr pagebreak nonbreaking searchreplace anchor toc insertdatetime advlist lists wordcount spellchecker textpattern  help insertdatetime media',
      init: {
        height: this.options && this.options.height ? this.options.height : 400,
        content_css: window.matchMedia('(prefers-color-scheme: dark)').matches
          ? '/skins/content/dark/content.css'
          : '/skins/content/default/content.css',
        skin_url: window.matchMedia('(prefers-color-scheme: dark)').matches
          ? '/skins/ui/oxide-dark'
          : '/skins/ui/oxide',
        toolbar_mode: 'wrap',
        image_caption: true,
        browser_spellcheck: true,
        relative_urls: false,
        remove_script_host: false,
        convert_urls: true,
        images_upload_handler(blobInfo, success, failure) {
          const xhr = new XMLHttpRequest();
          xhr.withCredentials = true;
          xhr.open('POST', `${process.env.API_URL}/asset`);
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          xhr.setRequestHeader('X-XSRF-TOKEN', Cookie.get('XSRF-TOKEN'));

          xhr.onload = function () {
            if (xhr.status !== 201) {
              failure('HTTP Error: ' + xhr.status);
              return;
            }

            const response = JSON.parse(xhr.response);
            if (response && response.location) success(response.location);
          };

          const formData = new FormData();
          formData.append('file', blobInfo.blob(), blobInfo.filename());

          xhr.send(formData);
        },
        // It's component/parent instance
        compInstance: this,
        setup(editor) {
          const instance = this.compInstance;
          editor.ui.registry.addButton('custom', {
            text: 'Insert image',
            onAction() {
              instance.mediaDialog = true;
              instance.editor = editor;
              instance.dailog_type = '';
            },
          });
        },
      },
    };
  },
  watch: {
    // Handles internal model changes.
    innerValue(newVal) {
      this.$emit('input', newVal);
    },
    // Handles external model changes.
    value(newVal) {
      this.innerValue = newVal;
    },
  },
  created() {
    if (this.value) {
      this.innerValue = this.value;
    }
  },
  methods: {
    useThisFile(event) {
      // It's worked in rich editor
      let tagName = 'img';
      let fileName = '';
      let options = { src: event.url };

      if (event.media_type === 'Videos') {
        tagName = 'iframe';
      } else if (event.media_type === 'Audio') {
        tagName = 'audio';
        options = { src: event.url, controls: 'controls' };
      } else if (event.media_type === 'Applications') {
        tagName = 'a';
        options = { href: event.url };
        fileName = event.name;
      }

      // Asset insert in editor
      const insertableItem = this.editor.dom.createHTML(
        tagName,
        options,
        fileName
      );
      this.editor.insertContent(insertableItem);
      this.editor = null;
      this.mediaDialog = false;
    },
  },
};
</script>
