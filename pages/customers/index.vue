<template>
  <div id="customersList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex>
          <v-row dense>
            <v-col cols="4">
              <v-card color="#4fa03e" dark class="text-center">
                <v-card-subtitle class="text-h6 pb-0"
                  >New Customer Today</v-card-subtitle
                >
                <v-card-title class="text-h2 flex-column">
                  {{ customersStatistic.today_new_customer }}
                </v-card-title>
                <v-card-subtitle class="text-h6 pt-0">
                  {{ customersStatistic.today }}
                </v-card-subtitle>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card color="#5388be" dark class="text-center">
                <v-card-subtitle class="text-h6 pb-0"
                  >New Customer In Last 30 Days</v-card-subtitle
                >
                <v-card-title class="text-h2 flex-column">
                  {{ customersStatistic.last_thirty_days_new_customer }}
                </v-card-title>
                <v-card-subtitle class="text-h6 pt-0">
                  ({{ customersStatistic.last_thirty_days_progress }}) prev 30
                  days
                </v-card-subtitle>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card color="#F7961F" dark class="text-center">
                <v-card-subtitle class="text-h6 pb-0"
                  >Total Customers</v-card-subtitle
                >
                <v-card-title class="text-h2 flex-column">
                  {{ customersStatistic.total_customer }}
                </v-card-title>
                <v-card-subtitle class="text-h6 pt-0">
                  {{ customersStatistic.date_range_total_cusotmer }}
                </v-card-subtitle>
              </v-card>
            </v-col>
          </v-row>
        </v-flex>
        <v-flex v-show="isShowFilter" xs12>
          <common-filters v-model="filterQuery" :options="filtersOptions" />
        </v-flex>

        <v-flex xs12>
          <div style="display: flex">
            <h3>Customers</h3>
            <v-spacer />
            <v-switch
              v-model="enabledAutoRefresh"
              dense
              label="Auto refresh"
              hide-details=""
              class="mt-0"
            ></v-switch>
            <!-- <v-btn
              v-can="`create customer`"
              to="/customers/entry"
              color="primary"
              nuxt
            >
              Create Customer
            </v-btn> -->
          </div>
        </v-flex>
        <v-flex xs12>
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

              <v-spacer></v-spacer>

              <v-btn icon @click="showFilterEvent">
                <v-icon>
                  <template v-if="!isShowFilter">mdi-filter</template>
                  <template v-else>mdi-filter-off</template>
                </v-icon>
              </v-btn>
              <!-- <v-btn
                class="ma-2"
                outlined
                color="indigo"
                @click="pdfDownloadEvent"
              >
                <v-icon left>mdi-file-pdf</v-icon>PDF
              </v-btn> -->

              <v-btn
                class="ma-2"
                outlined
                color="teal"
                :loading="isLoadingOfCSVBTN"
                @click="csvDownloadEvent"
              >
                <v-icon left>mdi-download</v-icon>CSV
              </v-btn>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="customers"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.avatar="{ item }">
                  <v-avatar v-if="item.avatar" size="32">
                    <img :src="item.avatar" :alt="item.name" />
                  </v-avatar>
                  <v-avatar v-else size="32" color="purple red--after">
                    <span class="white--text">
                      {{ item.name | avatar }}
                    </span>
                  </v-avatar>
                </template>
                <template v-slot:item.is_corporate="{ item }">
                  <template v-if="item && item.employee">
                    <div class="d-flex">
                      {{ item.employee_id ? 'Yes' : 'No' }}
                      <v-icon
                        v-if="item.employee.is_registered"
                        color="success"
                        class="ml-2"
                        title="Verified user"
                        >mdi-account-check</v-icon
                      >
                    </div>
                  </template>
                </template>

                <template v-slot:item.created_at="{ item }">
                  <template v-if="item && item.created_at">
                    {{ getFormatedDate(item.created_at) }}
                  </template>
                </template>

                <template v-slot:item.child_date_of_birth="{ item }">
                  <template
                    v-if="
                      item && item.childrens && item.childrens['date_of_birth']
                    "
                  >
                    {{ getFormatedDate(item.childrens['date_of_birth'])
                    }}{{ ` (${item.childrens.age})` }}
                  </template>
                  <template
                    v-else-if="
                      item && item.childrens && item.childrens['expecting_date']
                    "
                  >
                    {{ getFormatedDate(item.childrens['expecting_date']) }}
                  </template>
                </template>
                <template v-slot:item.total_order="{ item }">
                  <template v-if="item && item.total_order">
                    {{ item.total_order }}
                  </template>
                  <template v-else=""> - </template>
                </template>
                <template v-slot:item.total_order_amount="{ item }">
                  <template v-if="item && item.total_order_amount">
                    {{ item.total_order_amount }}
                  </template>
                  <template v-else=""> - </template>
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
                  <div class="text-center">
                    <v-btn
                      :v-can="`view customer`"
                      depressed
                      icon
                      fab
                      dark
                      color="secondary"
                      class="mr-0"
                      small
                      title="View details"
                      :to="`/customers/${item.id}`"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>

                    <v-btn
                      v-can="`update customer`"
                      icon
                      small
                      fab
                      color="teal"
                      title="Edit"
                      :to="`/customers/${item.id}/edit?edit=true&lang=${language}`"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      :v-can="`update customer`"
                      depressed
                      icon
                      fab
                      dark
                      color="primary"
                      class="mr-0"
                      small
                      title="Reset password"
                      @click="
                        !!(item.mobile || item.email)
                          ? showResetPasswordModal(item)
                          : null
                      "
                    >
                      <v-icon :disabled="!(item.mobile || item.email)"
                        >mdi-key</v-icon
                      >
                    </v-btn>
                    <v-btn
                      :v-can="`update customer`"
                      depressed
                      icon
                      fab
                      dark
                      color="pink"
                      class="mr-0"
                      small
                      :title="item.status"
                      @click="activeInactiveHandle(item)"
                    >
                      <v-icon v-if="item.status === 'active'"
                        >mdi-account</v-icon
                      >
                      <v-icon v-else="">mdi-account-off</v-icon>
                    </v-btn>
                  </div>
                </template>

                <!-- <template v-slot:item.action="{ item }">
                  <edit-in-same-page-actions
                    update="update customer"
                    delete-action="delete customer"
                    :to="`/customers/entry?id=${item.id}`"
                    @deleteItem="deleteItem(item)"
                  />
                </template> -->
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';
import { format } from 'date-fns';
import { getDateOfStartOrEnd, csvDownload } from '@/util';

