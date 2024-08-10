<template>
  <div id="daycareSingle">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-if="daycareInfo">
            <v-card-title>
              <h4>Single Daycare - &nbsp;</h4>
              <v-chip
                class="white--text"
                :color="daycareInfo.status === 'active' ? 'success' : 'warning'"
              >
                {{ daycareInfo.status }}
              </v-chip>
              <v-spacer />
              <v-spacer />
              <b-language v-model="language" />
              <v-btn
                v-can="`update daycare`"
                :to="`/daycare/daycares/${daycareInfo.id}/edit?edit=true&lang=${language}`"
                color="teal"
                outlined
              >
                Edit
              </v-btn>
            </v-card-title>
          </v-card>
        </v-flex>
        <v-flex xs12 md12>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h3 class="display-1">{{ daycareInfo.name }}</h3>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'DaycareSingle',
  data() {
    return {
      language: 'en',
      daycareInfo: {
        name: '',
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getDaycare();
    },
  },
  mounted() {
    this.getDaycare();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getDaycare());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getDaycare() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/daycare/daycares/${this.$route.params.id}`
        );
        this.daycareInfo = data;
      } catch (e) {
        this.$router.replace('/daycare/daycares');
      }
    },
  },
};
</script>
