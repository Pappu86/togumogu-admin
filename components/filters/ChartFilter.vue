<template>
  <v-menu bottom left :absolute="true">
    <template v-slot:activator="{ on, attrs }">
      <v-btn light icon v-bind="attrs" v-on="on">
        <v-icon class="text--secondary">mdi-dots-vertical</v-icon>
      </v-btn>
    </template>

    <v-list dense>
      <v-list-item-group v-model="selectedFilter" color="primary">
        <v-list-item
          v-for="filterItem in filtersList"
          :key="`${context}-${filterItem.id}`"
        >
          <v-list-item-content>
            <v-list-item-title v-text="filterItem.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
import { getAvailableDateRange } from '@/util';
export default {
  name: 'ChartFilter',
  props: {
    context: {
      type: String,
      default: 'products',
    },
    filtersList: {
      type: Array,
      default: () => [
        { id: 'this_month', title: 'This Month' },
        { id: 'last_month', title: 'Last Month' },
        { id: 'this_year', title: 'This Year' },
        { id: 'last_year', title: 'Last Year' },
      ],
    },
  },
  data() {
    return {
      selectedFilter: 2,
    };
  },
  watch: {
    selectedFilter(newValue, oldValue) {
      const instance = this;
      if (newValue !== oldValue && typeof newValue === 'number') {
        const selectedFilterObj = instance.filtersList[newValue];
        instance.$emit('chartFilterEvents', instance.context, {
          filterKey: selectedFilterObj.id,
          range: getAvailableDateRange([selectedFilterObj.id]),
        });
      }
    },
  },
};
</script>
