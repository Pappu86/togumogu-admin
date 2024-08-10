<template>
  <v-card class="mx-auto mb-1" outlined>
    <v-card-title class="pt-3 pb-3">
      <h6>Filter by</h6>
    </v-card-title>
    <v-divider></v-divider>
    <v-row class="pl-3 pr-3">
      <v-container fluid class="pl-3 pr-3 my-5">
        <v-row>
          <v-col cols="12" md="4" sm="6">
            <b-date-range
              v-model="dateRange"
              :is-reset="isReset"
              outlined
              label="Date range"
              hide-details="auto"
              dense
            />
          </v-col>
          <v-col v-if="options.isShowStatus" cols="12" md="4" sm="6">
            <b-multi-select
              :is-reset="isReset"
              :items="statusList"
              field-name="status"
              label="Status"
              :is-suggest-hint="false"
              @multiSelectEvent="multiSelectEvent"
            />
          </v-col>
          <v-col v-if="options.isShowOrderStatus" cols="12" md="4" sm="6">
            <b-multi-select
              :is-reset="isReset"
              :items="orderStatusList"
              field-name="orderStatus"
              label="Order Status"
              :is-suggest-hint="false"
              @multiSelectEvent="multiSelectEvent"
            />
          </v-col>
          <v-col v-if="options.isShowBrand" cols="12" md="4" sm="6">
            <b-multi-select
              :is-reset="isReset"
              :items="brandsList"
              field-name="brands"
              label="Brands"
              :is-suggest-hint="false"
              @multiSelectEvent="multiSelectEvent"
            />
          </v-col>
          <v-col v-if="options.isShowService" cols="12" md="4" sm="6">
            <b-multi-select
              :is-reset="isReset"
              :items="servicesList"
              field-name="services"
              label="Services"
              :is-suggest-hint="false"
              @multiSelectEvent="multiSelectEvent"
            />
          </v-col>
          <v-col v-if="options.isShowCorporate" cols="12" md="4" sm="6">
            <v-checkbox
              v-model="isCorporate"
              class="mt-0"
              label="Is Corporate"
            ></v-checkbox>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
    <v-divider></v-divider>
    <v-card-actions class="justify-center" border="top">
      <v-btn outlined color="secondary" text @click="resetEvent"> Reset </v-btn>
      <v-btn depressed color="primary" @click="searchEvent"> Search </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'CommonFilters',
  props: {
    filterQuery: {
      type: Object,
      default: () => {},
    },
    options: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      language: 'en',
      dateRange: [],
      isReset: true,
      isCorporate: false,
      selectedStatus: [],
      selectedOrderStatus: [],
      selectedBrand: [],
      selectedService: [],
      statusList: ['active', 'inactive'],
      orderStatusList: [],
      brandsList: [],
      servicesList: [],
    };
  },
  created() {},
  mounted() {
    if (this.options.isShowOrderStatus) {
      this.getOrderStatus();
    }

    if (this.options.isShowService) {
      this.getServices();
    }

    if (this.options.isShowBrand) {
      this.getBrands();
    }
  },
  methods: {
    searchEvent() {
      const filters = {
        dateRange: this.dateRange,
      };

      if (this.options.isShowStatus) filters.status = this.selectedStatus;
      if (this.options.isShowCorporate) filters.isCorporate = this.isCorporate;
      if (this.options.isShowBrand) filters.brand = this.selectedBrand;
      if (this.options.isShowService) filters.service = this.selectedService;
      if (this.options.isShowOrderStatus)
        filters.orderStatus = this.selectedOrderStatus;

      this.$emit('input', filters);
    },
    resetEvent() {
      const instance = this;
      instance.dateRange = [];
      instance.status = [];
      instance.isCorporate = false;
      instance.isReset = false;
      setTimeout(() => {
        instance.isReset = true;
      });
    },
    multiSelectEvent(fieldName, value) {
      if (fieldName === 'status') this.selectedStatus = value;
      else if (fieldName === 'orderStatus') this.selectedOrderStatus = value;
      else if (fieldName === 'brands') this.selectedBrand = value;
      else if (fieldName === 'services') this.selectedService = value;
    },
    // get order status
    async getOrderStatus() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/order/status-all`
        );

        this.orderStatusList = getSelectArrayList(data, 'name', 'code');
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get services
    async getServices() {
      try {
        const { data } = await this.$axios.$get(
          `${process.env.API_URL}/${this.language}/service/service`
        );

        this.servicesList = getSelectArrayList(data, 'title', 'id');
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // get brands
    async getBrands() {
      try {
        const { data } = await await this.$axios.$get(
          `${process.env.API_URL}/${this.language}/brand/brand`
        );

        this.brandsList = getSelectArrayList(data, 'name', 'id');
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};

const getSelectArrayList = (data, text, value) => {
  if (data.length) {
    const itemList = [];
    data.forEach((item) => {
      itemList.push({
        text: item[text],
        value: item[value],
      });
    });
    return itemList;
  } else return [];
};
</script>
