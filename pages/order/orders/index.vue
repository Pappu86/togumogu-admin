<template>
  <div id="order">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Orders</h3>
            <v-spacer />
            <v-btn
              v-can="`create order`"
              color="primary"
              dark
              to="/order/orders/create"
            >
              Create New Order
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title class="pa-1">
              <v-text-field
                v-model="search"
                solo
                flat
                prepend-inner-icon="mdi-magnify"
                placeholder="Type something"
                hide-details
              ></v-text-field>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="main_headers"
                :items="orders"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.customer_name="{ item }">
                  <template v-if="item.customer">
                    {{ item.customer.name }}
                  </template>
                </template>
                <template v-slot:item.customer_mobile="{ item }">
                  <template v-if="item.customer">
                    {{ item.customer.mobile ? item.customer.mobile : '-' }}
                  </template>
                </template>
                <template v-slot:item.customer_corporate="{ item }">
                  <template
                    v-if="
                      item.customer &&
                      item.customer.employee &&
                      item.customer.employee.company
                    "
                  >
                    <v-chip class="white--text" color="primary">
                      {{ item.customer.employee.company.name }}
                    </v-chip>
                  </template>
                  <template v-else>-</template>
                </template>
                <template v-slot:item.order_status="{ item }">
                  <template v-if="item.order_status">
                    <v-chip
                      class="white--text"
                      :color="item.order_status.color"
                    >
                      {{ item.order_status.name }}
                    </v-chip>
                  </template>
                </template>
                <template v-slot:item.payment_status="{ item }">
                  <template v-if="item.payment_status">
                    <v-chip
                      class="white--text"
                      :color="item.payment_status.color"
                    >
                      {{ item.payment_status.name }}
                    </v-chip>
                  </template>
                </template>
                <template v-slot:item.action="{ item }">
                  <div class="text-center">
                    <v-btn
                      :v-can="`view order`"
                      depressed
                      outlined
                      icon
                      fab
                      dark
                      color="primary"
                      class="mr-0"
                      small
                      nuxt
                      title="View"
                      :to="`/order/orders/${item.id}`"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                      :v-can="`update order`"
                      depressed
                      outlined
                      icon
                      fab
                      dark
                      color="secondary"
                      class="mr-0"
                      small
                      title="Update Provider"
                      @click="updateProvider(item)"
                    >
                      <v-icon>mdi-truck</v-icon>
                    </v-btn>
                    <v-btn
                      :v-can="`update order`"
                      depressed
                      outlined
                      icon
                      fab
                      dark
                      color="teal"
                      class="mr-0"
                      small
                      title="Edit"
                      @click="editItem(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      :v-can="`delete order`"
                      depressed
                      outlined
                      icon
                      fab
                      dark
                      color="pink"
                      class="mr-0"
                      small
                      title="Delete"
                      @click="deleteItem(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <!-- START ORDER UPDATE DIALOG -->
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Update Order</span>
          <v-btn icon dark class="ma-0" @click.stop="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <validation-observer v-slot="{ handleSubmit, invalid, reset }">
          <v-form
            @submit.prevent="handleSubmit(onSubmit)"
            @reset.prevent="reset"
          >
            <v-card-text>
              <b-auto-complete
                v-model="editedItem.order_status"
                :items="orderStatuses"
                item-text="name"
                item-value="code"
                outlined
                label="Select Order Status"
              />
              <b-auto-complete
                v-model="editedItem.payment_status"
                :items="paymentStatuses"
                item-text="name"
                item-value="code"
                outlined
                label="Select Payment Status"
              />
            </v-card-text>
            <v-divider />
            <action-button-dialog
              :loading="updating_status"
              :error="invalid"
              @close="close"
            />
          </v-form>
        </validation-observer>
      </v-card>
    </v-dialog>
    <!-- END ORDER UPDATE DIALOG -->

    <!-- START ORDER UPDATE DIALOG -->
    <v-dialog v-model="providerDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Update Shipping Provider</span>
          <v-btn icon dark class="ma-0" @click.stop="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <validation-observer v-slot="{ handleSubmit, invalid, reset }">
          <v-form
            @submit.prevent="handleSubmit(assignProviderToOrder)"
            @reset.prevent="reset"
          >
            <v-card-text>
              <b-auto-complete
                v-model="selectedProvider"
                :items="shippingProviders"
                item-text="name"
                item-value="id"
                outlined
                return-object
                label="Select Shipping Provider"
              />
              <template v-if="selectedProvider && selectedProvider.hasApi">
                <!-- <b-auto-complete
                  v-model="provider.package_option"
                  :items="selectedProvider.packageOption"
                  outlined
                  label="Select Package Option"
                /> -->
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
                  label="Have to collect money"
                />
              </template>
            </v-card-text>
            <v-divider />
            <action-button-dialog
              :loading="updating_status"
              :error="invalid"
              @close="closeDialog"
            />
          </v-form>
        </validation-observer>
      </v-card>
    </v-dialog>
    <!-- END ORDER UPDATE DIALOG -->
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'Order',
  data() {
    return {
      language: 'en',
      dialog: false,
      orders: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: null,
      main_headers: [
        { text: 'Order Date', value: 'created_at' },
        { text: 'Order No', value: 'order_no' },
        { text: 'Customer Name', value: 'customer_name', sortable: false },
        { text: 'Mobile', value: 'delivery_mobile', sortable: false },
        { text: 'Corporate', value: 'customer_corporate', sortable: false },
        { text: 'Order Status', value: 'order_status' },
        { text: 'Payment Status', value: 'payment_status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      editedItem: {
        orderId: 0,
        order_status: '',
        payment_status: '',
      },
      defaultItem: {
        orderId: 0,
        order_status: '',
        payment_status: '',
      },
      updating_status: false,
      orderStatuses: [],
      paymentStatuses: [],
      shippingProviders: [],
      providerDialog: false,
      provider: {
        order_id: 0,
        package_option: '',
        delivery_option: '',
        collectMoney: false,
      },
      defaultProvider: {
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
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getOrdersByPagination();
    },
    // for server side search
    search() {
      this.getOrdersByPagination();
    },
  },
  async mounted() {
    await this.getOrderStatus();
    await this.getPaymentStatus();
    await this.getShippingProviders();
    // Pathao api request
    await this.getPathaoStores();
    await this.getPathaoCities();
    window.getApp.$on('REFRESH_PAGE_CONTENT', async () => {
      await this.getOrdersByPagination();
      await this.getOrderStatus();
      await this.getPaymentStatus();
      await this.getShippingProviders();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get orders by pagination
    getOrdersByPagination: debounce(async function () {
      this.loading = true;
      let url = `page=${this.pagination.page}&per_page=${this.pagination.itemsPerPage}`;
      // get by search keyword
      if (this.search) {
        url += `&query=${this.search}`;
      }

      // get by sort option
      if (this.pagination.sortBy.length && !this.search) {
        const direction = this.pagination.sortDesc[0] ? 'desc' : 'asc';

        url += `&direction=${direction}&sortBy=${this.pagination.sortBy[0]}`;
      }

      try {
        const { data, meta } = await this.$axios.$get(`order/order?${url}`);
        this.loading = false;
        this.orders = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // edit orders
    editItem(item) {
      this.editedItem.orderId = item.id;
      this.editedItem.order_status =
        item.order_status && item.order_status.code;
      this.editedItem.payment_status =
        item.payment_status && item.payment_status.code;
      this.editedItem.showroom_id = item.showroom_id;
      setTimeout(() => (this.dialog = true), 300);
    },
    // close
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
      }, 100);
    },
    // update provider
    updateProvider(item) {
      this.selectedOrder = Object.assign({}, item);
      this.provider.order_id = item.id;
      setTimeout(() => (this.providerDialog = true), 200);
    },
    // assign provider to order
    async assignProviderToOrder() {
      this.updating_status = true;
      try {
        const { message } = await this.$axios.$post(
          `shipping/pathao/order`,
          this.provider
        );
        this.updating_status = false;
        this.getOrdersByPagination();
        this.$store.dispatch('crud_success_dialog', message);
        this.closeDialog();
      } catch (e) {
        this.updating_status = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // close provider dailog
    closeDialog() {
      this.providerDialog = false;
      this.resetDialogForm();
      setTimeout(() => (this.selectedOrder = null), 200);
    },
    // Reset provider dailog
    resetDialogForm() {
      this.provider = this.defaultProvider;
      this.selectedProvider = null;
    },
    // update order
    async onSubmit() {
      this.updating_status = true;
      try {
        const { message } = await this.$axios.$patch(
          `order/order-status/${this.editedItem.orderId}`,
          this.editedItem
        );
        this.updating_status = false;
        this.getOrdersByPagination();
        this.$store.dispatch('crud_success_dialog', message);
        this.close();
      } catch (e) {
        this.updating_status = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete orders
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteOrders(item.id);
        }
        return false;
      });
    },
    async deleteOrders(id) {
      try {
        const { message } = await this.$axios.$delete(`order/order/${id}`);
        this.getOrdersByPagination();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        this.$store.commit(
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
  },
};
</script>
