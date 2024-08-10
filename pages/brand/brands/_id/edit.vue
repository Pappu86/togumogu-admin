<template>
  <div id="brandEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="brand" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Brand</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    text-color="white"
                    :color="brand.status ? `success` : `primary`"
                  >
                    {{ brand.status ? 'Published' : 'Saved' }}
                  </v-chip>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-text
                    v-model="brand.name"
                    rules="required|min:3|max:100"
                    outlined
                    label="name"
                    counter="100"
                    @blur="checkSlug"
                  />
                  <b-text
                    v-model="brand.slug"
                    rules="required"
                    outlined
                    label="Slug"
                  />
                  <b-text
                    v-model="brand.website_link"
                    outlined
                    label="Website url"
                  />
                  <b-text
                    v-model="brand.video_url"
                    outlined
                    label="Brand video url"
                  />

                  <b-auto-complete
                    v-model="brand.company_id"
                    :items="companies"
                    item-text="name"
                    item-value="id"
                    outlined
                    label="Select mother company"
                    hide-details
                  />
                  <div class="pb-5"></div>
                  <b-text-area
                    v-model="brand.short_description"
                    rules="required|min:10"
                    outlined
                    label="Short Description"
                    class="pt-2"
                  />
                  <v-subheader class="pa-0">Long Description</v-subheader>
                  <b-rich-text-editor
                    v-model="brand.long_description"
                    editor-id="brandLongDescription"
                    class-name="mt-4"
                  />

                  <v-row class="mb-3">
                    <v-col cols="12" sm="12">
                      <v-divider class="mb-4 mt-5" />
                      <b-text
                        v-model="brand.address_line"
                        rules="required"
                        outlined
                        label="Enter address"
                        hide-details
                      />
                    </v-col>

                    <v-col cols="12" sm="4">
                      <b-auto-complete
                        v-model="brand.division_id"
                        rules="required"
                        :items="divisions"
                        label="Select Division"
                        item-text="name"
                        item-value="id"
                        outlined
                        hide-details
                        @change="changeDivision()"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-auto-complete
                        v-model="brand.district_id"
                        rules="required"
                        :items="districts"
                        label="Select District"
                        item-text="name"
                        item-value="id"
                        outlined
                        hide-details
                        @change="changeDistrict()"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-auto-complete
                        v-model="brand.area_id"
                        :items="areas"
                        rules="required"
                        label="Select Area"
                        item-text="name"
                        item-value="id"
                        outlined
                        hide-details
                      />
                    </v-col>
                  </v-row>
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
                    v-model="brand.is_togumogu_partner"
                    label="Is Togumog Partner?"
                    color="primary"
                    hide-details
                  />
                </v-card-text>
                <v-card-actions class="justify-center pb-5 pt-5">
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
                    v-model="brand.categories"
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
                    v-model="brand.tags"
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
                <v-card class="mb-4">
                  <v-card-title>
                    <h4>Social Links</h4>
                  </v-card-title>
                  <v-divider />
                  <v-card-text>
                    <v-row
                      v-for="(link, linkIndex) in socialLinks"
                      :key="linkIndex"
                      justify="center"
                    >
                      <v-col>
                        <b-text
                          v-model="link.link"
                          outlined
                          label="Social Link"
                        />
                        <mdi-svg-icon-selector v-model="link.icon" />
                        <v-dialog
                          ref="colorDialogRef"
                          v-model="colorDialog"
                          :return-value.sync="link.color"
                          persistent
                          width="300"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="link.color"
                              label="Color Code"
                              outlined
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-card>
                            <v-color-picker v-model="color" show-swatches />
                            <v-card-actions>
                              <v-spacer />
                              <v-btn text @click="colorDialog = false"
                                >Cancel</v-btn
                              >
                              <v-btn
                                text
                                color="primary"
                                @click="
                                  $refs.colorDialogRef[linkIndex].save(
                                    color && color.hex
                                  )
                                "
                                >OK</v-btn
                              >
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                        <template v-if="socialLinks.length > 1">
                          <v-divider />
                        </template>
                      </v-col>
                    </v-row>
                    <v-row justify="center">
                      <v-col cols="12" sm="12" class="text-center">
                        <v-btn
                          color="primary"
                          outlined
                          title="Social Link"
                          @click="addLink"
                        >
                          Social Link
                          <v-icon right>mdi-plus</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Images</h4>
                </v-card-title>
                <v-divider />
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-subheader>Logo</v-subheader>
                    <v-btn
                      v-if="brand.logo === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('logo')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="brand.logo !== null">
                      <v-img :src="brand.logo" />
                      <v-card-actions class="justify-center">
                        <v-btn
                          color="teal"
                          outlined
                          @click.stop="openDialog('logo')"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          color="pink"
                          outlined
                          @click="removeImage('logo')"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-card-actions>
                    </template>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-subheader>Banner</v-subheader>
                    <v-btn
                      v-if="brand.banner === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('banner')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="brand.banner !== null">
                      <v-img :src="brand.banner" />
                      <v-card-actions class="justify-center">
                        <v-btn
                          color="teal"
                          outlined
                          @click.stop="openDialog('banner')"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          color="pink"
                          outlined
                          @click="removeImage('banner')"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-card-actions>
                    </template>
                  </v-col>
                </v-row>
              </v-card>

              <v-card class="mb-4">
                <v-card-title>
                  <h4>Map</h4>
                </v-card-title>
                <v-divider />
                <v-card-text class="pb-0">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="brand.latitude"
                        outlined
                        label="Enter Latitude"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="brand.longitude"
                        outlined
                        label="Enter Longitude"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-text>
                  <Map
                    :latitude="brand.latitude"
                    :longitude="brand.longitude"
                    @location-changed="updateLocation"
                  />
                </v-card-text>
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
import Map from '~/components/Map';