export default {
  name: 'Customer',
  data() {
    return {
      language: 'en',
      customers: [],
      selected: [],
      filterQuery: {},
      filtersOptions: {
        isShowCorporate: true,
        isShowOrderStatus: false,
        isShowStatus: true,
        isShowBrand: false,
        isShowService: false,
      },
      search: '',
      total: 0,
      isShowFilter: false,
      loading: false,
      enabledAutoRefresh: true,
      pagination: {},
      isLoadingOfCSVBTN: false,
      customersStatistic: {
        today_new_customer: 0,
        today: format(new Date(), 'dd MMM yyyy'),
        last_thirty_days_new_customer: 0,
        last_thirty_days_progress: '0',
        total_customer: 0,
        date_range_total_cusotmer: 'all',
      },
      headers: [
        { text: 'SI. No', value: 'id' },
        { text: 'Avatar', value: 'avatar' },
        { text: 'Name', value: 'name' },
        { text: 'Mobile', value: 'mobile' },
        { text: 'Email', value: 'email' },
        { text: 'Join Date', value: 'created_at', width: '120px' },
        {
          text: 'Is Corporate',
          value: 'is_corporate',
          width: '100px',
          sortable: false,
        },
        {
          text: 'Child DOB or EDD',
          value: 'child_date_of_birth',
          sortable: false,
          width: '150px',
        },
        { text: 'Total Order', value: 'total_order', sortable: false },
        { text: 'LTV', value: 'total_order_amount', sortable: false },
        // { text: 'Status', value: 'status' },
        {
          text: 'Actions',
          value: 'action',
          sortable: false,
          align: 'center',
          width: '205px',
        },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      getFormatedDate(date) {
        if (date) return getFormatedDate(date);
      },
    };
  },
  watch: {
    pagination() {
      this.getCustomerByPagination();
    },
    search() {
      this.getCustomerByPagination();
    },
    filterQuery(newFilter, oldFilter) {
      this.getCustomerByPagination();
      this.getCustomerStatistic();
    },
  },
  mounted() {
    this.getCustomerStatistic();

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCustomerByPagination();
      this.getCustomerStatistic();
    });

    setInterval(() => {
      if (this.enabledAutoRefresh) {
        this.getCustomerStatistic();
      }
    }, 300000);
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get customer by pagination
    getCustomerByPagination: debounce(async function () {
      this.loading = true;
      const url = getCustomerRequestUrl(this);

      try {
        const { data, meta } = await this.$axios.$get(`customer?${url}`);
        this.loading = false;
        this.customers = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // active/inactive item
    activeInactiveHandle(item) {
      const validText = item.status === 'active' ? 'inactive' : 'active';
      const text = `You would be able to revert this! Please type '${validText}'`;
      const confirmButtonText = 'Yes';
      confirmationAlert(text, confirmButtonText, { isInput: true }).then(
        (res) => {
          if (res.value && validText === res.value) {
            this.updateCustomerInfo(item.id, { status: validText });
          }
          return false;
        }
      );
    },
    async updateCustomerInfo(id, data) {
      try {
        const res = await this.$axios.$patch(
          `customer/update-profile/${id}`,
          data
        );
        this.getCustomerByPagination();
        if (res)
          this.$store.commit('CRUD_SUCCESS_NO_ACTION', 'Successfully updated!');
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async getCustomerStatistic() {
      let url = `customer/statistic?`;
      const { dateRange } = this.filterQuery;

      // get by dateRange keyword
      if (dateRange && dateRange.length > 0) {
        url += `fromDate=${getDateOfStartOrEnd(
          'start',
          null,
          null,
          null,
          dateRange[0]
        )}&toDate=${getDateOfStartOrEnd(
          'end',
          null,
          null,
          null,
          dateRange[1]
        )}`;
      }

      try {
        const data = await this.$axios.$get(url);
        this.customersStatistic = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // pdfDownloadEvent() {
    //   console.log('...Donwload pdf file by this filter: ', this.filters);
    // },
    async csvDownloadEvent() {
      this.isLoadingOfCSVBTN = true;
      const url = getCustomerRequestUrl(this, true);
      try {
        const { data } = await this.$axios.$get(`customer?${url}`);

        const headers = [
          { text: 'Customer id', key: 'id' },
          { text: 'Avatar', key: 'avatar' },
          { text: 'Name', key: 'name' },
          { text: 'Mobile', key: 'mobile' },
          { text: 'Email', key: 'email' },
          { text: 'Join Date', key: 'created_at' },
          { text: 'Child DOB or EDD', key: 'child_dob_edd' },
          { text: 'Total order', key: 'total_order' },
          { text: 'LTV', key: 'total_order_amount' },
        ];

        const dataArray = getDownloadData(data);
        const isDownload = csvDownload('Customers', headers, dataArray);
        if (isDownload) this.isLoadingOfCSVBTN = false;
      } catch (e) {
        this.isLoadingOfCSVBTN = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    showFilterEvent() {
      this.isShowFilter = !this.isShowFilter;
    },
    showResetPasswordModal(item) {
      const validText = 'reset_password';
      const text = `You will not be able to revert this! Please type '${validText}'`;
      const confirmButtonText = 'Yes';
      confirmationAlert(text, confirmButtonText, { isInput: true }).then(
        (res) => {
          if (res.value && validText === res.value) {
            this.resetCustomerPassword(item.id);
          }
          return false;
        }
      );
    },
    async resetCustomerPassword(id) {
      try {
        const res = await this.$axios.$patch(`customer/reset-password/${id}`);
        this.getCustomerByPagination();
        if (res)
          this.$store.commit('CRUD_SUCCESS_NO_ACTION', 'Successfully reset!');
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};

const getCustomerRequestUrl = (instance, isDownload) => {
  let url = `page=${instance.pagination.page}&per_page=${
    isDownload ? -1 : instance.pagination.itemsPerPage
  }`;

  // get by search keyword
  if (instance.search) {
    url += `&query=${instance.search}`;
  }

  // get by sort option
  if (instance.pagination.sortBy.length && !instance.search) {
    const direction = instance.pagination.sortDesc[0] ? 'desc' : 'asc';

    url += `&direction=${direction}&sortBy=${instance.pagination.sortBy[0]}`;
  }

  const { status, dateRange, isCorporate } = instance.filterQuery;
  // get by customer status(active/inactive)
  if (status && status.length > 0) {
    url += `&status=${status.join(',')}`;
  }

  if (isCorporate) {
    url += `&isCorporate=true`;
  } else {
    url += `&isCorporate=false`;
  }

  // get by dateRange keyword
  if (dateRange && dateRange.length > 0) {
    url += `&fromDate=${getDateOfStartOrEnd(
      'start',
      null,
      null,
      null,
      dateRange[0]
    )}&toDate=${getDateOfStartOrEnd('end', null, null, null, dateRange[1])}`;
  }

  return url;
};

const getFormatedDate = (date) => {
  if (date) return format(new Date(date), 'dd MMM yyyy');
  else return '';
};

const getDownloadData = (data) => {
  const csvConentArr = [];
  if (data.length > 0) {
    data.forEach((item) => {
      csvConentArr.push({
        id: item.id || '',
        avatar: item.avatar || '',
        name: item.name || '',
        mobile: item.mobile || '',
        email: item.email || '',
        created_at: getFormatedDate(item.created_at) || '',
        child_dob_edd: item.childrens ? getChildDOBorEDD(item.childrens) : '',
        total_order: item.total_order || '',
        total_order_amount: item.total_order_amount || '',
      });
    });
  }

  return csvConentArr;
};

const getChildDOBorEDD = (childrens) => {
  let dob = '';
  if (childrens) {
    const edd = getFormatedDate(childrens.expecting_date);
    dob = getFormatedDate(childrens.date_of_birth);
    dob = dob || edd;
  }

  return dob;
};
</script>
