<template>
  <div id="shippingProviderEntry">
    <v-container grid-list-xl fluid>
      <v-row justify="space-between" class="ma-0 py-3">
        <h3>{{ formTitle }}</h3>
        <b-language v-model="language" />
      </v-row>
      <v-row>
        <v-col>
          <validation-observer v-slot="{ handleSubmit, invalid, reset }">
            <v-form
              @submit.prevent="handleSubmit(updateProvider)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="5">
                      <b-text
                        v-model="provider.name"
                        rules="required"
                        outlined
                        label="Name"
                      />
                    </v-col>
                    <v-col cols="12" md="5">
                      <b-text
                        v-model="provider.code"
                        rules="required|alpha_dash"
                        outlined
                        label="Code"
                        hint="please type lowercase and seperate words with underscore"
                      />
                    </v-col>
                    <v-col cols="12" md="2">
                      <b-switch
                        v-model="provider.has_api"
                        outlined
                        label="Has API"
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-combobox
                        v-model="provider.package_option"
                        outlined
                        multiple
                        chips
                        label="Select or Create Package Option"
                        hint="Press Enter to add option"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-combobox
                        v-model="provider.delivery_option"
                        outlined
                        multiple
                        chips
                        label="Select or Create Delivery Option"
                        hint="Press Enter to add option"
                      />
                    </v-col>
                  </v-row>
                  <b-text-area
                    v-model="provider.description"
                    outlined
                    label="Description"
                  />
                </v-card-text>
                <active-inactive v-model="provider.status" />
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
  </div>
</template>

<script>
export default {
  name: 'ShippingProviderEntry',
  data() {
    return {
      dialog: false,
      loading: false,
      language: 'en',
      provider: {
        id: 0,
        name: '',
        description: '',
        status: 'active',
        has_api: false,
        code: '',
      },
      default: {
        id: 0,
        name: '',
        description: '',
        status: 'active',
        has_api: false,
        code: '',
      },
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true'
        ? 'Edit Provider'
        : 'Update Provider';
    },
  },
  watch: {
    language() {
      this.getProvider();
    },
  },
  mounted() {
    this.getProvider();
  },
  methods: {
    async updateProvider() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$patch(
          `${process.env.API_URL}/${this.language}/shipping/provider/${this.$route.params.id}`,
          this.provider
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/shipping/providers',
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
    // get provider for edit
    async getProvider() {
      try {
        const { data } = await this.$axios.$get(
          `${process.env.API_URL}/${this.language}/shipping/provider/${this.$route.params.id}`
        );
        this.provider = data;
      } catch (e) {
        Object.assign(this.provider, this.default);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>
