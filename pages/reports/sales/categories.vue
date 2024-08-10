<template>
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
          <v-btn class="ma-2" outlined color="indigo" @click="pdfDownloadEvent">
            <v-icon left>mdi-file-pdf</v-icon>PDF
          </v-btn>

          <v-btn class="ma-2" outlined color="teal" @click="xlsxDownloadEvent">
            <v-icon left>mdi-file-excel</v-icon>XLSX
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-0">
          <v-data-table
            v-model="selected"
            :headers="main_headers"
            :items="categories"
            :options.sync="pagination"
            :server-items-length="total"
            :loading="loading"
            show-select
            class="elevation-1"
          >
            <!-- Sales Quantity -->
            <template v-slot:item.sales_quantity="{ item }">
              <div class="text-right">{{ item.sales_quantity }}</div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { debounce } from 'lodash-es';
import { getDateOfStartOrEnd } from '@/util';
export default {
  name: 'CategoriesSalesReport',
  props: {
    query: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      categories: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      main_headers: [
        { text: 'Category Name', value: 'name' },
        { text: 'Category Sale Quantity', value: 'sales_quantity' },
        { text: 'Total Purchase Price', value: 'total_purchase_price' },
        { text: 'Total Regular Price', value: 'total_regular_price' },
        { text: 'Special Discount Amount', value: 'special_discount_amount' },
        { text: 'Total Discount Amount', value: 'total_discount_amount' },
        { text: 'Coupon Discount Amount', value: 'coupon_discount_amount' },
        { text: 'Total Sale Price', value: 'total_sale_price' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getCategoriesByPagination();
    },
    // for server side search
    search() {
      this.getCategoriesByPagination();
    },
    // for server side query
    query() {
      this.getCategoriesByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCategoriesByPagination();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get categories by pagination
    getCategoriesByPagination: debounce(async function () {
      this.loading = true;
      let url = `groupType=categories&page=${this.pagination.page}&per_page=${this.pagination.itemsPerPage}`;

      const { dateRange, orderStatus, platforms } = this.query;

      // get by orderStatus keyword
      if (orderStatus && orderStatus.length > 0) {
        url += `&orderStatus=${orderStatus.join(',')}`;
      }

      // get by platforms keyword
      if (platforms && platforms.length > 0) {
        url += `&platform=${platforms.join(',')}`;
      }

      // get by dateRange keyword
      if (dateRange && dateRange.length > 0) {
        url += `&fromDate=${getDateOfStartOrEnd(
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
        this.filters = url;
        const { data, total } = await this.$axios.$get(`reports/sales?${url}`);
        this.loading = false;
        this.categories = data;
        this.total = total;
      } catch (e) {
        this.loading = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    pdfDownloadEvent() {
      console.log('...Donwload pdf file by this filter: ', this.filters);
    },
    xlsxDownloadEvent() {
      console.log('...Donwload xlsx file by this filter: ', this.filters);
    },
  },
};
</script>
