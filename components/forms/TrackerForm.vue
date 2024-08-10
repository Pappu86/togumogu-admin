<template>
  <v-card class="mb-4">
    <v-card-title>
      <h4>Tracker</h4>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-radio-group v-model="tracker" class="mt-0" row>
        <v-radio
          v-for="trackerItem in trackersList"
          :key="trackerItem.value"
          :label="trackerItem.text"
          :value="trackerItem.value"
          class="mb-2"
        ></v-radio>
      </v-radio-group>
      <div class="mb-3">
        Start range
        <v-divider />
        <v-row>
          <v-col v-if="!isPregnancyTracker" cols="12" sm="3">
            <div class="mt-4">
              <b-text
                v-model="trackerStartYear"
                rules="numeric"
                label="Year"
                dense
                outlined
                hide-details=""
              />
            </div>
          </v-col>
          <v-col v-if="!isPregnancyTracker" cols="12" sm="3">
            <v-select
              v-model="trackerStartMonth"
              :items="monthsList"
              label="Month"
              dense
              outlined
              hide-details
              class="mt-4"
            ></v-select>
          </v-col>
          <v-col cols="12" :sm="isPregnancyTracker ? 6 : 3">
            <v-select
              v-model="trackerStartWeek"
              :items="weeksList"
              label="Week"
              dense
              outlined
              hide-details
              class="mt-4"
            ></v-select>
          </v-col>
          <v-col cols="12" :sm="isPregnancyTracker ? 6 : 3">
            <v-select
              v-model="trackerStartDay"
              :items="daysList"
              label="Day"
              outlined
              hide-details
              dense
              class="mt-4"
            ></v-select>
          </v-col>
        </v-row>
      </div>
      <div>
        End range
        <v-divider />
        <v-row>
          <v-col v-if="!isPregnancyTracker" cols="12" sm="3">
            <div class="mt-4">
              <b-text
                v-model="trackerEndYear"
                rules="numeric"
                label="Year"
                dense
                outlined
                hide-details=""
              />
            </div>
          </v-col>
          <v-col v-if="!isPregnancyTracker" cols="12" sm="3">
            <v-select
              v-model="trackerEndMonth"
              :items="monthsList"
              label="Month"
              outlined
              hide-details
              dense
              class="mt-4"
            ></v-select>
          </v-col>
          <v-col cols="12" :sm="isPregnancyTracker ? 6 : 3">
            <v-select
              v-model="trackerEndWeek"
              :items="weeksList"
              label="Week"
              dense
              outlined
              hide-details
              class="mt-4"
            ></v-select>
          </v-col>
          <v-col cols="12" :sm="isPregnancyTracker ? 6 : 3">
            <v-select
              v-model="trackerEndDay"
              :items="daysList"
              label="Day"
              outlined
              hide-details
              dense
              class="mt-4"
            ></v-select>
          </v-col>
        </v-row>
        <div v-if="invalidTrackerDate" class="p-5 mt-2 v-application">
          <small class="error--text">
            Invalid tracker range! Please set end range is greater than start
            range
          </small>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'TrackerForm',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      isPregnancyTracker: false,
      trackersList: [
        { text: 'Pregnancy', value: 'pregnency' },
        { text: 'Baby', value: 'baby' },
        { text: 'Other-pregnancy', value: 'other_pregnency' },
        { text: 'Other-baby', value: 'other' },
      ],
      selectedTrackerStartDay: 0,
      selectedTrackerEndDay: 0,
      invalidTrackerDate: false,
      tracker: 'other',
      monthsList: getLists(11),
      weeksList: getLists(4),
      daysList: getLists(30),
      trackerStartYear: '0',
      trackerStartMonth: 0,
      trackerStartWeek: 0,
      trackerStartDay: 0,
      trackerEndYear: '0',
      trackerEndMonth: 0,
      trackerEndWeek: 0,
      trackerEndDay: 0,
    };
  },
  watch: {
    tracker(newVal, oldVal) {
      this.isPregnancyTracker = !!(
        this.tracker === 'pregnency' || this.tracker === 'other_pregnency'
      );
      this.weeksList = this.isPregnancyTracker ? getLists(41) : getLists(4);

      if (newVal !== oldVal) {
        if (this.trackerStartWeek > 4) this.trackerStartWeek = 0;
        if (this.trackerEndWeek > 4) this.trackerEndWeek = 0;

        checkTrackerRange(this);
      }
      this.trackerEvent();
    },
    trackerStartYear(newVal, oldVal) {
      if (newVal !== oldVal) checkTrackerRange(this);
      this.trackerEvent();
    },
    trackerStartMonth(newVal, oldVal) {
      if (newVal !== oldVal) checkTrackerRange(this);
      this.trackerEvent();
    },
    trackerStartWeek(newVal, oldVal) {
      if (newVal !== oldVal) checkTrackerRange(this);
      this.trackerEvent();
    },
    trackerStartDay(newVal, oldVal) {
      if (newVal !== oldVal) checkTrackerRange(this);
      this.trackerEvent();
    },
    trackerEndYear(newVal, oldVal) {
      if (newVal !== oldVal) checkTrackerRange(this);
      this.trackerEvent();
    },
    trackerEndMonth(newVal, oldVal) {
      if (newVal !== oldVal) checkTrackerRange(this);
      this.trackerEvent();
    },
    trackerEndWeek(newVal, oldVal) {
      if (newVal !== oldVal) checkTrackerRange(this);
      this.trackerEvent();
    },
    trackerEndDay(newVal, oldVal) {
      if (newVal !== oldVal) checkTrackerRange(this);
      this.trackerEvent();
    },
  },
  created() {},
  mounted() {
    const instance = this;
    this.$nextTick(() => {
      const { range, tracker } = instance.options;

      if (tracker) {
        this.tracker = tracker || 'other';
      }

      if (
        !(
          range &&
          Object.keys(range).length === 0 &&
          range.constructor === Object
        )
      ) {
        const start = (range && range.start) || {};
        const end = (range && range.end) || {};
        instance.trackerStartYear = start && start.year ? start.year : 0;
        instance.trackerStartMonth = start && start.month ? start.month : 0;
        instance.trackerStartDay = start && start.day ? start.day : 0;

        instance.trackerEndYear = end && end.year ? end.year : 0;
        instance.trackerEndMonth = end && end.month ? end.month : 0;
        instance.trackerEndDay = end && end.day ? end.day : 0;

        setTimeout(() => {
          instance.trackerStartWeek = start && start.week ? start.week : 0;
          instance.trackerEndWeek = end && end.week ? end.week : 0;
        }, 500);
      }
    });
  },
  methods: {
    trackerEvent() {
      const range = {
        start: {
          year: this.isPregnancyTracker ? 0 : this.trackerStartYear * 1,
          month: this.isPregnancyTracker ? 0 : this.trackerStartMonth,
          week: this.trackerStartWeek,
          day: this.trackerStartDay,
        },
        end: {
          year: this.isPregnancyTracker ? 0 : this.trackerEndYear * 1,
          month: this.isPregnancyTracker ? 0 : this.trackerEndMonth,
          week: this.trackerEndWeek,
          day: this.trackerEndDay,
        },
      };

      const trackerData = {
        startDays: this.selectedTrackerStartDay,
        endDays: this.selectedTrackerEndDay,
        tracker: this.tracker,
        trackerRange: range,
        invalidTrackerDate: this.invalidTrackerDate,
      };

      this.$emit('input', trackerData);
    },
  },
};

// Get months/days list
const getLists = (limitItems) => {
  const list = [];
  for (let i = 0; i <= limitItems; i++) {
    list.push(i);
  }
  return list;
};

// Check tracker range for baby/pregnancy
const checkTrackerRange = (instance) => {
  const startDays =
    365 *
      parseInt(instance.isPregnancyTracker ? '0' : instance.trackerStartYear) +
    30 * (instance.isPregnancyTracker ? 0 : instance.trackerStartMonth) +
    7 * instance.trackerStartWeek +
    instance.trackerStartDay;

  const endDays =
    365 *
      parseInt(instance.isPregnancyTracker ? '0' : instance.trackerEndYear) +
    30 * (instance.isPregnancyTracker ? 0 : instance.trackerEndMonth) +
    7 * instance.trackerEndWeek +
    instance.trackerEndDay;

  if (endDays >= startDays) {
    instance.selectedTrackerStartDay = startDays;
    instance.selectedTrackerEndDay = endDays;
    instance.invalidTrackerDate = false;
  } else {
    instance.invalidTrackerDate = true;
  }
};
</script>
