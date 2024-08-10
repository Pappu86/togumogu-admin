<template>
  <div id="paymentMethodEntry">
    <v-container grid-list-xl fluid>
      <v-row justify="space-between" class="ma-0 py-3">
        <h3>{{ formTitle }}</h3>
        <b-language v-model="language" />
      </v-row>
      <v-row>
        <v-col>
          <validation-observer v-slot="{ handleSubmit, invalid, reset }">
            <v-form
              @submit.prevent="handleSubmit(updatePaymentMethod)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="payment_method.code"
                        rules="required"
                        outlined
                        label="Code"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="payment_method.name"
                        rules="required"
                        outlined
                        label="Name"
                      />
                    </v-col>
                  </v-row>
                  <b-text-area
                    v-model="payment_method.description"
                    outlined
                    label="Description"
                  />

                  <v-row justify="center">
                    <v-col cols="12" sm="6">
                      <v-subheader>Image/Icon</v-subheader>
                      <v-btn
                        v-if="payment_method.image === null"
                        color="primary"
                        outlined
                        block
                        @click.stop="openDialog('image')"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                      <v-card v-if="payment_method.image !== null">
                        <v-img :src="payment_method.image" />
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
                  </v-row>
                </v-card-text>
                <active-inactive v-model="payment_method.status" />
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
export default {
  name: 'PaymentMethodEntry',
  data() {
    return {
      dialog: false,
      loading: false,
      language: 'en',
      payment_method: {
        id: 0,
        name: '',
        description: '',
        status: 'active',
        code: '',
        image: '',
      },
      default: {
        id: 0,
        name: '',
        description: '',
        status: 'active',
        code: '',
        image: '',
      },
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true'
        ? 'Edit Payment Method'
        : 'Update Payment Method';
    },
  },
  watch: {
    language() {
      this.getPaymentMethod();
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    this.getPaymentMethod();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getPaymentMethod());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    openDialog(type) {
      this.dailog_type = type;
      this.dialog = true;
    },
    removeImage(type) {
      this.dailog_type = null;
      if (type === 'image') {
        this.payment_method.image = null;
      } else {
        this.payment_method.meta_image = null;
      }
    },
    useThisFile(event) {
      if (this.dailog_type === 'image') {
        this.payment_method.image = event.url;
      } else {
        this.payment_method.meta_image = event.url;
      }
      this.dialog = false;
    },
    async updatePaymentMethod() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$patch(
          `${this.language}/payment/payment-method/${this.$route.params.id}`,
          this.payment_method
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/payment/payment-methods',
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
    async getPaymentMethod() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/payment/payment-method/${this.$route.params.id}`
        );
        this.payment_method = data;
      } catch (e) {
        Object.assign(this.payment_method, this.default);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>
