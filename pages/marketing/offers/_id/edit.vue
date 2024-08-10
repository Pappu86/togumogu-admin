<template>
  <div id="offerEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="offer" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Offer</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    text-color="white"
                    :color="offer.status ? `success` : `primary`"
                  >
                    {{ offer.status ? 'Published' : 'Saved' }}
                  </v-chip>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-text
                    v-model="offer.title"
                    rules="required|min:3|max:100"
                    outlined
                    label="Title"
                    counter="100"
                    @blur="checkSlug"
                  />
                  <b-text
                    v-model="offer.slug"
                    rules="required"
                    outlined
                    label="Slug"
                  />
                  <b-auto-complete
                    v-model="offer.brand_id"
                    :items="brands"
                    item-text="name"
                    item-value="id"
                    outlined
                    label="Select brand"
                    hide-details
                  />
                  <div class="pb-5 pb-3"></div>

                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="offer.reward_amount"
                        outlined
                        label="Reward amount"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="offer.validity_day"
                        outlined
                        label="Validity in day"
                        hide-details
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-date-time
                        v-model="offer.start_date"
                        outlined
                        label="Start date"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-date-time
                        v-model="offer.end_date"
                        outlined
                        label="End date"
                        hide-details
                      />
                    </v-col>
                  </v-row>

                  <div class="pb-5 pb-3"></div>
                  <b-text v-model="offer.coupon" outlined label="Coupon" />
                  <b-text
                    v-model="offer.video_url"
                    outlined
                    label="Video url"
                  />
                  <v-row>
                    <v-col cols="12" sm="8">
                      <b-text
                        v-model="offer.website_url"
                        outlined
                        label="Website url"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-text
                        v-model="offer.website_btn"
                        outlined
                        label="Website btn"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="8">
                      <b-text
                        v-model="offer.store_location_url"
                        outlined
                        label="Store location url"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-text
                        v-model="offer.store_location_btn"
                        outlined
                        label="Store location btn"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                  <div class="pb-5"></div>
                  <b-text-area
                    v-model="offer.short_description"
                    rules="required|min:10"
                    outlined
                    label="Short Description"
                    class="pt-2"
                  />
                  <v-subheader class="pa-0">Long Description</v-subheader>
                  <b-rich-text-editor
                    v-model="offer.long_description"
                    editor-id="offerLongDescription"
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
                  <b-language v-model="language" />
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-checkbox
                    v-model="offer.is_togumogu_offer"
                    label="Is Togumogu Offer?"
                    color="primary"
                    hide-details
                  />
                  <v-checkbox
                    v-model="offer.is_free"
                    label="Is Free?"
                    color="primary"
                    hide-details
                  />
                  <v-checkbox
                    v-model="offer.is_featured"
                    label="Is Featured?"
                    color="primary"
                    hide-details
                  />
                  <v-checkbox
                    v-model="offer.is_promoted"
                    label="Is Promoted?"
                    color="primary"
                    hide-details
                  />
                </v-card-text>
                <v-card-actions class="justify-center pb-5 pt-5">
                  <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                  <v-btn
                    outlined
                    color="primary"
                    :disabled="isValidForm(invalid)"
                    @click="handleSubmit(onSubmit(0))"
                  >
                    Save
                  </v-btn>
                  <v-btn
                    id="publishBtn"
                    outlined
                    color="success"
                    :disabled="isValidForm(invalid)"
                    @click="handleSubmit(onSubmit(1))"
                  >
                    Publish
                  </v-btn>
                </v-card-actions>
              </v-card>

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
                <scrollbar style="height: 300px">
                  <v-treeview
                    v-model="offer.categories"
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
                    v-model="offer.tags"
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
                    <v-subheader>Image</v-subheader>
                    <v-btn
                      v-if="offer.image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="offer.image !== null">
                      <v-img :src="offer.image" />
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
                    <v-subheader>Card Image</v-subheader>
                    <v-btn
                      v-if="offer.card_image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('card_image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="offer.card_image !== null">
                      <v-img :src="offer.card_image" />
                      <v-card-actions class="justify-center">
                        <v-btn
                          color="teal"
                          outlined
                          @click.stop="openDialog('card_image')"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          color="pink"
                          outlined
                          @click="removeImage('card_image')"
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
export default {
  name: 'OfferEdit',
  components: {},
  data() {
    const defaultForm = Object.freeze({
      categories: [],
      tags: [],
      title: '',
      slug: '',
      short_description: '',
      long_description: '',
      created_at: null,
      status: 0,
      coupon: null,
      image: null,
      card_image: null,
      is_togumogu_offer: false,
      is_free: false,
      is_featured: false,
      is_promoted: false,
      video_url: null,
      website_link: '',
      brand_id: null,
      reward_amount: null,
    });

    return {
      language: 'en',
      offer: Object.assign({}, defaultForm),
      dailog_type: 'image',
      mediaDialog: false,
      dateModal: false,
      timeModal: false,
      category: '',
      categories: [],
      brands: [],
      tags: [],
      loading: false,
      isValidForm(invalid) {
        const isValid = !!(
          this.offer.categories.length &&
          this.offer.long_description &&
          this.offer.image &&
          this.offer.card_image
        );
        return !(invalid || isValid);
      },
    };
  },
  watch: {
    language() {
      this.getOffer();
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
      this.getBrands(),
    ]).then(() => this.getOffer());

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCategories();
      this.getTags();
      this.getBrands();
      this.getOffer();
    });
  },
  methods: {
    async getBrands() {
      try {
        const { data } = await this.$axios.$get(`${this.language}/brand/all`);
        this.brands = data;
      } catch (e) {}
    },
    openDialog(type) {
      this.dailog_type = type;
      this.mediaDialog = true;
    },
    removeImage(type) {
      this.dailog_type = null;
      switch (type) {
        case 'image':
          this.offer.image = null;
          break;
        case 'card_image':
          this.offer.card_image = null;
          break;
      }
    },
    useThisFile(event) {
      switch (this.dailog_type) {
        case 'image':
          this.offer.image = event.url;
          break;
        case 'card_image':
          this.offer.card_image = event.url;
          break;
      }
      this.mediaDialog = false;
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/offer/offer/slug/${encodeURIComponent(
            this.offer.title
          )}`
        );

        this.offer.slug = slug;
      } catch (e) {
        this.offer.slug = null;
      }
    },
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/brand/category-tree`
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
      this.offer.status = status;
      this.publishOffer();
    },
    async publishOffer() {
      this.loading = true;
      const offerData = this.offer;

      try {
        const { message } = await this.$axios.$patch(
          `${this.language}/offer/offer/${this.offer.id}`,
          offerData
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/marketing/offers',
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
    async getOffer() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/offer/offer/${this.$route.params.id}/edit`
        );
        this.offer = Object.assign({}, data);
      } catch (e) {
        this.$router.replace('/offer/offers');
      }
    },
  },
};
</script>
