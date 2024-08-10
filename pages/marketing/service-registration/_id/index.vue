<template>
  <div id="orderSingle">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Service Registration Details</h3>
            <v-spacer />
            <v-btn
              v-if="registration"
              class="primary"
              nuxt
              :to="`/registration/orders/${registration.id}/invoice`"
            >
              <v-icon left>mdi-receipt</v-icon> Invoice
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row v-if="registration">
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title>Customer</v-card-title>
                <v-divider />
                <v-card-text class="address-card__body">
                  <div class="address-card__name">
                    {{ registration.customer_info.name }}
                  </div>
                  <div class="address-card__row">
                    {{ registration.current_location_name || '-' }}<br />
                  </div>
                  <div class="address-card__row">
                    <div class="address-card__row-title">Mobile</div>
                    <div class="address-card__row-content">
                      {{ registration.customer_info.phone }}
                    </div>
                  </div>
                  <div
                    v-if="registration.customer_info.email"
                    class="address-card__row"
                  >
                    <div class="address-card__row-title">Email</div>
                    <div class="address-card__row-content">
                      {{ registration.customer_info.email }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title>Booking</v-card-title>
                <v-divider />
                <v-card-text class="address-card__body">
                  <div class="address-card__row">
                    <div class="address-card__row-content">-</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <!--Start update status -->
          <v-row>
            <!-- Start update registration status -->
            <v-col cols="12">
              <v-card>
                <v-card-title> Update Status </v-card-title>
                <v-divider />
                <v-card-text>
                  <validation-observer
                    ref="statusForm"
                    v-slot="{ handleSubmit, invalid, reset }"
                  >
                    <v-form
                      @submit.prevent="handleSubmit(onSubmit)"
                      @reset.prevent="reset"
                    >
                      <v-row>
                        <v-col cols="12" md="6" sm="6">
                          <b-auto-complete
                            v-model="form.service_reg_status"
                            :items="orderStatuses"
                            item-text="name"
                            item-value="code"
                            outlined
                            label="Select Order Status"
                            hide-details
                          />
                        </v-col>
                        <!-- End update registration status -->
                        <!-- Start update payment status -->
                        <v-col cols="12" md="6" sm="6">
                          <b-auto-complete
                            v-model="form.payment_status"
                            :items="paymentStatuses"
                            item-text="text"
                            item-value="value"
                            outlined
                            label="Select Payment status"
                            hide-details
                          />
                        </v-col>
                        <!-- End update payment status -->
                        <v-col cols="12" md="12" sm="12">
                          <b-text-area
                            v-model="form.comment"
                            outlined
                            label="Enter Comment"
                            hide-details
                            rows="2"
                            dense
                          />
                        </v-col>

                        <v-col class="text-right pb-1">
                          <v-divider />
                          <v-card-actions class="pb-0 pt-4">
                            <v-spacer />
                            <v-btn
                              type="submit"
                              :loading="updating_status"
                              :disabled="invalid"
                              class="primary"
                            >
                              Update
                            </v-btn>
                          </v-card-actions>
                        </v-col>
                      </v-row>
                    </v-form>
                  </validation-observer>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <!--End update status -->
          <v-row>
            <v-col cols="12" md="12">
              <v-card>
                <v-card-title> Registration Processes </v-card-title>
                <v-divider />
                <v-simple-table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Comment</th>
                      <th>Status</th>
                      <th>Updated By</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="process in registration.processes"
                      :key="process.id"
                    >
                      <td>{{ process.created_at | toDayDateTimeString }}</td>
                      <td>{{ process.comment }}</td>
                      <td>{{ process.order_status.name }}</td>
                      <td>{{ process.user.name }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title> General Information </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <tbody>
                  <tr>
                    <th>Reg. Date:</th>
                    <td>{{ getOrderDate(registration.created_at) }} <br /></td>
                  </tr>
                  <tr>
                    <th>Reg. No:</th>
                    <td>{{ registration.service_reg_no }}</td>
                  </tr>
                  <tr>
                    <th>Payment Method:</th>
                    <td>{{ registration.payment_method }}</td>
                  </tr>
                  <tr>
                    <th>Platform:</th>
                    <td>{{ registration.platform }}</td>
                  </tr>
                  <tr>
                    <th>Special Amount:</th>
                    <td>৳{{ registration.special_price || 0 }}</td>
                  </tr>
                  <tr>
                    <th>Total Amount:</th>
                    <td>৳{{ registration.price || 0 }}</td>
                  </tr>
                  <tr>
                    <th>Reg. Status:</th>
                    <td class="pt-2 pb-2">
                      <template v-if="registration.service_reg_status">
                        <v-chip
                          class="white--text"
                          :color="registration.service_reg_status.color"
                        >
                          {{ registration.service_reg_status.name }}
                        </v-chip>
                      </template>
                    </td>
                  </tr>
                  <tr>
                    <th>Payment Status:</th>
                    <td class="pt-2 pb-2">
                      <template v-if="registration.payment_status">
                        <v-chip
                          class="white--text text-capitalize"
                          :color="getPaymentStatusColor()"
                        >
                          {{ registration.payment_status }}
                        </v-chip>
                      </template>
                    </td>
                  </tr>

                  <tr>
                    <th>Corporate:</th>
                    <td class="pt-2 pb-2">
                      <template
                        v-if="
                          registration.customer &&
                          registration.customer.employee &&
                          registration.customer.employee.company
                        "
                      >
                        <v-chip class="white--text" color="primary">
                          {{ registration.customer.employee.company.name }}
                        </v-chip>
                      </template>
                      <template v-else>-</template>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>

          <v-card v-if="registration.customer" class="mt-4">
            <v-card-title> Customer Information </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <tbody>
                  <tr>
                    <th>Name:</th>
                    <td>{{ registration.customer.name }}</td>
                  </tr>
                  <tr>
                    <th>Mobile:</th>
                    <td>
                      {{
                        registration.customer.mobile
                          ? registration.customer.mobile
                          : '-'
                      }}
                    </td>
                  </tr>
                  <tr>
                    <th>Email:</th>
                    <td>
                      {{
                        registration.customer.email
                          ? registration.customer.email
                          : '-'
                      }}
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { format } from 'date-fns';

export default {
  name: 'OrderSingle',
  data() {
    return {
      language: 'en',
      dialog: false,
      loading: false,
      registration: null,
      customerInfo: {},
      orderStatuses: [],
      paymentStatuses: [
        { text: 'Paid', value: 'paid' },
        { text: 'Later', value: 'later' },
        { text: 'External', value: 'external' },
        { text: 'Failed', value: 'failed' },
      ],
      updating_status: false,
      form: {
        service_reg_status: '',
        payment_status: '',
        comment: '',
      },
      defaultForm: {
        service_reg_status: '',
        payment_status: '',
        comment: '',
      },
      selectedOrder: null,
      getPaymentStatusColor() {
        let color = 'primary';
        const status = this.registration.payment_status;
        if (status === 'paid') color = 'success';
        else if (status === 'failed') color = 'red';
        else if (status === 'external') color = 'blue';
        return color;
      },
      getOrderDate(createdAt) {
        if (createdAt) return format(new Date(createdAt), 'dd LLLL yyyy');
        else return '';
      },
    };
  },
  async mounted() {
    await this.getServiceRegistration();
    await this.getOrderStatus();
    window.getApp.$on('REFRESH_PAGE_CONTENT', async () => {
      await this.getServiceRegistration();
      await this.getOrderStatus();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // update registration
    async onSubmit() {
      this.updating_status = true;
      try {
        const { message } = await this.$axios.$patch(
          `marketing/service-registration-process/${this.registration.id}`,
          this.form
        );
        this.form = Object.assign({}, this.defaultForm);
        this.updating_status = false;
        setTimeout(() => this.$refs.statusForm.reset());

        // Re-render registration data
        await this.getServiceRegistration();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        this.updating_status = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get Service registration
    async getServiceRegistration() {
      try {
        const { data } = await this.$axios.$get(
          `marketing/service-registration/${this.$route.params.id}`
        );

        this.registration = data;
        this.form.service_reg_status = this.registration.service_reg_status.code;
        this.form.payment_status = this.registration.payment_status;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get registration status
    async getOrderStatus() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/order/status-all`
        );

        this.orderStatuses = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>

<style scoped lang="scss">
.address-card__body {
  font-size: 15px;
  line-height: 18px;
}
.address-card__name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 1.125rem;
}
.address-card__row + .address-card__row {
  margin-top: 0.75rem;
}
.address-card__row-title {
  font-size: 13px;
  color: #6c757d;
  font-weight: 700;
}
</style>
