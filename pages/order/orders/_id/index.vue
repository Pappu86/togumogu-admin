<template>
  <div id="orderSingle">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Order Details</h3>
            <v-spacer />
            <v-btn
              v-if="order"
              class="primary"
              nuxt
              :to="`/order/orders/${order.id}/invoice`"
            >
              <v-icon left>mdi-receipt</v-icon> Invoice
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row v-if="order">
        <v-col cols="12" md="8">
          <v-card class="mb-5">
            <v-card-title> Product Information </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in order.products" :key="i">
                    <td>
                      <template v-if="item.product">
                        <v-img
                          :src="item.product.image"
                          width="100"
                          height="100"
                        />
                      </template>
                    </td>
                    <td>
                      <template v-if="item.product">
                        <a
                          :href="
                            $config.frontendURL +
                            '/shop/products/' +
                            item.product.slug
                          "
                          target="_blank"
                        >
                          {{ item.product.name }}
                        </a>
                      </template>
                    </td>
                    <td class="text-right">
                      {{ item.quantity }}
                    </td>
                    <td class="text-right">
                      ৳{{ item.quantity * item.selling_unit_price }} <br />

                      <small
                        v-if="
                          item.selling_unit_price !== item.regular_unit_price
                        "
                      >
                        <del style="opacity: 0.5">{{
                          item.regular_unit_price
                        }}</del>
                      </small>
                    </td>
                  </tr>
                  <template v-if="order.emi_info">
                    <tr v-if="order.emi_info.includeReg">
                      <th colspan="3">Registration & Insurance</th>
                      <td>৳{{ order.emi_info.regInsuranceCharge }}</td>
                    </tr>
                    <tr>
                      <th colspan="3">Total Installment</th>
                      <td>{{ order.emi_info.month }}</td>
                    </tr>
                    <tr>
                      <th colspan="3">Installment Percentage</th>
                      <td>{{ order.emi_info.interest }}%</td>
                    </tr>
                    <tr>
                      <th colspan="3">Monthly Installment</th>
                      <td>৳{{ order.emi_info.payable }}</td>
                    </tr>
                    <tr>
                      <th colspan="3">Down Payment</th>
                      <td>৳{{ order.emi_info.downPayment }}</td>
                    </tr>
                  </template>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
          <v-row>
            <v-col cols="12" md="6">
              <AddressCard
                v-if="order.static_address"
                :address="order.static_address.billing"
                label="Billing Address"
              />
            </v-col>
            <v-col cols="12" md="6">
              <AddressCard
                v-if="order.static_address"
                :address="order.static_address.shipping"
                label="Shipping Address"
              />
            </v-col>
          </v-row>
          <!--Start update status -->
          <v-row>
            <!-- Start update order status -->
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
                            v-model="form.order_status"
                            :items="orderStatuses"
                            item-text="name"
                            item-value="code"
                            outlined
                            label="Select Order Status"
                            hide-details
                          />
                        </v-col>
                        <!-- End update order status -->
                        <!-- Start update payment status -->
                        <v-col cols="12" md="6" sm="6">
                          <b-auto-complete
                            v-model="form.payment_status"
                            :items="paymentStatuses"
                            item-text="name"
                            item-value="code"
                            outlined
                            label="Select Payment status"
                            hide-details
                          />
                        </v-col>
                        <!-- End update payment status -->
                        <!-- Start update shipping provider -->
                        <v-col cols="12" md="6" sm="6">
                          <b-auto-complete
                            v-model="form.shipping_provider"
                            :items="shippingProviders"
                            item-text="name"
                            item-value="code"
                            outlined
                            label="Select provider"
                            hide-details
                            return-object
                            @change="changeShippingProvider"
                          />

                          <!-- <b-auto-complete
                              v-model="selectedProvider"
                              :items="shippingProviders"
                              item-text="name"
                              rules="required"
                              item-value="id"
                              outlined
                              return-object
                              hide-details
                              label="Select Provider"
                            /> -->
                        </v-col>
                        <!-- Start update shipping provider -->
                        <v-col cols="12" md="6" sm="6">
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
                <v-card-title> Order Processes </v-card-title>
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
                    <tr v-for="process in order.processes" :key="process.id">
                      <td>{{ process.created_at | toDayDateTimeString }}</td>
                      <td>{{ process.comment }}</td>
                      <td>{{ process.order_status.name }}</td>
                      <td>{{ process.user.name }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card>
            </v-col>
            <!-- <v-col cols="12" md="4">
              <v-card>
                <v-card-title> Update Order Status </v-card-title>
                <v-divider />
                <validation-observer
                  ref="statusForm"
                  v-slot="{ handleSubmit, invalid, reset }"
                >
                  <v-form
                    @submit.prevent="handleSubmit(onSubmit)"
                    @reset.prevent="reset"
                  >
                    <v-card-text>
                      <b-auto-complete
                        v-model="form.order_status"
                        rules="required"
                        :items="orderStatuses"
                        item-text="name"
                        item-value="code"
                        outlined
                        label="Select Order Status"
                      />
                      <b-text-area
                        v-model="form.comment"
                        rules="required"
                        outlined
                        label="Enter Comment"
                      />
                    </v-card-text>
                    <v-divider />
                    <v-card-actions>
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
                  </v-form>
                </validation-observer>
              </v-card>
            </v-col> -->
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
                    <th>Order Date:</th>
                    <td>{{ getOrderDate(order.created_at) }} <br /></td>
                  </tr>
                  <tr>
                    <th>Order No:</th>
                    <td>{{ order.order_no }}</td>
                  </tr>
                  <tr>
                    <th>Invoice No:</th>
                    <td>{{ order.invoice_no }}</td>
                  </tr>
                  <tr>
                    <th>Payment Method:</th>
                    <td>{{ getPaymentMethod(order.payment_method) }}</td>
                  </tr>
                  <tr>
                    <th>Platform:</th>
                    <td>{{ order.platform }}</td>
                  </tr>
                  <tr>
                    <th>Total Quantity:</th>
                    <td>{{ order.total_quantity }}</td>
                  </tr>
                  <tr>
                    <th>Total Amount:</th>
                    <td>৳{{ order.total_amount }}</td>
                  </tr>
                  <tr>
                    <th>Order Status:</th>
                    <td class="pt-2 pb-2">
                      <template v-if="order.order_status">
                        <v-chip
                          class="white--text"
                          :color="order.order_status.color"
                        >
                          {{ order.order_status.name }}
                        </v-chip>
                      </template>
                    </td>
                  </tr>
                  <tr>
                    <th>Payment Status:</th>
                    <td class="pt-2 pb-2">
                      <template v-if="order.payment_status">
                        <v-chip
                          class="white--text"
                          :color="order.payment_status.color"
                        >
                          {{ order.payment_status.name }}
                        </v-chip>
                      </template>
                    </td>
                  </tr>
                  <tr>
                    <th>Shipping provider:</th>
                    <td>
                      <template v-if="order.shipping_method">
                        {{ getShippingProviderName(order.shipping_method) }}
                      </template>
                    </td>
                  </tr>
                  <tr>
                    <th>Corporate:</th>
                    <td class="pt-2 pb-2">
                      <template
                        v-if="
                          order.customer &&
                          order.customer.employee &&
                          order.customer.employee.company
                        "
                      >
                        <v-chip class="white--text" color="primary">
                          {{ order.customer.employee.company.name }}
                        </v-chip>
                      </template>
                      <template v-else>-</template>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
          <v-card class="mt-4">
            <v-card-title> Order note </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <tbody>
                  <tr>
                    <th>Note:</th>
                    <td>{{ order.comment ? order.comment : '-' }}</td>
                  </tr>
                  <tr>
                    <th>Send As Gift:</th>
                    <td class="text-capitalize">{{ order.send_as_gift }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
          <v-card v-if="order.customer" class="mt-4">
            <v-card-title> Customer Information </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <tbody>
                  <tr>
                    <th>Name:</th>
                    <td>{{ order.customer.name }}</td>
                  </tr>
                  <tr>
                    <th>Mobile:</th>
                    <td>
                      {{ order.customer.mobile ? order.customer.mobile : '-' }}
                    </td>
                  </tr>
                  <tr>
                    <th>Email:</th>
                    <td>
                      {{ order.customer.email ? order.customer.email : '-' }}
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
          <v-card v-if="order.showroom" class="mt-4">
            <v-card-title> Showroom Information </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <tbody>
                  <tr>
                    <th>Name:</th>
                    <td>{{ order.showroom.name }}</td>
                  </tr>
                  <tr v-if="order.showroom.contacts">
                    <th>Mobile:</th>
                    <td>
                      <span
                        v-for="(showroom, idx) in order.showroom.contacts"
                        :key="idx"
                      >
                        {{ showroom.mobile }}&nbsp;&nbsp;
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Email:</th>
                    <td>{{ order.showroom.email }}</td>
                  </tr>
                  <tr>
                    <th>Address:</th>
                    <td>{{ order.showroom.address }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- START ORDER PROVIDER UPDATE DIALOG -->
    <v-dialog v-model="isOpenProviderDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Update provider</span>
          <v-btn icon dark class="ma-0" @click.stop="closeDialog('isReset')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <validation-observer v-slot="{ handleSubmit, invalid, reset }">
          <v-form
            @submit.prevent="handleSubmit(closeDialog())"
            @reset.prevent="reset"
          >
            <v-card-text class="pb-0">
              <template v-if="selectedProvider && selectedProvider.hasApi">
                <b-auto-complete
                  v-model="provider.delivery_option"
                  :items="selectedProvider.deliveryOption"
                  outlined
                  label="Select Delivery Option"
                />
                <b-auto-complete
                  v-model="provider.store_id"
                  :items="pathaoStores"
                  item-text="store_name"
                  item-value="store_id"
                  outlined
                  label="Select Store"
                />
                <b-auto-complete
                  v-model="provider.recipient_city"
                  :items="pathaoCities"
                  item-text="city_name"
                  item-value="city_id"
                  outlined
                  label="Select Customer City"
                  @change="getPathaoZones(provider.recipient_city)"
                />
                <b-auto-complete
                  v-model="provider.recipient_zone"
                  :items="pathaoZones"
                  item-text="zone_name"
                  item-value="zone_id"
                  outlined
                  label="Select Customer Zone"
                  @change="getPathaoAreas(provider.recipient_zone)"
                />
                <b-auto-complete
                  v-model="provider.recipient_area"
                  :items="pathaoAreas"
                  item-text="area_name"
                  item-value="area_id"
                  outlined
                  label="Select Customer Area"
                />
                <b-auto-complete
                  v-model="provider.item_type"
                  :items="[
                    { text: 'Document', value: 1 },
                    { text: 'Parcel', value: 2 },
                  ]"
                  outlined
                  label="Select Item Type"
                />
                <v-checkbox
                  v-model="provider.collectMoney"
                  class="mt-0 mb-0"
                  label="Have to collect money"
                />
              </template>
            </v-card-text>
            <v-divider />
            <action-button-dialog
              :loading="updating_status"
              :error="invalid"
              title="Ok"
              @close="closeDialog('isReset')"
            />
          </v-form>
        </validation-observer>
      </v-card>
    </v-dialog>
    <!-- END ORDER PROVIDER UPDATE DIALOG -->
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
      order: null,
      orderStatuses: [],
      paymentStatuses: [],
      shippingProviders: [],
      updating_status: false,
      isOpenProviderDialog: false,
      form: {
        order_status: '',
        payment_status: '',
        shipping_provider: '',
        comment: '',
      },
      defaultForm: {
        order_status: '',
        payment_status: '',
        shipping_provider: '',
        comment: '',
      },
      provider: {
        order_id: 0,
        package_option: '',
        delivery_option: '',
        collectMoney: false,
      },
      selectedProvider: null,
      selectedOrder: null,
      // pathao
      pathaoStores: [],
      pathaoCities: [],
      pathaoZones: [],
      pathaoAreas: [],
      getShippingProviderName(providerCode) {
        const providers = this.shippingProviders;
        let name = '-';

        if (providers.length > 0) {
          const providerInfo = providers.find(
            (item) => item.code === providerCode
          );
          if (providerInfo && providerInfo.name) name = providerInfo.name;
        }
        return name;
      },
      paymentMethods: [],
      getPaymentMethod(code) {
        if (code) {
          const payment = this.paymentMethods.find(
            (payment) => payment.code === code
          );
          return (payment && payment.name) || '';
        }
        return '';
      },
      getOrderDate(createdAt) {
        if (createdAt) return format(new Date(createdAt), 'dd LLLL yyyy');
        else return '';
      },
    };
  },
  async mounted() {
    await this.getOrder();
    await this.getOrderStatus();
    await this.getPaymentStatus();
    await this.getShippingProviders();
    await this.getPaymentMethods();
    // Pathao api request
    await this.getPathaoStores();
    await this.getPathaoCities();
    window.getApp.$on('REFRESH_PAGE_CONTENT', async () => {
      await this.getOrder();
      await this.getOrderStatus();
      await this.getPaymentStatus();
      await this.getShippingProviders();
      await this.getPaymentMethods();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    changeShippingProvider() {
      const form = this.form;
      const provider = form && form.shipping_provider;
      if (provider && provider.hasApi) {
        this.isOpenProviderDialog = true;
        this.selectedProvider = provider;
      }
    },
    // update order
    async onSubmit() {
      this.updating_status = true;
      try {
        const { message } = await this.$axios.$patch(
          `order/order-process/${this.order.id}`,
          this.form
        );
        this.form = Object.assign({}, this.defaultForm);
        this.updating_status = false;
        setTimeout(() => this.$refs.statusForm.reset());

        // Request to pathao provider
        this.sendPathaoProviderRequest();

        // Re-render order data
        await this.getOrder();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        this.updating_status = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get order
    async getOrder() {
      const instance = this;
      try {
        const { data } = await instance.$axios.$get(
          `order/order/${instance.$route.params.id}`
        );

        instance.order = data;
        instance.form.order_status = instance.order.order_status.code;
        instance.form.payment_status = instance.order.payment_status.code;
        instance.provider.order_id = data.id;
      } catch (e) {
        instance.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get order status
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
    // get payment status
    async getPaymentStatus() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/payment/status-all`
        );
        this.paymentStatuses = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // close provider dailog
    closeDialog(eventType) {
      this.isOpenProviderDialog = false;
      if (eventType === 'isReset') {
        this.form.shipping_provider = '';
      }
      setTimeout(() => (this.selectedOrder = null), 200);
    },
    // get shipping providers
    async sendPathaoProviderRequest() {
      const instance = this;
      const providerData = {
        ...instance.provider,
        provider_code: this.selectedProvider.code,
      };
      instance.updating_status = true;
      try {
        const { message } = await instance.$axios.$post(
          `shipping/pathao/order`,
          providerData
        );
        instance.updating_status = false;
        instance.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        instance.updating_status = false;
        instance.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get shipping providers
    async getShippingProviders() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/shipping/provider-all`
        );
        this.shippingProviders = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get shipping pathao stores
    async getPathaoStores() {
      try {
        const { data } = await this.$axios.$get(`shipping/pathao/store`);
        this.pathaoStores = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get shipping pathao cities
    async getPathaoCities() {
      try {
        const { data } = await this.$axios.$get(`shipping/pathao/cities`);
        this.pathaoCities = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get shipping pathao zones
    async getPathaoZones(cityId) {
      try {
        const { data } = await this.$axios.$get(
          `shipping/pathao/zones/${cityId}`
        );
        this.pathaoZones = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get shipping pathao areas
    async getPathaoAreas(zoneId) {
      try {
        const { data } = await this.$axios.$get(
          `shipping/pathao/areas/${zoneId}`
        );
        this.pathaoAreas = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get payment_methods
    async getPaymentMethods() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/payment/payment-method`
        );

        this.paymentMethods = data;
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
