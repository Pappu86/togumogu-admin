<template>
  <validation-provider
    v-slot="{ errors, valid, dirty }"
    :name="$attrs.label"
    :rules="rules"
  >
    <v-dialog v-model="dialog" persistent width="350">
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="formatedDateTime"
          v-bind="$attrs"
          :error-messages="errors"
          :success="valid && dirty"
          readonly
          v-on="on"
        />
      </template>

      <v-card>
        <v-card-text class="pa-0">
          <v-tabs v-model="tab" fixed-tabs>
            <v-tab>
              <v-icon>mdi-calendar</v-icon>
            </v-tab>
            <v-tab :disabled="dateSelected">
              <v-icon>mdi-clock-outline</v-icon>
            </v-tab>
            <v-tabs-items v-model="tab">
              <v-tab-item>
                <v-date-picker
                  v-model="date"
                  :min="minDate"
                  full-width
                  v-bind="datePickerProps"
                  @input="tab = 1"
                />
              </v-tab-item>
              <v-tab-item>
                <v-time-picker
                  v-model="time"
                  use-seconds
                  full-width
                  v-bind="timePickerProps"
                />
              </v-tab-item>
            </v-tabs-items>
          </v-tabs>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn outlined @click.native="clearDateTime"> Cancel </v-btn>
          <v-btn outlined color="primary" @click="getDateTime"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </validation-provider>
</template>

<script>
import { format } from 'date-fns';

export default {
  name: 'BDateTime',
  model: {
    prop: 'datetime',
    event: 'input',
  },
  props: {
    rules: {
      type: [Object, String],
      default: '',
    },
    datetime: {
      type: [Date, String],
      default: null,
    },
    datePickerProps: {
      type: Object,
      default: null,
    },
    timePickerProps: {
      type: Object,
      default: null,
    },
    minDate: {
      type: String,
      default: null,
    },
  },
  data: () => ({
    date: null,
    time: null,
    dialog: false,
    tab: 0,
  }),
  computed: {
    selectedDatetime() {
      if (this.date && this.time) {
        return this.date + ' ' + this.time;
      } else {
        return null;
      }
    },
    formatedDateTime() {
      return this.selectedDatetime
        ? format(
            new Date(this.selectedDatetime),
            'E, MMM dd, yyyy - hh:mm:ss a'
          )
        : null;
    },
    dateSelected() {
      return !this.date;
    },
  },
  watch: {
    datetime() {
      this.init();
    },
  },
  created() {
    if (this.datetime) {
      this.init();
    }
  },
  methods: {
    init() {
      if (!this.datetime) {
        return;
      }

      this.date = format(new Date(this.datetime), 'yyyy-MM-dd');
      this.time = format(new Date(this.datetime), 'HH:mm:ss');
    },
    clearDateTime() {
      this.resetPicker();
      this.date = null;
      this.time = null;
      this.$emit('input', null);
    },
    getDateTime() {
      this.resetPicker();
      this.$emit('input', this.selectedDatetime);
    },
    resetPicker() {
      this.dialog = false;
      this.tab = 0;
    },
  },
};
</script>
