<template>
  <div id="dashboard">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card class="p-0" elevation="0">
            <v-layout row wrap>
              <v-flex xs12 sm6>
                <v-card>
                  <div class="Chartjs">
                    <v-card-title>
                      <h5 class="title">10 Best Selling Products</h5>
                      <v-spacer></v-spacer>
                      <ChartFilter
                        context="products"
                        :filters-list="chartFilterItems"
                        @chartFilterEvents="changedFilter"
                      />
                    </v-card-title>
                    <v-divider />
                    <v-card-text>
                      <div
                        v-show="!hasChartProducts"
                        :style="getEmptyBoxStyle()"
                      >
                        We didn't find any things here!
                      </div>
                      <div v-show="!!hasChartProducts">
                        <canvas
                          id="bestSellingProductsChart"
                          height="50vh"
                          width="80vw"
                        ></canvas>
                      </div>
                    </v-card-text>
                  </div>
                </v-card>
              </v-flex>
              <v-flex xs12 sm6>
                <v-card>
                  <div class="Chartjs">
                    <v-card-title>
                      <h5 class="title">10 Best Selling Categories</h5>
                      <v-spacer></v-spacer>
                      <ChartFilter
                        context="categories"
                        :filters-list="chartFilterItems"
                        @chartFilterEvents="changedFilter"
                      />
                    </v-card-title>
                    <v-divider />
                    <v-card-text>
                      <div
                        v-show="!hasChartCategories"
                        :style="getEmptyBoxStyle()"
                      >
                        We didn't find any things here!
                      </div>
                      <div v-show="!!hasChartCategories">
                        <canvas
                          id="bestSellingCategoriesChart"
                          height="50vh"
                          width="80vw"
                        ></canvas>
                      </div>
                    </v-card-text>
                  </div>
                </v-card>
              </v-flex>
              <!-- <v-flex xs12 sm6>
                <v-card>
                  <div class="Chartjs">
                    <v-card-title>
                      <h5 class="title">10 Best Selling Cities</h5>
                      <v-spacer></v-spacer>
                      <ChartFilter
                        :filtersList="chartFilterItems"
                        context="cities"
                        @chartFilterEvents="changedFilter"
                      />
                    </v-card-title>
                    <v-divider />
                    <v-card-text>
                      <canvas
                        id="bestSellingCitiesChart"
                        height="50vh"
                        width="80vw"
                      ></canvas>
                    </v-card-text>
                  </div>
                </v-card>
              </v-flex> -->
            </v-layout>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import Chart from 'chart.js';
import { getArrayList, getAvailableDateRange } from '@/util';

