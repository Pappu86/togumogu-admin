<template>
  <div id="sales">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col cols="12">
          <v-layout class="pl-3 pr-3 mb-1">
            <v-select
              v-model="selectedReports"
              class="mr-5"
              :items="reportsTypeList"
              label="Report for"
              outlined
              dense
              hide-details="auto"
            ></v-select>
            <v-btn depressed color="primary" @click="showFilterEvent">
              <v-icon>
                <template v-if="!isShowFilter">mdi-filter</template>
                <template v-else>mdi-filter-off</template> </v-icon
              >Filter
            </v-btn>
          </v-layout>
        </v-col>
        <v-col v-show="isShowFilter" v-if="isFilterRender" cols="12">
          <Filters v-model="filterQuery" :options="filtersOptions"></Filters>
        </v-col>
      </v-row>

      <template v-if="selectedReports === 'Products'">
        <ProductsSalesReport :query="filterQuery"></ProductsSalesReport>
      </template>
      <template v-if="selectedReports === 'Categories'">
        <CategoriesSalesReport :query="filterQuery"></CategoriesSalesReport>
      </template>
      <template v-if="selectedReports === 'Cities'">
        <CitiesSalesReport :query="filterQuery"></CitiesSalesReport>
      </template>
      <template v-if="selectedReports === 'Summary'">
        <SalesSummary :query="filterQuery"></SalesSummary>
      </template>
    </v-container>
  </div>
</template>

<script>
import Filters from '@/pages/reports/Filters';
import ProductsSalesReport from '@/pages/reports/sales/products';
import CategoriesSalesReport from '@/pages/reports/sales/categories';
import CitiesSalesReport from '@/pages/reports/sales/cities';
import SalesSummary from '@/pages/reports/sales/summary';
export default {
  name: 'ReportSales',
  components: {
    Filters,
    ProductsSalesReport,
    CategoriesSalesReport,
    CitiesSalesReport,
    SalesSummary,
  },
  data() {
    return {
      selected: [],
      isShowFilter: false,
      isFilterRender: true,
      filterQuery: {},
      filtersOptions: {},
      selectedReports: 'Products',
      reportsTypeList: ['Products', 'Categories', 'Summary'], // Now cities options comment out 'Cities'
    };
  },
  watch: {
    selectedReports(newContext, oldContext) {
      const instance = this;
      if (newContext !== oldContext) {
        instance.isFilterRender = false;
        if (newContext === 'Summary')
          instance.filtersOptions.isShowGroupBy = true;
        else instance.filtersOptions.isShowGroupBy = false;

        setTimeout(() => {
          instance.isFilterRender = true;
          instance.isShowFilter = false;
        });
      }
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {});
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    showFilterEvent() {
      this.isShowFilter = !this.isShowFilter;
    },
  },
};
</script>
