<template>
  <div id="serviceRegistrations">
    <v-container grid-list-xl fluid>
      <v-flex v-show="isShowFilter" xs12 class="mb-5">
        <common-filters
          v-model="filterQuery"
          :options="{
            isShowCorporate: false,
            isShowOrderStatus: true,
            isShowStatus: false,
            isShowBrand: true,
            isShowService: true,
          }"
        />
      </v-flex>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Service Registration</h3>
            <v-spacer />
            <v-dialog v-model="dialog" max-width="400px">
              <v-card>
                <v-card-title class="justify-space-between primary white--text">
                  <span class="headline">{{ formTitle }}</span>
                  <v-btn icon dark class="ma-0" @click.stop="close">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <validation-observer v-slot="{ handleSubmit, invalid, reset }">
                  <template v-if="isFormLoaded">
                    <v-form
                      @submit.prevent="handleSubmit(onSubmit)"
                      @reset.prevent="reset"
                    >
                      <v-card-text class="pb-0">
                        <v-row class="mt-5">
                          <v-col md="6" class="py-0">
                            <b-text
                              v-model="editedItem.award_points"
                              rules="decimal:0"
                              outlined
                              dense
                              label="Award Points"
                            />
                          </v-col>
                        </v-row>

                        <active-inactive-dialog
                          v-model="editedItem.status"
                          class="mt-0"
                        />
                      </v-card-text>
                      <v-divider></v-divider>
                      <action-button-dialog
                        :loading="loading"
                        :error="invalid"
                        @close="close"
                      />
                    </v-form>
                  </template>
                </validation-observer>
              </v-card>
            </v-dialog>
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
                :headers="main_headers"
                :items="serviceRegistrations"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.service_title="{ item }">
                  {{ item.service.title }}
                </template>

                <template v-slot:item.registration_by="{ item }">
                  <template v-if="`view customer`">
                    <v-btn
                      plain
                      color="primary"
                      class="linkable-text"
                      title="View details"
                      target="_blank"
                      :to="`/customers/${item.customer && item.customer.id}`"
                    >
                      {{ item.customer && item.customer.name }}
                    </v-btn>
                  </template>
                  <template v-else="">
                    {{ item.customer && item.customer.name }}
                  </template>
                </template>
                <template v-slot:item.service_reg_status="{ item }">
                  <template v-if="item.service_reg_status">
                    <v-chip
                      class="white--text"
                      :color="item.service_reg_status.color"
                    >
                      {{ item.service_reg_status.name }}
                    </v-chip>
                  </template>
                </template>

                <template v-slot:item.action="{ item }">
                  <div class="text-center">
                    <v-btn
                      :v-can="`view service_registration`"
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
                      :to="`/marketing/service-registration/${item.id}`"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>

                    <v-btn
                      :v-can="`update service_registration`"
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
                  </div>
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
import { format } from 'date-fns';
import { getDateOfStartOrEnd, csvDownload } from '@/util';

