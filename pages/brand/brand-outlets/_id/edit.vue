<template>
  <div id="brandOutletEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="brandOutlet" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Brand Outlet</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    text-color="white"
                    :color="brandOutlet.status ? `success` : `primary`"
                  >
                    {{ brandOutlet.status ? 'Published' : 'Saved' }}
                  </v-chip>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-text
                    v-model="brandOutlet.name"
                    rules="required|min:3|max:100"
                    outlined
                    label="name"
                    counter="100"
                    @blur="checkSlug"
                  />
                  <b-text
                    v-model="brandOutlet.slug"
                    rules="required"
                    outlined
                    label="Slug"
                  />
                  <b-text
                    v-model="brandOutlet.website_link"
                    outlined
                    label="Website url"
                  />
                  <b-text
                    v-model="brandOutlet.google_map_link"
                    outlined
                    label="Google map link"
                  />

                  <b-auto-complete
                    v-model="brandOutlet.brand_id"
                    rules="required"
                    :items="brands"
                    item-text="name"
                    item-value="id"
                    outlined
                    label="Select Brand"
                    hide-details
                  />
                  <div class="pb-5"></div>
                  <b-text-area
                    v-model="brandOutlet.short_description"
                    outlined
                    label="Short Description"
                    class="pt-2"
                  />

                  <v-row class="mb-3">
                    <v-col cols="12" sm="12">
                      <v-divider class="mb-4 mt-5" />
                      <b-text
                        v-model="brandOutlet.address_line"
                        rules="required"
                        outlined
                        label="Enter address"
                        hide-details
                      />
                    </v-col>

                    <v-col cols="12" sm="4">
                      <b-auto-complete
                        v-model="brandOutlet.division_id"
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
                        v-model="brandOutlet.district_id"
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
                        v-model="brandOutlet.area_id"
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

              <v-card class="mb-4">
                <v-card-title>
                  <h4>Map</h4>
                </v-card-title>
                <v-divider />
                <v-card-text class="pb-0">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="brandOutlet.latitude"
                        outlined
                        label="Enter Latitude"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="brandOutlet.longitude"
                        outlined
                        label="Enter Longitude"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-text>
                  <Map
                    :latitude="brandOutlet.latitude"
                    :longitude="brandOutlet.longitude"
                    @location-changed="updateLocation"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
  </div>
</template>

<script>
import Map from '~/components/Map';

export default {
  name: 'BrandOutletEdit',
  components: { Map },
  data() {
    const defaultForm = Object.freeze({
      name: '',
      slug: '',
      short_description: '',
      created_at: null,
      status: 0,
      website_link: '',
      google_map_link: '',
      brand_id: null,
      area_id: null,
      district_id: null,
      division_id: null,
      address_line: '',
      country: '',
      latitude: 23.81034,
      longitude: 90.41254,
    });

    return {
      language: 'en',
      brandOutlet: Object.assign({}, defaultForm),
      mediaDialog: false,
      loading: false,
      divisions: [],
      districts: [],
      divisionId: '',
      districtId: '',
      areas: [],
      brands: [],
    };
  },
  watch: {
    language() {
      this.getBrandOutlet();
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([this.getDivisions(), this.getBrands()]).then(() =>
      this.getBrandOutlet()
    );

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getBrandOutlet();
      this.getDivisions();
      this.getBrands();
    });
  },
  methods: {
    async getBrands() {
      try {
        const { data } = await this.$axios.$get(`${this.language}/brand/all`);
        this.brands = data;
      } catch (e) {}
    },
    // update latitude, longitude
    updateLocation(event) {
      this.brandOutlet.latitude = event.latitude;
      this.brandOutlet.longitude = event.longitude;
    },
    openDialog(type) {
      this.dailog_type = type;
      this.mediaDialog = true;
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/brand/brand-outlet/slug/${encodeURIComponent(
            this.brandOutlet.name
          )}`
        );

        this.brandOutlet.slug = slug;
      } catch (e) {
        this.brandOutlet.slug = null;
      }
    },
    onSubmit(status) {
      this.brandOutlet.status = status;
      this.publishBrand();
    },
    async publishBrand() {
      this.loading = true;
      const brandData = this.brandOutlet;

      // Set social links
      brandData.social_links = this.socialLinks;

      try {
        const { message } = await this.$axios.$patch(
          `${this.language}/brand/brand-outlet/${this.brandOutlet.id}`,
          brandData
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/brand/brand-outlets',
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
    async getBrandOutlet() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/brand/brand-outlet/${this.$route.params.id}/edit`
        );
        this.brandOutlet = Object.assign({}, data);

        // Get default location when had no daycare location
        if (this.brandOutlet.division_id) this.getDistricts();
        if (this.brandOutlet.district_id) this.getAreas();
      } catch (e) {
        this.$router.replace('/brand/brand-outlets');
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
        if (this.brandOutlet.division_id) {
          const { data } = await this.$axios.$get(
            `shipping/district-by-division/${this.brandOutlet.division_id}`
          );
          this.districts = data;
        }
      } catch (e) {}
    },

    async getAreas() {
      try {
        if (this.brandOutlet.district_id) {
          const { data } = await this.$axios.$get(
            `shipping/area-by-district/${this.brandOutlet.district_id}`
          );
          this.areas = data;
        }
      } catch (e) {}
    },
  },
};
</script>