export default {
  name: 'BrandEdit',
  components: { Map },
  data() {
    const defaultForm = Object.freeze({
      categories: [],
      tags: [],
      name: '',
      slug: '',
      short_description: '',
      long_description: '',
      created_at: null,
      status: 0,
      logo: null,
      banner: null,
      is_togumogu_partner: false,
      video_url: null,
      website_link: '',
      company_id: null,
      area_id: null,
      district_id: null,
      division_id: null,
      address_line: '',
      country: '',
      social_links: null,
      latitude: 23.81034,
      longitude: 90.41254,
    });

    return {
      language: 'en',
      brand: Object.assign({}, defaultForm),
      dailog_type: 'image',
      mediaDialog: false,
      dateModal: false,
      timeModal: false,
      category: '',
      categories: [],
      tags: [],
      socialLinks: [],
      colorDialog: false,
      color: null,
      loading: false,
      divisions: [],
      districts: [],
      divisionId: '',
      districtId: '',
      areas: [],
      companies: [],
    };
  },
  watch: {
    language() {
      this.getBrand();
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
      this.getDivisions(),
      this.getCompanies(),
    ]).then(() => this.getBrand());

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCategories();
      this.getTags();
      this.getBrand();
      this.getDivisions();
      this.getCompanies();
    });
  },
  methods: {
    async getCompanies() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/corporate/company/all`
        );
        this.companies = data;
      } catch (e) {}
    },
    // update latitude, longitude
    updateLocation(event) {
      this.brand.latitude = event.latitude;
      this.brand.longitude = event.longitude;
    },
    openDialog(type) {
      this.dailog_type = type;
      this.mediaDialog = true;
    },
    addLink() {
      this.socialLinks.push({ icon: null, color: null, link: null });
    },
    removeImage(type) {
      this.dailog_type = null;
      switch (type) {
        case 'logo':
          this.brand.logo = null;
          break;
        case 'banner':
          this.brand.banner = null;
          break;
      }
    },
    useThisFile(event) {
      switch (this.dailog_type) {
        case 'logo':
          this.brand.logo = event.url;
          break;
        case 'banner':
          this.brand.banner = event.url;
          break;
      }
      this.mediaDialog = false;
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/brand/brand/slug/${encodeURIComponent(
            this.brand.name
          )}`
        );

        this.brand.slug = slug;
      } catch (e) {
        this.brand.slug = null;
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
      this.brand.status = status;
      this.publishBrand();
    },
    async publishBrand() {
      this.loading = true;
      const brandData = this.brand;

      // Set social links
      brandData.social_links = this.socialLinks;

      try {
        const { message } = await this.$axios.$patch(
          `${this.language}/brand/brand/${this.brand.id}`,
          brandData
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/brand/brands',
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
    async getBrand() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/brand/brand/${this.$route.params.id}/edit`
        );
        this.brand = Object.assign({}, data);

        // Get social links
        const links = this.brand && this.brand.social_links;
        this.socialLinks = links || [];

        // Get default location when had no daycare location
        if (this.brand.division_id) this.getDistricts();
        if (this.brand.district_id) this.getAreas();
      } catch (e) {
        this.$router.replace('/brand/brands');
      }
    },

    async getDivisions() {
      try {
        const { data } = await this.$axios.$get(`shipping/division-all`);
        this.divisions = data;
      } catch (e) {}
    },

    changeDivision() {
      this.getDistricts();
      this.areas = [];
    },
    changeDistrict() {
      this.getAreas();
    },
    async getDistricts() {
      try {
        if (this.brand.division_id) {
          const { data } = await this.$axios.$get(
            `shipping/district-by-division/${this.brand.division_id}`
          );
          this.districts = data;
        }
      } catch (e) {}
    },

    async getAreas() {
      try {
        if (this.brand.district_id) {
          const { data } = await this.$axios.$get(
            `shipping/area-by-district/${this.brand.district_id}`
          );
          this.areas = data;
        }
      } catch (e) {}
    },
  },
};
</script>
