<template>
  <div id="articleEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="article" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Article</h4>
                  <v-spacer></v-spacer>
                  <v-chip text-color="black" color="success">
                    {{ article.status ? 'Published' : 'Saved' }}
                  </v-chip>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-text
                    v-model="article.title"
                    rules="required|min:10|max:180"
                    outlined
                    label="Title"
                    counter="180"
                    @blur="checkSlug"
                  />
                  <b-text
                    v-model="article.slug"
                    rules="required"
                    outlined
                    label="Slug"
                  />
                  <b-text-area
                    v-model="article.excerpt"
                    rules="required|min:10"
                    outlined
                    label="Excerpt"
                  />
                  <v-subheader class="pa-0">Content</v-subheader>
                  <b-rich-text-editor
                    v-model="article.content"
                    editor-id="content"
                    :options="{
                      fieldName: 'content',
                      rules: 'required',
                    }"
                    class-name="mt-4"
                  />
                  <br />
                  <b-text
                    v-model="article.meta_title"
                    rules="min:10|max:180"
                    outlined
                    label="Meta Title"
                    counter="180"
                  />
                  <b-text-area
                    v-model="article.meta_description"
                    rules="min:10"
                    outlined
                    label="Meta Description"
                  />
                  <b-text-area
                    v-model="article.meta_keyword"
                    rules="min:10"
                    outlined
                    label="Meta Keyword"
                  />
                  <b-text
                    v-model="article.video_url"
                    outlined
                    label="Video url"
                  />
                  <b-text
                    v-model="article.audio_url"
                    outlined
                    label="Audio url"
                  />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Publish</h4>
                  <v-spacer />
                  <b-language v-model="language" />
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-date-time
                    v-model="article.datetime"
                    rules="required"
                    outlined
                    prepend-icon="mdi-calendar"
                    label="Article Publish Date"
                    hide-details
                  />
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-checkbox
                        v-model="article.is_featured"
                        label="Is Featured?"
                        color="primary"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-checkbox
                        v-model="article.send_push"
                        label="Send Push Notification"
                        color="primary"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions class="justify-center pb-5">
                  <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                  <v-btn
                    outlined
                    color="primary"
                    :disabled="invalid || invalidTrackerDate"
                    @click="handleSubmit(onSubmit(0))"
                  >
                    Save
                  </v-btn>
                  <v-btn
                    id="publishBtn"
                    outlined
                    color="success"
                    :disabled="invalid || invalidTrackerDate"
                    @click="handleSubmit(onSubmit(1))"
                  >
                    Publish
                  </v-btn>
                </v-card-actions>
              </v-card>

              <!-- Article tracker component -->
              <template v-if="!isReloadTrackerForm">
                <tracker-form
                  v-model="trackerData"
                  :options="trackerExistData"
                />
              </template>

              <v-card class="mb-4 pb-3">
                <v-card-title>
                  <h4>Category</h4>
                </v-card-title>
                <v-divider />
                <v-sheet class="pa-4 primary lighten-2">
                  <v-text-field
                    v-model="category"
                    label="Search Category"
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
                    v-model="article.categories"
                    :items="categories"
                    :search="category"
                    selectable
                    return-object
                  ></v-treeview>
                </scrollbar>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Tag</h4>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-auto-complete
                    v-model="article.tags"
                    :items="tags"
                    item-text="name"
                    item-value="id"
                    outlined
                    return-object
                    multiple
                    label="Select Tag"
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
                      v-if="article.image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="article.image !== null">
                      <v-img :src="article.image" />
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
                  <v-col cols="12" sm="6">
                    <v-subheader>Meta Image</v-subheader>
                    <v-btn
                      v-if="article.meta_image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('meta_image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="article.meta_image !== null">
                      <v-img :src="article.meta_image" />
                      <v-card-actions class="justify-center">
                        <v-btn
                          color="teal"
                          outlined
                          @click.stop="openDialog('meta_image')"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          color="pink"
                          outlined
                          @click="removeImage('meta_image')"
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
  name: 'BlogArticleEdit',
  components: { MediaLibrary },
  data() {
    const defaultForm = Object.freeze({
      categories: [],
      tracker: 'other',
      tracker_range: {},
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      datetime: null,
      filters: [],
      tags: [],
      status: 0,
      image: null,
      meta_image: null,
      send_push: false,
      is_featured: false,
      video_url: null,
      audio_url: null,
    });

    return {
      language: 'en',
      article: Object.assign({}, defaultForm),
      dailog_type: 'image',
      mediaDialog: false,
      dateModal: false,
      timeModal: false,
      category: '',
      categories: [],
      filters: [],
      filter: null,
      tags: [],
      loading: false,
      invalidTrackerDate: false,
      isReloadTrackerForm: false,
      trackerData: {},
      trackerExistData: {},
      tracker: 'other',
    };
  },
  watch: {
    language() {
      this.getArticle();
    },
    trackerData(newData, oldData) {
      if (newData) {
        this.invalidTrackerDate = newData.invalidTrackerDate;
        this.article.tracker_start_day = newData.startDays;
        this.article.tracker_end_day = newData.endDays;
        this.article.tracker_range = newData.trackerRange;
        this.article.tracker = newData.tracker;
      }
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
    ]).then(() => this.getArticle());

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCategories();
      this.getFilters();
      this.getTags();
      this.getArticle();
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
          this.article.image = null;
          break;
        case 'meta_image':
          this.article.meta_image = null;
          break;
      }
    },
    useThisFile(event) {
      if (this.dailog_type) {
        this.article[this.dailog_type] = event.url;
      }
      this.mediaDialog = false;
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/blog/article/slug/${encodeURIComponent(
            this.article.title
          )}`
        );

        this.article.slug = slug;
      } catch (e) {
        this.article.slug = null;
      }
    },
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/blog/category-tree`
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
    async getFilters() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/common/filter-all`
        );
        this.filters = data;
      } catch (e) {}
    },
    onSubmit(status) {
      this.article.status = status;
      this.publishArticle();
    },
    async publishArticle() {
      this.loading = true;

      try {
        const { message } = await this.$axios.$patch(
          `${this.language}/blog/article/${this.article.id}`,
          this.article
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/blog/articles',
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
    async getArticle() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/blog/article/${this.$route.params.id}/edit`
        );
        this.article = Object.assign({}, data);

        // Set pregnency/baby tracker data
        this.tracker = data.tracker ? data.tracker : 'other';
        this.trackerExistData.range =
          data && data.tracker_range ? data.tracker_range : {};
        this.trackerExistData.tracker = this.tracker;
        if (data) {
          this.isReloadTrackerForm = true;
          setTimeout(() => {
            this.isReloadTrackerForm = false;
          });
        }
      } catch (e) {
        this.$router.replace('/blog/articles');
      }
    },
  },
};
</script>
