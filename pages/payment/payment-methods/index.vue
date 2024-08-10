<template>
  <div id="paymentMethod">
    <v-container grid-list-xl fluid>
      <v-row row wrap>
        <v-col>
          <div style="display: flex">
            <h3>Payment Methods</h3>
            <v-spacer />
            <v-btn
              v-can="`create payment_method`"
              color="primary"
              dark
              :loading="creating"
              @click="create"
            >
              New Payment Method
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
              <div>
                <b-language v-model="language" />
              </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="main_headers"
                :items="payment_methods"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.status="{ item }">
                  <v-chip
                    class="white--text"
                    :color="item.status === 'active' ? 'success' : 'warning'"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>
                <template v-slot:item.action="{ item }">
                  <edit-in-same-page-actions
                    update="update payment_method"
                    delete-action="delete payment_method"
                    :to="`/payment/payment-methods/${item.id}?edit=true&lang=${language}`"
                    @editItem="editItem(item)"
                    @deleteItem="deleteItem(item)"
                  />
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'PaymentMethod',
  data() {
    return {
      language: 'en',
      dialog: false,
      payment_methods: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      main_headers: [
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Description', value: 'description', sortable: false },
        { text: 'Code', value: 'code' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getPaymentMethodByPagination();
    },
    // for server side search
    search() {
      this.getPaymentMethodByPagination();
    },
    language() {
      this.getPaymentMethodByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getPaymentMethodByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get payment_methods by pagination
    getPaymentMethodByPagination: debounce(async function () {
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
        const { data, meta } = await this.$axios.$get(
          `${this.language}/payment/payment-method?${url}`
        );
        this.loading = false;
        this.payment_methods = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create payment_methods
    async create() {
      this.creating = true;
      try {
        const { paymentMethodId } = await this.$axios.$post(
          `${this.language}/payment/payment-method`
        );
        this.creating = false;
        this.$router.push(`/payment/payment-methods/${paymentMethodId}`);
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete payment_methods
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deletePaymentMethod(item.id);
        }
        return false;
      });
    },
    async deletePaymentMethod(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/payment/payment-method/${id}`
        );
        this.getPaymentMethodByPagination();
        this.$store.dispatch('crud_success_dialog', message);
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
