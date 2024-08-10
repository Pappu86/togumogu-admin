<template>
  <div id="partnershipEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="partnership" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <!-- Start edit left section-->
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Partnership</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    class="white--text"
                    :color="
                      partnership.status === 'active' ? 'success' : 'warning'
                    "
                  >
                    {{ partnership.status }}
                  </v-chip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-sheet elevation="0" tag="section" class="pa-2 mb-5 pb-1">
                    <div class="pb-5">
                      <b-auto-complete
                        v-model="partnership.company_id"
                        rules="required"
                        :items="companies"
                        item-text="name"
                        item-value="id"
                        outlined
                        label="Select company"
                        hide-details
                      />
                    </div>

                    <v-row class="pb-5">
                      <v-col cols="6">
                        <b-auto-complete
                          v-model="partnership.group_id"
                          rules="required"
                          :items="employeeGroups"
                          item-text="name"
                          item-value="id"
                          outlined
                          label="Select employee group"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="6">
                        <b-text
                          v-model="partnership.discount"
                          rules="decimal"
                          outlined
                          label="Discount"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                    <v-subheader>Details</v-subheader>
                    <b-rich-text-editor
                      v-model="partnership.details"
                      editor-id="partnershipDetails"
                      class-name="mt-4"
                    />
                  </v-sheet>

                  <v-sheet elevation="0" tag="section">
                    <v-col cols="12" md="12" sm="12">
                      <v-card-subtitle class="pa-0 py-0 pb-3">
                        <h4>Shipping</h4>
                      </v-card-subtitle>
                      <v-divider />
                    </v-col>
                    <v-radio-group
                      v-model="partnership.is_free_shipping"
                      row
                      hide-details
                      class="mb-5 mt-0 pl-3 pr-3"
                    >
                      <template v-slot:label>
                        <div class="mr-5"><strong>Free Shipping</strong></div>
                      </template>
                      <v-radio label="Yes" value="1"></v-radio>
                      <v-radio label="No" value="0"></v-radio>
                    </v-radio-group>

                    <v-row class="pb-5 pl-2 pr-2">
                      <v-col cols="6">
                        <b-text
                          v-model="partnership.free_shipping_spend"
                          rules="numeric"
                          outlined
                          label="Minimum spend for Free shipping"
                          hide-details
                          :disabled="partnership.is_free_shipping !== '1'"
                        />
                      </v-col>
                      <v-col cols="6">
                        <b-auto-complete
                          v-model="partnership.coupon_id"
                          :items="partnershipCoupons"
                          item-text="name"
                          item-value="id"
                          outlined
                          label="Coupon"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                  </v-sheet>

                  <v-sheet elevation="0" tag="section">
                    <v-col cols="12" md="12" sm="12">
                      <v-card-subtitle class="pa-0 py-0 pb-3">
                        <h4>Support</h4>
                      </v-card-subtitle>
                      <v-divider />
                    </v-col>
                    <v-row class="pb-5 pt-4 pl-2 pr-2">
                      <v-col cols="6">
                        <b-text
                          v-model="partnership.hotline_number"
                          outlined
                          label="Hotline Number"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="6">
                        <b-text
                          v-model="partnership.pse"
                          outlined
                          label="Assigned [PSE]"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12">
                        <b-text
                          v-model="partnership.special_note"
                          outlined
                          label="Special note"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                  </v-sheet>

                  <v-sheet elevation="0" tag="section">
                    <v-col cols="12" md="12" sm="12">
                      <v-card-subtitle class="pa-0 py-0 pb-3">
                        <h4>Offer</h4>
                      </v-card-subtitle>
                      <v-divider />
                    </v-col>
                    <v-row class="pb-5 pt-4 pl-2 pr-2">
                      <v-col cols="6">
                        <b-text
                          v-model="partnership.togumogu_customer_offer"
                          outlined
                          label="Offer For ToguMogu Customer"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="6">
                        <b-text
                          v-model="partnership.offer_code"
                          outlined
                          label="Offer Code"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-subheader>Offer Text</v-subheader>
                        <b-rich-text-editor
                          v-model="partnership.offer_text"
                          editor-id="offerText"
                          class-name="mt-4"
                        />
                      </v-col>

                      <v-col cols="12">
                        <v-subheader>Offer Instruction</v-subheader>
                        <b-rich-text-editor
                          v-model="partnership.offer_instruction"
                          editor-id="offerInstruction"
                          class-name="mt-4"
                        />
                      </v-col>
                    </v-row>
                  </v-sheet>

                  <v-sheet elevation="0" tag="section">
                    <v-col cols="12" md="12" sm="12">
                      <v-card-subtitle class="pa-0 py-0 pb-3">
                        <h4>Duration</h4>
                      </v-card-subtitle>
                      <v-divider />
                    </v-col>
                    <v-row class="pb-5 pt-4 pl-2 pr-2">
                      <v-col cols="6">
                        <b-date-time
                          v-model="partnership.start_date"
                          rules="required"
                          label="Start Date"
                          outlined
                          hint="From when the partnership deal will be valid. Please enter a valid date"
                        />
                      </v-col>
                      <v-col cols="6">
                        <b-date-time
                          v-model="partnership.expiration_date"
                          rules="required"
                          outlined
                          label="Expiration Date"
                          hint="Partnership deal will not be valid after end date. Please enter a valid date"
                        />
                      </v-col>
                    </v-row>
                  </v-sheet>
                </v-card-text>
              </v-card>
            </v-col>
            <!-- End edit left section-->
            <!-- Start edit right section-->
            <v-col cols="12" sm="4">
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Publish</h4>
                  <v-spacer />
                  <b-language v-model="language" />
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-card-actions class="justify-center">
                    <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                    <v-btn
                      outlined
                      color="primary"
                      :disabled="invalid"
                      @click="handleSubmit(onSubmit('inactive'))"
                    >
                      Save
                    </v-btn>
                    <v-btn
                      id="publishBtn"
                      outlined
                      color="success"
                      :disabled="invalid"
                      @click="handleSubmit(onSubmit('active'))"
                    >
                      Publish
                    </v-btn>
                  </v-card-actions>
                </v-card-text>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Offer Image</h4>
                </v-card-title>
                <v-divider />
                <div class="text-center pa-3">
                  <v-btn
                    v-if="partnership.offer_image === null"
                    color="primary"
                    class="mx-4"
                    outlined
                    large
                    @click.stop="openDialog('offer_image')"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                  <template v-if="partnership.offer_image !== null">
                    <v-img :src="partnership.offer_image" />
                    <v-card-actions class="justify-center">
                      <v-btn
                        color="teal"
                        outlined
                        @click.stop="openDialog('offer_image')"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        color="pink"
                        outlined
                        @click="removeImage('offer_image')"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </template>
                </div>
              </v-card>
            </v-col>
            <!-- End edit right section-->
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
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
export default {
  name: 'PartnershipEdit',
  components: {},
  data() {
    const defaultForm = Object.freeze({
      status: 0,
      created_at: null,
      details: '',
      company_id: null,
      group_id: null,
      coupon_id: null,
      is_free_shipping: '0',
    });

    return {
      language: 'en',
      partnership: Object.assign({}, defaultForm),
      loading: false,
      dialog: false,
      companies: [],
      employeeGroups: [],
      partnershipCoupons: [],
    };
  },
  computed: {},
  watch: {
    language() {
      this.getPartnership();
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([
      this.getCompanies(),
      this.getEmployeeGroup(),
      this.getPartnershipCoupons(),
    ]).then(() => {
      this.getPartnership();
    });

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCompanies();
      this.getEmployeeGroup();
      this.getPartnershipCoupons();
      this.getPartnership();
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
    async getEmployeeGroup() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/corporate/employee-group/all`
        );
        this.employeeGroups = data;
      } catch (e) {}
    },
    async getPartnershipCoupons() {
      try {
        const { data } = await this.$axios.$get(
          `marketing/coupon/all?category=partnership`
        );
        this.partnershipCoupons = data;
      } catch (e) {}
    },
    onSubmit(status) {
      this.partnership.status = status;
      this.publishPartnership();
    },

    async publishPartnership() {
      const instance = this;
      instance.loading = true;
      try {
        const partnershipData = instance.partnership;

        const { message } = await this.$axios.$patch(
          `${this.language}/corporate/partnership/${this.$route.params.id}`,
          partnershipData
        );

        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/corporate/partnership',
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
    // get payment_method for edit
    async getPartnership() {
      const instance = this;
      try {
        const { data } = await instance.$axios.$get(
          `${instance.language}/corporate/partnership/${instance.$route.params.id}/edit`
        );
        instance.partnership = Object.assign({}, data);
      } catch (e) {
        instance.$router.replace('/corporate/partnership');
      }
    },
    openDialog(type) {
      this.dailog_type = type;
      this.dialog = true;
    },
    removeImage(type) {
      this.dailog_type = null;
      if (type === 'offer_image') {
        this.partnership.offer_image = null;
      }
    },
    useThisFile(event) {
      if (this.dailog_type === 'offer_image') {
        this.partnership.offer_image = event.url;
      }
      this.dialog = false;
    },
  },
};
</script>
