<template>
  <div id="blogCategoryEntry">
    <v-container grid-list-xl fluid>
      <v-row justify="space-between" class="ma-0 py-3">
        <h3>{{ formTitle }}</h3>
        <b-language v-model="language" />
      </v-row>
      <v-row>
        <v-col>
          <validation-observer v-slot="{ handleSubmit, invalid, reset }">
            <v-form
              @submit.prevent="handleSubmit(updateCategory)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="4">
                      <b-text
                        v-model="category.name"
                        rules="required"
                        outlined
                        label="Name"
                        @blur="checkSlug"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-text
                        v-model="category.slug"
                        rules="required"
                        outlined
                        label="Slug"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-text
                        v-model="category.meta_title"
                        outlined
                        label="Meta Title"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="4">
                      <b-text-area
                        v-model="category.description"
                        outlined
                        label="Description"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-text-area
                        v-model="category.meta_description"
                        outlined
                        label="Meta Description"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-text-area
                        v-model="category.meta_keyword"
                        outlined
                        label="Meta Keyword"
                      />
                    </v-col>
                  </v-row>
                  <v-row justify="center">
                    <v-col cols="12" sm="6">
                      <v-row>
                        <v-col cols="6">
                          <v-subheader>Image/Icon</v-subheader>
                          <v-btn
                            v-if="category.image === null"
                            color="primary"
                            outlined
                            block
                            @click.stop="openDialog('image')"
                          >
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                          <v-card v-if="category.image !== null">
                            <v-img :src="category.image" />
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
                          </v-card>
                        </v-col>
                        <v-col cols="6">
                          <v-subheader>Meta Image</v-subheader>
                          <v-btn
                            v-if="category.meta_image === null"
                            color="primary"
                            outlined
                            block
                            @click.stop="openDialog('meta_image')"
                          >
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                          <v-card v-if="category.meta_image !== null">
                            <v-img :src="category.meta_image" />
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
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-card-text>
                <active-inactive v-model="category.status" />
                <action-button
                  :loading="loading"
                  :error="invalid"
                  :title="formTitle"
                />
              </v-card>
            </v-form>
          </validation-observer>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="dialog" scrollable max-width="90vw">
      <v-card id="mediaDialog">
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Upload Files</span>
          <v-btn icon dark class="ma-0" @click.stop="dialog = false">
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
  name: 'BlogCategoryEntry',
  components: { MediaLibrary },
  data() {
    return {
      dialog: false,
      loading: false,
      language: 'en',
      category: {
        id: 0,
        name: '',
        slug: '',
        description: '',
        meta_title: '',
        meta_description: '',
        meta_keyword: '',
        status: 'active',
        image: null,
        meta_image: null,
      },
      default: {
        id: 0,
        name: '',
        slug: '',
        description: '',
        meta_title: '',
        meta_description: '',
        meta_keyword: '',
        status: 'active',
        image: null,
        meta_image: null,
      },
      dailog_type: null,
      categories: [],
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true'
        ? 'Edit Category'
        : 'Update Category';
    },
  },
  watch: {
    language() {
      this.getCategory();
    },
  },
  mounted() {
    this.getCategory();
  },
  methods: {
    openDialog(type) {
      this.dailog_type = type;
      this.dialog = true;
    },
    removeImage(type) {
      this.dailog_type = null;
      if (type === 'image') {
        this.category.image = null;
      } else {
        this.category.meta_image = null;
      }
    },
    useThisFile(event) {
      if (this.dailog_type === 'image') {
        this.category.image = event.url;
      } else {
        this.category.meta_image = event.url;
      }
      this.dialog = false;
    },
    async updateCategory() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$patch(
          `${process.env.API_URL}/${this.language}/blog/category/${this.$route.params.id}`,
          this.category
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/blog/categories',
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
    // get category for edit
    async getCategory() {
      try {
        const { data } = await this.$axios.$get(
          `${process.env.API_URL}/${this.language}/blog/category/${this.$route.params.id}`
        );
        this.category = data;
      } catch (e) {
        Object.assign(this.category, this.default);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/blog/category/slug/${encodeURIComponent(
            this.category.name
          )}`
        );

        this.category.slug = slug;
      } catch (e) {
        this.category.slug = null;
      }
    },
  },
};
</script>