export default {
  name: 'Dashboard',
  data() {
    return {
      hasChartProducts: false,
      hasChartCategories: false,
      productsDefaultFilters: {
        filterKey: 'this_month',
        range: getAvailableDateRange(['this_month']),
      },
      categoriesDefaultFilters: {
        filterKey: 'this_month',
        range: getAvailableDateRange(['this_month']),
      },
      citiesDefaultFilters: {
        filterKey: 'this_month',
        range: getAvailableDateRange(['this_month']),
      },
      chartFilterItems: [
        { id: 'today', title: 'Today' },
        { id: 'this_week', title: 'This week' },
        { id: 'this_month', title: 'This Month' },
        { id: 'this_year', title: 'This Year' },
        { id: 'all', title: 'All' },
      ],
      chartLabelColors: [
        '#1a884b',
        '#FF6384',
        '#63FF84',
        '#0d91d0',
        '#8463FF',
        '#6384FF',
        '#9c27b0',
        '#21ada6',
        '#0c56c5',
        '#cc990a',
      ],
      defaultChartSettings: {
        type: 'pie',
        options: {
          legend: {
            position: 'left',
          },
          elements: {
            arc: {
              borderWidth: 0,
            },
          },
        },
      },
      getEmptyBoxStyle() {
        return `min-height: 150px; display: flex; justify-content: center; align-items: center;`;
      },
    };
  },
  mounted() {
    // Initial best selling graph
    this.initProductsBestSelling();
    this.initCategoriesBestSelling();
    this.initCitiesBestSelling();
  },
  methods: {
    // Initial best selling graph
    async initProductsBestSelling() {
      const instance = this;
      const filterInfo = instance.productsDefaultFilters;
      let url = `groupType=products`;

      if (filterInfo) {
        const { filterKey, range } = filterInfo;
        const dateRange = range[filterKey];

        // get by dateRange keyword
        if (dateRange && dateRange.length > 0) {
          url += `&fromDate=${dateRange[0]}&toDate=${dateRange[1]}`;
        }
      }

      try {
        const { data } = await instance.$axios.$get(
          `reports/best-selling?${url}`
        );

        instance.hasChartProducts = data && data.length > 0;

        // Best selling products
        const productLabels = getArrayList('name', data);
        const productOrders = getArrayList('total_quantity', data);
        const productChartData = {
          ...instance.defaultChartSettings,
          data: {
            labels: productLabels,
            datasets: [
              {
                data: productOrders,
                backgroundColor: instance.chartLabelColors,
              },
            ],
          },
        };

        instance.createChart('bestSellingProductsChart', productChartData);
      } catch (e) {
        instance.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async initCategoriesBestSelling() {
      const instance = this;
      const filterInfo = instance.categoriesDefaultFilters;
      let url = `groupType=category`;

      if (filterInfo) {
        const { filterKey, range } = filterInfo;
        const dateRange = range[filterKey];

        // get by dateRange keyword
        if (dateRange && dateRange.length > 0) {
          url += `&fromDate=${dateRange[0]}&toDate=${dateRange[1]}`;
        }
      }

      try {
        const { data } = await instance.$axios.$get(
          `reports/best-selling?${url}`
        );

        instance.hasChartCategories = data && data.length > 0;

        // Best selling categories
        const categoryLabels = getArrayList('name', data);
        const categoryOrders = getArrayList('total_quantity', data);
        const categoryChartData = {
          ...instance.defaultChartSettings,
          data: {
            labels: categoryLabels,
            datasets: [
              {
                data: categoryOrders,
                backgroundColor: instance.chartLabelColors,
              },
            ],
          },
        };
        instance.createChart('bestSellingCategoriesChart', categoryChartData);
      } catch (e) {
        instance.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    initCitiesBestSelling() {
      const instance = this;
      try {
        console.log('cities..', instance.citiesDefaultFilters);

        // Best selling cities
        const citiesLabels = getArrayList('groupby', bestSellingCities);
        const citiesOrders = getArrayList('orders', bestSellingCities);
        const citiesChartData = {
          ...instance.defaultChartSettings,
          data: {
            labels: citiesLabels,
            datasets: [
              {
                data: citiesOrders,
                backgroundColor: instance.chartLabelColors,
              },
            ],
          },
        };
        instance.createChart('bestSellingCitiesChart', citiesChartData);
      } catch (e) {}
    },
    createChart(chartId, chartData) {
      const ctx = document.getElementById(chartId);
      // eslint-disable-next-line no-unused-vars
      const chart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    },
    changedFilter(eventType, value) {
      const instance = this;
      if (eventType === 'products') {
        instance.productsDefaultFilters = value;
        instance.initProductsBestSelling();
      } else if (eventType === 'categories') {
        instance.categoriesDefaultFilters = value;
        instance.initCategoriesBestSelling();
      } else if (eventType === 'cities') {
        instance.citiesDefaultFilters = value;
        instance.initCitiesBestSelling();
      }
    },
  },
};

const bestSellingCities = [
  {
    orders: 34,
    totals: '46,217.00',
    groupby: 'Dhaka',
  },
  {
    orders: 10,
    totals: '910.00',
    groupby: 'Mymensingh',
  },
  {
    orders: 2,
    totals: '1,612.00',
    groupby: 'Chittagong',
  },
  {
    orders: 8,
    totals: '683.00',
    groupby: 'Khulna',
  },
  {
    orders: 4,
    totals: '19,106.00',
    groupby: 'Sylhet',
  },
  {
    orders: 1,
    totals: '1,636.00',
    groupby: 'Barisal',
  },
  {
    orders: 1,
    totals: '604.00',
    groupby: 'Faridpur',
  },
  {
    orders: 1,
    totals: '820.00',
    groupby: 'Brahmanbaria',
  },
  {
    orders: 2,
    totals: '1,630.00',
    groupby: 'Rajshahi',
  },
  {
    orders: 1,
    totals: '820.00',
    groupby: 'Khulna',
  },
];
</script>
