<template>
  <v-select
    v-model="selectedItems"
    :items="items"
    outlined
    :label="label"
    multiple
    chips
    hide-details="auto"
    dense
  >
    <template v-slot:prepend-item>
      <v-list-item ripple @click="toggle()">
        <v-list-item-action>
          <v-icon :color="selectedItems.length > 0 ? 'indigo darken-4' : ''">
            {{ checkIconForMultiSelect }}
          </v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title> Select All </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider class="mt-2"></v-divider>
    </template>
    <template v-if="isSuggestHint" v-slot:append-item>
      <v-divider class="mb-2"></v-divider>
      <v-list-item disabled>
        <v-list-item-content v-if="likesAllSelectItems">
          <v-list-item-title> All selected for valid on </v-list-item-title>
        </v-list-item-content>

        <v-list-item-content v-else-if="likesSomeSelectItems">
          <v-list-item-title> Selected items count </v-list-item-title>
          <v-list-item-subtitle>
            {{ selectedItems.length }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-content v-else>
          <v-list-item-title>
            How could you not like valid on?
          </v-list-item-title>
          <v-list-item-subtitle>
            Go ahead, make a selection above!
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-select>
</template>

<script>
export default {
  name: 'BMultiSelect',
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: 'Select items',
    },
    fieldName: {
      type: String,
      default: '',
    },
    isReset: {
      type: Boolean,
      default: true,
    },
    isSuggestHint: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      selectedItems: [],
      fieldsRules: {
        validOn: [(val) => (val || '').length > 0 || 'This field is required'],
      },
    };
  },
  computed: {
    likesAllSelectItems() {
      return this.selectedItems.length === this.items.length;
    },
    likesSomeSelectItems() {
      return this.selectedItems.length > 0 && !this.likesAllSelectItems;
    },
    checkIconForMultiSelect() {
      if (this.likesAllSelectItems) return 'mdi-close-box';
      if (this.likesSomeSelectItems) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
  },
  watch: {
    selectedItems(newItems, oldItems) {
      if (newItems.length !== oldItems.length) {
        this.$emit('multiSelectEvent', this.fieldName, newItems);
      }
    },
    isReset(newValue, oldValue) {
      if (newValue) this.selectedItems = [];
    },
  },
  mounted() {},
  methods: {
    toggle() {
      const instance = this;
      instance.$nextTick(() => {
        if (instance.likesAllSelectItems) instance.selectedItems = [];
        else instance.selectedItems = instance.items.slice();
      });
    },
  },
};
</script>
