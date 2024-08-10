<template>
  <div id="paymentStatus">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Payment Statuses</h3>
            <v-spacer />
            <v-btn
              v-can="`create payment_status`"
              color="primary"
              dark
              :loading="creating"
              @click="create"
            >
              New Payment Status
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
                :items="paymentStatuses"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.color="{ item }">
                  <v-chip :color="item.color" label>
                    {{ item.color }}
                  </v-chip>
                </template>
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
                    update="update payment_status"
                    delete-action="delete payment_status"
                    :to="`/payment/statuses/${item.id}?edit=true&lang=${language}`"
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
  name: 'PaymentStatus',
  data() {
    return {
      language: 'en',
      dialog: false,
      paymentStatuses: [],
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
        { text: 'Color', value: 'color' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getPaymentStatusByPagination();
    },
    // for server side search
    search() {
      this.getPaymentStatusByPagination();
    },
    language() {
      this.getPaymentStatusByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getPaymentStatusByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get paymentStatuses by pagination
    getPaymentStatusByPagination: debounce(async function () {
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
          `${this.language}/payment/status?${url}`
        );
        this.loading = false;
        this.paymentStatuses = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create paymentStatuses
    async create() {
      this.creating = true;
      try {
        const { paymentStatusId } = await this.$axios.$post(
          `${this.language}/payment/status`
        );
        this.creating = false;
        this.$router.push(`/payment/statuses/${paymentStatusId}`);
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete paymentStatuses
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deletePaymentStatus(item.id);
        }
        return false;
      });
    },
    async deletePaymentStatus(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/payment/status/${id}`
        );
        this.getPaymentStatusByPagination();
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
