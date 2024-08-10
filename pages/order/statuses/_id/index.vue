<template>
  <div id="orderStatusEntry">
    <v-container grid-list-xl fluid>
      <v-row justify="space-between" class="ma-0 py-3">
        <h3>{{ formTitle }}</h3>
        <b-language v-model="language" />
      </v-row>
      <v-row>
        <v-col>
          <validation-observer v-slot="{ handleSubmit, invalid, reset }">
            <v-form
              @submit.prevent="handleSubmit(updateOrderStatus)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="4">
                      <b-text
                        v-model="orderStatus.name"
                        rules="required"
                        outlined
                        label="Name"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-text
                        v-model="orderStatus.code"
                        rules="required|alpha_dash"
                        outlined
                        label="Code"
                        hint="please type lowercase and seperate words with underscore"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-dialog
                        ref="dialog"
                        v-model="dialog"
                        :return-value.sync="color"
                        persistent
                        width="300"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            v-model="orderStatus.color"
                            label="Color"
                            outlined
                            readonly
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-card>
                          <v-color-picker v-model="color" show-swatches />
                          <v-card-actions>
                            <v-spacer />
                            <v-btn text @click="dialog = false"> Cancel </v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.dialog.save(color)"
                            >
                              OK
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-col>
                  </v-row>
                  <b-text-area
                    v-model="orderStatus.description"
                    outlined
                    label="Description"
                  />
                </v-card-text>
                <active-inactive v-model="orderStatus.status" />
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
  name: 'OrderStatusEntry',
  data() {
    const defaultForm = Object.freeze({
      name: '',
      description: '',
      code: '',
      color: '',
      status: 'active',
    });

    return {
      dialog: false,
      loading: false,
      language: 'en',
      orderStatus: Object.assign({}, defaultForm),
      color: null,
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true'
        ? 'Edit Order Status'
        : 'Update Order Status';
    },
  },
  watch: {
    language() {
      this.getOrderStatus();
    },
    color(val) {
      if (val) {
        this.orderStatus.color = val.hex;
      }
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    this.getOrderStatus();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getOrderStatus());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async updateOrderStatus() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$patch(
          `${this.language}/order/status/${this.$route.params.id}`,
          this.orderStatus
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/order/statuses',
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
    // get orderStatus for edit
    async getOrderStatus() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/order/status/${this.$route.params.id}`
        );
        this.orderStatus = Object.assign({}, data);
      } catch (e) {
        Object.assign(this.orderStatus, this.default);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>