export default {
  name: 'AppServiceRegistrations',
  data() {
    return {
      language: 'en',
      dialog: false,
      serviceRegistrations: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      filterQuery: {},
      isShowFilter: false,
      isLoadingOfCSVBTN: false,
      pagination: {
        descending: true,
      },
      selectedPlatforms: [],
      main_headers: [
        { text: 'Date/Time', value: 'created_at' },
        { text: 'Registration No', value: 'service_reg_no' },
        { text: 'Service Title', value: 'service_title' },
        { text: 'Registration By', value: 'registration_by' },
        { text: 'Status', value: 'service_reg_status' },
        { text: 'Actions', value: 'action', sortable: true, align: 'center' },
      ],
      editedIndex: -1,
      isFormLoaded: true,
      editedItem: {
        id: 0,
        end_date: '',
        status: 'active',
      },
      defaultItem: {
        id: 0,
        start_date: '',
        status: 'active',
      },
      getFormatTime(time) {
        return time ? format(new Date(time), "dd-MMM-yyyy' 'KK:mm aa") : '';
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Award Point' : 'Edit Award Point';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getServiceRegistrationsByPagination();
    },
    // for server side search
    search() {
      this.getServiceRegistrationsByPagination();
    },
    dialog() {
      if (!this.dialog) {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.selectedPlatforms = [];
        this.isFormLoaded = false;
        setTimeout(() => {
          this.isFormLoaded = true;
        }, 100);
      }
    },
    filterQuery(newFilter, oldFilter) {
      this.getServiceRegistrationsByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getServiceRegistrationsByPagination();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get offer redeem by pagination
    getServiceRegistrationsByPagination: debounce(async function () {
      this.loading = true;
      const url = getRequestUrl(this);

      try {
        const { data, meta } = await this.$axios.$get(
          `marketing/service-registration?${url}`
        );
        this.loading = false;
        this.serviceRegistrations = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // open dialog to edit category
    editItem(item) {
      // this.selectedPlatforms = item.platforms;

      this.editedIndex = this.serviceRegistrations.indexOf(item);

      if (item && !item.category) {
        return;
      }

      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    // close dialog
    close() {
      this.dialog = false;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
    },
    onSubmit() {
      let url;
      let method;
      if (this.editedIndex > -1) {
        url = `marketing/offer-redeems/${this.editedItem.id}`;
        method = 'PATCH';
        this.update(url, method);
      }
    },
    async update(url, method, options) {
      try {
        const editedItem = this.editedItem;
        editedItem.award_points = this.editedItem.award_points * 1;

        const { message } = (
          await this.$axios({
            url,
            method,
            data: editedItem,
          })
        ).data;

        this.getServiceRegistrationsByPagination();
        this.close();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (err) {
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
    showFilterEvent() {
      this.isShowFilter = !this.isShowFilter;
    },

    async csvDownloadEvent() {
      this.isLoadingOfCSVBTN = true;
      const url = getRequestUrl(this, true);
      try {
        const { data } = await this.$axios.$get(
          `marketing/service-registration?${url}`
        );

        const headers = [
          { text: 'Reg. Date', key: 'created_at' },
          { text: 'Service Reg. Id', key: 'id' },
          { text: 'Service Reg. No', key: 'service_reg_no' },
          { text: 'Registration Status', key: 'registration_status' },
          { text: 'Service Name', key: 'service_title' },
          { text: 'Brand Name', key: 'brand_name' },
          { text: 'Customer Id', key: 'customer_id' },
          { text: 'Customer Name', key: 'customer_name' },
          { text: 'Customer Mobile', key: 'mobile' },
          { text: 'Customer Email', key: 'email' },
          { text: 'Customer Info', key: 'customer_info' },
          { text: 'Booking Info', key: 'booking_info' },
          { text: 'Questions', key: 'questions' },
        ];

        const dataArray = getDownloadData(data);
        const isDownload = csvDownload(
          'Service_registrations',
          headers,
          dataArray
        );
        if (isDownload) this.isLoadingOfCSVBTN = false;
      } catch (e) {
        this.isLoadingOfCSVBTN = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};

const getRequestUrl = (instance, isDownload) => {
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

  const { orderStatus, dateRange, brand, service } = instance.filterQuery;
  // get by registration order status code
  if (orderStatus && orderStatus.length > 0) {
    let orderStatusList = orderStatus;
    if (typeof orderStatus[0] === 'object') {
      orderStatusList = orderStatus.map((item) => item.value);
    }
    url += `&orderStatus=${orderStatusList.join(',')}`;
  }

  if (brand && brand.length > 0) {
    let brandsList = brand;
    if (typeof brand[0] === 'object') {
      brandsList = brand.map((item) => item.value);
    }
    url += `&brands=${brandsList.join(',')}`;
  }

  if (service && service.length > 0) {
    let servicesList = service;
    if (typeof service[0] === 'object') {
      servicesList = service.map((item) => item.value);
    }
    url += `&services=${servicesList.join(',')}`;
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

const getDownloadData = (data) => {
  const csvConentArr = [];
  if (data.length > 0) {
    data.forEach((item) => {
      csvConentArr.push({
        created_at: item.created_at
          ? format(new Date(item.created_at), 'dd-MMM-yyyy')
          : '',
        id: item.id || '',
        service_reg_no: item.service_reg_no || '',
        registration_status: item.service_reg_status.name || '',
        brand_name: item.brand.name || '',
        service_title: item.service.title || '',
        customer_id: item.customer.id || '',
        customer_name: item.customer.name || '',
        mobile: item.customer.mobile || '',
        email: item.customer.email || '',
        customer_info: item.customer_info
          ? getCustomerInfo(item.customer_info)
          : '',
        booking_info: item.booking_info || '',
        questions: item.questions ? getQuestions(item.questions) : '',
      });
    });
  }

  return csvConentArr;
};

const getCustomerInfo = (info) => {
  let str = '';
  Object.keys(info).forEach((key) => {
    str += `${key}: ${info[key]}; `;
  });
  return str;
};

const getQuestions = (qusList) => {
  let str = '';
  if (qusList.length) {
    qusList.forEach((questionInfo) => {
      str += `${questionInfo.id}. ${questionInfo.question} Answer: ${questionInfo.answer}; `;
    });
  }
  return str;
};
</script>
