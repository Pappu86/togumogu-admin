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
          <v-col cols="12" md="4" sm="6">
            <b-multi-select
              :is-reset="isReset"
              :items="platforms"
              field-name="platform"
              label="Platforms"
              :is-suggest-hint="false"
              @multiSelectEvent="multiSelectEvent"
            />
          </v-col>
          <v-col cols="12" md="4" sm="6">
            <b-multi-select
              :is-reset="isReset"
              :items="orderStatuses"
              field-name="orderStatus"
              label="Status of the Order"
              :is-suggest-hint="false"
              @multiSelectEvent="multiSelectEvent"
            />
          </v-col>
          <v-col
            v-if="options && options.isShowGroupBy"
            cols="12"
            md="4"
            sm="6"
          >
            <v-select
              v-model="selectedGroupBy"
              :items="groupByList"
              label="Group by"
              outlined
              dense
              hide-details="auto"
            ></v-select>
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
import { debounce } from 'lodash-es';
export default {
  name: 'Filters',
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
      dateRange: [],
      selectedOrderStatus: [],
      selectedPlatforms: [],
      platforms: ['web', 'android', 'ios', 'manual'],
      orderStatuses: [],
      isReset: true,
      selectedGroupBy: 'Daily',
      groupByList: ['Daily', 'Monthly', 'Yearly'],
    };
  },
  watch: {
    selectedGroupBy(newContext, oldContext) {
      const instance = this;
      console.log('....this', instance.options);
      if (newContext !== oldContext) {
        console.log('....this 1', instance.options);
      }
    },
  },
  created() {},
  mounted() {
    const instance = this;
    instance.getOrderStatus();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => instance.getOrderStatus());
  },
  methods: {
    // get orderStatuses
    getOrderStatus: debounce(async function () {
      const instance = this;
      try {
        const { data } = await instance.$axios.$get(`en/order/status`);

        const statusList = [];
        data.forEach((statusInfo) => statusList.push(statusInfo.code));
        instance.orderStatuses = statusList;
      } catch (e) {
        instance.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    multiSelectEvent(fieldName, value) {
      if (fieldName === 'orderStatus') this.selectedOrderStatus = value;
      else if (fieldName === 'platform') this.selectedPlatforms = value;
    },
    searchEvent() {
      const filters = {
        dateRange: this.dateRange,
        orderStatus: this.selectedOrderStatus,
        platforms: this.selectedPlatforms,
        groupby: this.selectedGroupBy,
      };

      this.$emit('input', filters);
    },
    resetEvent() {
      const instance = this;
      instance.dateRange = [];
      instance.selectedOrderStatus = [];
      instance.selectedPlatforms = [];
      instance.isReset = false;
      setTimeout(() => {
        instance.isReset = true;
      });
    },
  },
};
</script>
