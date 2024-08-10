<template>
  <div id="postEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="post" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Post</h4>
                  <v-spacer></v-spacer>
                  <v-chip text-color="black" color="success">
                    {{ post.status ? 'Published' : 'Saved' }}
                  </v-chip>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-text
                    v-model="post.title"
                    outlined
                    label="Title"
                    counter="180"
                    @blur="checkSlug"
                  />
                  <b-text
                    v-model="post.slug"
                    rules="required"
                    outlined
                    label="Slug"
                  />

                  <v-subheader class="pa-0">Content</v-subheader>
                  <b-rich-text-editor
                    v-model="post.content"
                    editor-id="postContent"
                    :options="{
                      rules: 'required',
                      fieldName: 'content',
                    }"
                    class-name="mt-4"
                  />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Publish</h4>
                  <v-spacer />
                </v-card-title>
                <v-divider />
                <v-card-actions class="justify-center pb-5">
                  <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                  <v-btn
                    outlined
                    color="primary"
                    :disabled="invalid"
                    @click="handleSubmit(onSubmit(0))"
                  >
                    Save
                  </v-btn>
                  <v-btn
                    id="publishBtn"
                    outlined
                    color="success"
                    :disabled="invalid"
                    @click="handleSubmit(onSubmit(1))"
                  >
                    Publish
                  </v-btn>
                </v-card-actions>
              </v-card>

              <v-card class="mb-4 pb-3">
                <v-card-title>
                  <h4>Topics</h4>
                </v-card-title>
                <v-divider />
                <v-sheet class="pa-4 primary lighten-2">
                  <v-text-field
                    v-model="topicsList"
                    label="Search topic"
                    dark
                    flat
                    solo-inverted
                    hide-details
                    clearable
                    clear-icon="mdi-close-circle-outline"
                  ></v-text-field>
                </v-sheet>
                <scrollbar style="height: 500px">
                  <v-treeview
                    v-model="post.topics"
                    :items="topics"
                    :search="topic"
                    selectable
                    return-object
                  ></v-treeview>
                </scrollbar>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>HashTag</h4>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-auto-complete
                    v-model="post.hashtags"
                    :items="hashtags"
                    item-text="name"
                    item-value="id"
                    outlined
                    return-object
                    multiple
                    label="Select hashtag"
                    hide-details
                  />
                </v-card-text>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Images</h4>
                </v-card-title>
                <v-divider />
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-subheader>Featured Image</v-subheader>
                    <v-btn
                      v-if="post.image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="post.image !== null">
                      <v-img :src="post.image" />
                      <v-card-actions class="justify-center">
                        <v-btn
                          color="teal"
                          outlined
                          @click.stop="openDialog('image')"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          color="pink"
                          outlined
                          @click="removeImage('image')"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-card-actions>
                    </template>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
    <v-dialog v-model="mediaDialog" scrollable max-width="90vw">
      <v-card id="mediaDialog">
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
import MediaLibrary from '@/components/MediaLibrary';

export default {
  name: 'PostEdit',
  components: { MediaLibrary },
  data() {
    const defaultForm = Object.freeze({
      topics: [],
      title: '',
      slug: '',
      content: '',
      datetime: null,
      hashtags: [],
      status: 0,
      image: null,
    });

    return {
      post: Object.assign({}, defaultForm),
      dailog_type: 'image',
      mediaDialog: false,
      dateModal: false,
      timeModal: false,
      topic: '',
      topics: [],
      hashtags: [],
      loading: false,
    };
  },
  watch: {
    language() {
      this.getPost();
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([
      this.getCategories(),
      this.getTags(),
      this.getFilters(),
    ]).then(() => this.getPost());

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCategories();
      this.getFilters();
      this.getTags();
      this.getPost();
    });
  },
  methods: {
    openDialog(type) {
      this.dailog_type = type;
      this.mediaDialog = true;
    },
    removeImage(type) {
      this.dailog_type = null;
      switch (type) {
        case 'image':
          this.video.image = null;
          break;
        case 'meta_image':
          this.video.meta_image = null;
          break;
      }
    },
    useThisFile(event) {
      switch (this.dailog_type) {
        case 'image':
          this.video.image = event.url;
          break;
        case 'meta_image':
          this.video.meta_image = event.url;
          break;
      }
      this.mediaDialog = false;
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/video/video/slug/${encodeURIComponent(
            this.video.title
          )}`
        );

        this.video.slug = slug;
      } catch (e) {
        this.video.slug = null;
      }
    },
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/video/category-tree`
        );
        this.categories = data;
      } catch (e) {}
    },
    async getTags() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/common/tag-all`
        );
        this.tags = data;
      } catch (e) {}
    },
    onSubmit(status) {
      this.post.status = status;
      this.publishPost();
    },
    async publishPost() {
      this.loading = true;

      try {
        const { message } = await this.$axios.$patch(
          `community/post/${this.post.id}`,
          this.post
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/community/posts',
        });
      } catch (err) {
        this.loading = false;
        if (err.response.status === 422) {
          const { errors } = err.response.data;
          const fields = Object.values(errors);
          for (let i = 0; i < fields.length; i++) {
            for (let j = 0; j < fields[i].length; j++) {
              this.$toasted.global.form_error(fields[i][j]);
            }
          }
        } else {
          this.$store.commit(
            'APP_NETWORK_ERROR',
            err.response && err.response.data.message
          );
        }
      }
    },
    async getPost() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/community/post/${this.$route.params.id}/edit`
        );
        this.post = Object.assign({}, data);
      } catch (e) {
        this.$router.replace('/community/posts');
      }
    },
  },
};
</script>
