<template>
  <div id="customerEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="customer" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Customer</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    text-color="white"
                    :color="
                      customer.status === 'active' ? 'success' : 'warning'
                    "
                  >
                    {{ customer.status }}
                  </v-chip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <b-text
                    v-model="customer.name"
                    rules="required|min:2|max:150"
                    outlined
                    label="Name"
                  />

                  <v-row>
                    <v-col xs="12" sm="6" md="6" lg="6" cols="12">
                      <b-text
                        v-model="customer.mobile"
                        rules="mobile"
                        outlined
                        label="Mobile"
                        hide-details
                      />
                    </v-col>
                    <v-col xs="12" sm="6" md="6" lg="6" cols="12">
                      <b-text
                        v-model="customer.email"
                        rules="email"
                        outlined
                        label="Email"
                        hide-details
                      />
                    </v-col>
                    <v-col xs="12" sm="6" md="6" lg="6" cols="12">
                      <v-select
                        v-model="customer.gender"
                        :items="genderList"
                        label="Gender"
                        outlined
                        hide-details
                      ></v-select>
                    </v-col>
                    <v-col xs="12" sm="6" md="6" lg="6" cols="12">
                      <b-date-time
                        v-model="customer.date_of_birth"
                        label="Date Of Birth"
                        outlined
                        hide-details
                      />
                    </v-col>
                    <v-col xs="12" sm="6" md="6" lg="6" cols="12">
                      <v-select
                        v-model="customer.blood_group"
                        :items="bloodGroupList"
                        label="Blood Group"
                        outlined
                        hide-details
                      ></v-select>
                    </v-col>
                    <v-col xs="12" sm="6" md="6" lg="6" cols="12">
                      <v-select
                        v-model="customer.primary_language"
                        :items="languageList"
                        label="Language"
                        outlined
                        hide-details
                      ></v-select>
                    </v-col>
                    <v-col xs="12" sm="6" md="6" lg="6" cols="12">
                      <v-select
                        v-model="customer.religion"
                        :items="religionList"
                        label="Religion"
                        outlined
                        hide-details
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Avatar</h4>
                </v-card-title>
                <v-divider />
                <div class="d-flext text-center pt-2 pb-4">
                  <v-avatar size="128">
                    <img :src="customer.avatar" :alt="customer.name" />
                  </v-avatar>
                </div>
              </v-card>
              <v-card class="mb-4">
                <v-card-actions class="justify-center">
                  <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                  <v-btn
                    id="publishBtn"
                    outlined
                    color="success"
                    :disabled="invalid"
                    @click="handleSubmit(onSubmit(1))"
                  >
                    Update
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
  </div>
</template>

<script>
export default {
  name: 'CustomerEdit',
  components: {},
  data() {
    const defaultForm = Object.freeze({
      name: '',
      gender: '',
    });

    return {
      language: 'en',
      customerId: this.$route.params.id,
      customer: Object.assign({}, defaultForm),
      loading: false,
      genderList: [
        { text: 'Male', value: 'male' },
        { text: 'Female', value: 'female' },
        { text: 'Other', value: 'other' },
      ],
      religionList: [
        'Islam',
        'Christianity',
        'Hinduism',
        'Buddhism',
        'Other',
        'Not Interested',
      ],
      bloodGroupList: [
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'O+',
        'O-',
        'other',
      ],
      languageList: [
        { text: 'Bengali', value: 'Bengali' },
        { text: 'English', value: 'English' },
        { text: 'Other', value: 'Other' },
      ],
    };
  },
  watch: {
    language() {
      this.getCustomer();
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    this.getCustomer();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCustomer();
    });
  },
  methods: {
    onSubmit(status) {
      this.publishCustomer();
    },
    async publishCustomer() {
      this.loading = true;
      try {
        this.customer.tabs = this.tabs;
        this.customer.images = this.images;
        await this.$axios.$patch(
          `customer/update-profile/${this.customer.id}`,
          this.customer
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message: 'Successfully updated!',
          path: '/customers',
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
    async getCustomer() {
      if (this.customerId) {
        try {
          const { data } = await this.$axios.$get(
            `customer/${this.$route.params.id}`
          );
          this.customer = Object.assign({}, data);

          this.tabs = data.tabs;
          this.images = data.images;
        } catch (e) {
          this.$router.replace('/customers');
        }
      }
    },
  },
};
</script>
