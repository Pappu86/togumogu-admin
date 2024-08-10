<template>
  <div id="ageGroupSingle">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-if="ageGroup">
            <v-card-title>
              <h4>Single Age Group - &nbsp;</h4>
              <v-chip v-if="ageGroup.status === 'active'" label class="success">
                Published
              </v-chip>
              <v-chip v-else class="warning" label>Saved</v-chip>
              <v-spacer />
              <v-spacer />
              <b-language v-model="language" />
              <v-btn
                v-can="`update age_group`"
                :to="`/common/age-groups/${ageGroup.id}/edit?edit=true&lang=${language}`"
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
              <h3 class="display-1">{{ ageGroup.name }}</h3>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'AgeGroupSingle',
  data() {
    return {
      language: 'en',
      ageGroup: {
        name: '',
        start: '',
        end: '',
        type: '',
        status: false,
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getAgeGroup();
    },
  },
  mounted() {
    this.getAgeGroup();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getAgeGroup());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getAgeGroup() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/common/age-group/${this.$route.params.id}`
        );

        this.ageGroup = Object.assign({}, data);
      } catch (e) {
        this.$router.replace('/common/age-groups');
      }
    },
  },
};
</script>
