<template>
  <div id="productEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="product" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Product</h4>
                  <v-spacer></v-spacer>
                  <v-chip text-color="black" color="success">
                    {{ product.status ? 'Published' : 'Saved' }}
                  </v-chip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-sheet elevation="2" tag="section" class="pa-2 mb-4">
                    <b-text
                      v-model="product.name"
                      rules="required|min:5|max:150"
                      outlined
                      label="Name"
                      counter="150"
                      @blur="checkSlug"
                    />
                    <b-text
                      v-model="product.slug"
                      rules="required"
                      outlined
                      label="Slug"
                    />
                    <b-text-area
                      v-model="product.excerpt"
                      rules="required|min:10"
                      outlined
                      label="Excerpt"
                    />
                  </v-sheet>
                  <v-sheet elevation="2" tag="section" class="pa-2 mb-4">
                    <v-row>
                      <v-col>
                        <b-text
                          v-model="product.sku"
                          rules="required|max:100"
                          outlined
                          label="Product SKU"
                        />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="product.quantity"
                          rules="numeric"
                          outlined
                          label="Available Quantity"
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="product.min"
                          rules="numeric"
                          outlined
                          label="Minimum Buying Limit"
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="product.max"
                          rules="numeric"
                          outlined
                          label="Maximum Buying Limit"
                        />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <b-text
                          v-model="product.purchased_price"
                          rules="required|decimal:2"
                          outlined
                          label="Purchased Price"
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <b-text
                          v-model="product.price"
                          rules="required|decimal:2"
                          outlined
                          label="Selling Price"
                        />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="product.special_price"
                          rules="decimal:2"
                          outlined
                          label="Special Price"
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-date-time
                          v-model="product.special_start_date"
                          rules="required_if:special_price"
                          outlined
                          label="Special Start Date"
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-date-time
                          v-model="product.special_end_date"
                          rules="required_if:special_price"
                          outlined
                          label="Special End Date"
                        />
                      </v-col>
                    </v-row>
                  </v-sheet>
                  <v-sheet elevation="2" tag="section" class="pa-2 mb-4">
                    <v-row v-for="(tab, i) in tabs" :key="i" justify="center">
                      <v-col>
                        <b-text
                          v-model="tab.title"
                          rules="required"
                          outlined
                          label="Tab Title"
                        />
                        <v-subheader class="pa-0">Tab Content</v-subheader>
                        <b-rich-text-editor
                          v-model="tab.content"
                          :editor-id="'tab-content-' + i"
                        />
                      </v-col>
                    </v-row>
                    <v-row justify="center">
                      <v-col cols="12" sm="6" class="text-center">
                        <v-btn
                          color="primary"
                          outlined
                          title="Product Tab"
                          @click="addTab"
                        >
                          Dynamic Tab <v-icon right>mdi-plus</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-sheet>
                  <v-sheet elevation="2" tag="section" class="pa-2 mb-4">
                    <v-row>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="product.weight"
                          rules="decimal:2"
                          outlined
                          label="Product Weight"
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="product.width"
                          rules="decimal:2"
                          outlined
                          label="Product Width"
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="product.height"
                          rules="decimal:2"
                          outlined
                          label="Product Height"
                        />
                      </v-col>
                    </v-row>
                  </v-sheet>
                  <v-sheet elevation="2" tag="section" class="pa-2 mb-4">
                    <b-text-area
                      v-model="product.warranty_note"
                      outlined
                      label="Warranty Note"
                    />
                    <b-text-area
                      v-model="product.delivery_note"
                      outlined
                      label="Delivery Note"
                    />
                    <b-text-area
                      v-model="product.payment_note"
                      outlined
                      label="Payment Note"
                    />
                  </v-sheet>
                  <v-sheet elevation="2" tag="section" class="pa-2 mb-4">
                    <b-text
                      v-model="product.meta_title"
                      rules="min:10|max:180"
                      outlined
                      label="Meta Title"
                      counter="180"
                    />
                    <b-text-area
                      v-model="product.meta_description"
                      rules="min:10"
                      outlined
                      label="Meta Description"
                    />
                    <b-text-area
                      v-model="product.meta_keyword"
                      rules="min:10"
                      outlined
                      label="Meta Keyword"
                    />
                  </v-sheet>
                  <div class="pa-2">
                    <b-text
                      v-model="product.video_url"
                      outlined
                      label="Video url"
                    />
                  </div>
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
                    v-model="product.datetime"
                    rules="required"
                    outlined
                    prepend-icon="mdi-calendar"
                    label="Product Publish Date"
                  />

                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-checkbox
                        v-model="product.is_featured"
                        label="Is Featured?"
                        color="primary"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-checkbox
                        v-model="product.send_push"
                        label="Send Push Notification"
                        color="primary"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions class="justify-center">
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

              <!-- Product tracker component -->
              <template v-if="!isReloadTrackerForm">
                <tracker-form
                  v-model="trackerData"
                  :options="trackerExistData"
                />
              </template>
              <v-card class="mb-4">
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
                <scrollbar style="max-height: 500px">
                  <v-treeview
                    v-model="product.categories"
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
                    v-model="product.tags"
                    :items="tags"
                    item-text="name"
                    item-value="id"
                    outlined
                    return-object
                    multiple
                    label="Select Tag"
                  />
                </v-card-text>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Filter</h4>
                </v-card-title>
                <v-divider />
                <v-sheet class="pa-4 primary lighten-2">
                  <v-text-field
                    v-model="filter"
                    label="Search Filter"
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
                    v-model="product.filters"
                    :items="filters"
                    :search="filter"
                    selectable
                    return-object
                  ></v-treeview>
                </scrollbar>
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
                      v-if="product.image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="product.image !== null">
                      <v-img :src="product.image" />
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
                      v-if="product.meta_image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('meta_image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="product.meta_image !== null">
                      <v-img :src="product.meta_image" />
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
                <v-divider />
                <v-row>
                  <v-col>
                    <v-subheader>Aditional Image</v-subheader>
                    <v-btn
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('images')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col v-for="(image, i) in images" :key="i" cols="12" sm="4">
                    <v-img :src="image.src" />
                    <v-card-actions class="justify-center">
                      <v-btn
                        color="teal"
                        outlined
                        @click.stop="openDialog('images')"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        color="pink"
                        outlined
                        @click="removeImage('images')"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
    <v-dialog v-model="mediaDialog" scrollable max-width="95vw">
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
export default {
  name: 'ProductEdit',
  components: {},
  data() {
    const defaultForm = Object.freeze({
      name: '',
      slug: '',
      excerpt: '',
      content: '',
      datetime: null,
      special_start_date: null,
      special_end_date: null,
      categories: [],
      filters: [],
      tags: [],
      images: [],
      status: 0,
      image: null,
      meta_image: null,
      send_push: false,
      is_featured: false,
      tracker: 'other',
      video_url: null,
    });

    return {
      language: 'en',
      product: Object.assign({}, defaultForm),
      dailog_type: 'image',
      mediaDialog: false,
      dateModal: false,
      timeModal: false,
      category: '',
      categories: [],
      filters: [],
      filter: null,
      tags: [],
      tabs: [],
      images: [],
      loading: false,
      invalidTrackerDate: false,
      trackerData: {},
      trackerExistData: {},
      isReloadTrackerForm: false,
    };
  },
  watch: {
    language() {
      this.getProduct();
    },
    trackerData(newData, oldData) {
      if (newData) {
        this.invalidTrackerDate = newData.invalidTrackerDate;
        this.product.tracker_start_day = newData.startDays;
        this.product.tracker_end_day = newData.endDays;
        this.product.tracker_range = newData.trackerRange;
        this.product.tracker = newData.tracker;
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
    ]).then(() => this.getProduct());

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCategories();
      this.getFilters();
      this.getProduct();
    });
  },
  methods: {
    // add dynamic tab into product
    addTab() {
      this.tabs.push({ locale: this.language, title: null, content: null });
    },
    removeTab(i) {
      this.tabs.splice(i, 1);
    },
    // open image select dialog
    openDialog(type) {
      this.dailog_type = type;
      this.mediaDialog = true;
    },
    // remove selected image
    removeImage(type, index) {
      this.dailog_type = null;
      switch (type) {
        case 'image':
          this.product.image = null;
          break;
        case 'meta_image':
          this.product.meta_image = null;
          break;
        case 'images':
          this.images.splice(index, 1);
          break;
      }
    },
    // update product image property
    useThisFile(event) {
      switch (this.dailog_type) {
        case 'image':
          this.product.image = event.url;
          this.images.push({
            src: event.src,
            srcset: event.srcset,
            lazy: event.lazy,
            is_featured: true,
          });
          break;
        case 'meta_image':
          this.product.meta_image = event.url;
          break;
        case 'images':
          this.images.push({
            src: event.src,
            srcset: event.srcset,
            lazy: event.lazy,
            is_featured: false,
          });
          break;
      }

      this.mediaDialog = false;
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/product/product/slug/${encodeURIComponent(
            this.product.name
          )}`
        );

        this.product.slug = slug;
      } catch (e) {
        this.product.slug = null;
      }
    },
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/product/category-tree`
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
      this.product.status = status;

      this.publishProduct();
    },
    async publishProduct() {
      this.loading = true;
      try {
        this.product.tabs = this.tabs;
        this.product.images = this.images;
        const { message } = await this.$axios.$patch(
          `${this.language}/product/product/${this.product.id}`,
          this.product
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/product/products',
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
    async getProduct() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/product/product/${this.$route.params.id}`
        );
        this.product = Object.assign({}, data);

        this.tabs = data.tabs;
        this.images = data.images;

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
        this.$router.replace('/product/products');
      }
    },
  },
};
</script>
