<template>
  <div id="fileManager">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card style="position: relative">
            <v-btn
              absolute
              right
              top
              fab
              dark
              icon
              class="pink"
              small
              title="Clear"
              @click="clearDropZone"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-card-text>
              <v-drop-zone
                id="drop_zone"
                ref="drop_zone"
                :options="dropzoneOptions"
                @vdropzone-success="uploadSuccess"
                @vdropzone-error="fileUploadError"
              ></v-drop-zone>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex v-if="files.length" xs12>
          <v-card>
            <v-card-title>
              <h4>All Files</h4>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-container grid-list-md text-xs-center>
                <v-layout row wrap>
                  <v-flex v-for="item in files" :key="item.id" xs12 sm3 md3>
                    <v-card>
                      <v-hover v-if="item.image">
                        <v-img
                          slot-scope="{ hover }"
                          height="200px"
                          :src="item.url"
                          :alt="item.name"
                        >
                          <v-expand-transition>
                            <div
                              v-if="hover"
                              class="d-flex orange darken-2 v-card--reveal transition-fast-in-fast-out"
                              style="height: 100%"
                            >
                              <v-chip>{{ item.name }}</v-chip>
                            </div>
                          </v-expand-transition>
                        </v-img>
                      </v-hover>
                      <v-card-text
                        v-else
                        class="d-flex align-center justify-center"
                        style="height: 200px"
                      >
                        <v-chip>{{ item.name }}</v-chip>
                      </v-card-text>
                      <v-divider />
                      <v-card-actions class="justify-center">
                        <v-btn :data-clipboard-text="item.url" class="primary">
                          Copy
                        </v-btn>
                        <v-btn class="error" @click.native="deletePhoto(item)">
                          Delete
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-card>
          <v-card class="my-3">
            <v-card-text class="text-xs-center">
              <v-pagination
                v-model="pages.page"
                :length="pages.total"
                @input="getFilesByPagination"
              ></v-pagination>
            </v-card-text>
          </v-card>
          <v-snackbar v-model="copied" top right color="success">
            Link copied!
          </v-snackbar>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import vue2Dropzone from 'vue2-dropzone';
import 'vue2-dropzone/dist/vue2Dropzone.min.css';
import Clipboard from 'clipboard';

export default {
  name: 'FileUpload',
  components: {
    vDropZone: vue2Dropzone,
  },
  data() {
    return {
      search: '',
      pages: {
        page: 1,
        total: 0,
      },
      dialog: false,
      alert: false,
      copied: false,
      files: [],
      file: {
        id: 0,
        url: '',
        alt_text: '',
        caption: '',
      },
      dropzoneOptions: {
        url: `${process.env.API_URL}/file-manager`,
        thumbnailWidth: 150,
        timeout: 3000000,
        dictDefaultMessage:
          "<i class='fa fa-upload'></i> Drop files or select files to upload",
        headers: {
          Authorization: ``,
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    };
  },
  mounted() {
    this.getFiles();

    this.dropzoneOptions.headers.Authorization = this.$auth.$storage.getCookie(
      '_token.local'
    );

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getFiles());

    // initiate clipboard
    const clipboard = new Clipboard('.v-btn');
    clipboard.on('success', (e) => {
      this.copied = true;
      e.clearSelection();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    uploadSuccess() {
      this.$store.commit('CRUD_SUCCESS_NO_ACTION', 'Successfully Uploaded!');
      this.getFiles();
    },
    fileUploadError(file, error, xhr) {
      if (xhr.status === 422) {
        const errors = error;

        const fields = Object.values(errors);
        for (let i = 0; i < fields.length; i++) {
          for (let j = 0; j < fields[i].length; j++) {
            this.$toasted.global.form_error(fields[i][j]);
          }
        }
      } else {
        this.$store.commit('APP_NETWORK_ERROR', error.message);
      }
    },
    clearDropZone() {
      this.$refs.drop_zone.removeAllFiles();
    },
    // get by pagination
    async getFilesByPagination() {
      try {
        const data = await this.$axios.$get(
          `${process.env.API_URL}/file-manager?page=${this.pages.page}`
        );
        this.files = data.data;
        this.pages.total = data.meta.last_page;
      } catch (e) {}
    },
    // get files
    async getFiles() {
      try {
        const data = await this.$axios.$get(
          `${process.env.API_URL}/file-manager?page=${this.pages.page}`
        );
        this.files = data.data;
        this.pages.total = data.meta.last_page;
      } catch (e) {}
    },
    deletePhoto(photo) {
      this.$swal
        .fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
        })
        .then((result) => {
          if (result.value) {
            this.deleteFile(photo.id);
          }
        });
    },
    async deleteFile(file) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/file-manager/${file}`
        );
        this.getFiles();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
        this.$refs.drop_zone.removeAllFiles();
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>
