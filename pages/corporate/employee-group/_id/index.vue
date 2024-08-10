<template>
  <div id="employeeGroupSingle">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-if="employeeGroupInfo">
            <v-card-title>
              <h4>Single Employee Group - &nbsp;</h4>
              <v-chip
                class="white--text"
                :color="
                  employeeGroupInfo.status === 'active' ? 'success' : 'warning'
                "
              >
                {{ employeeGroupInfo.status }}
              </v-chip>
              <v-spacer />
              <v-spacer />
              <b-language v-model="language" />
              <v-btn
                v-can="`update employee-group`"
                :to="`/corporate/employee-group/${employeeGroupInfo.id}/edit?edit=true&lang=${language}`"
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
                <h3 class="display-1">{{ employeeGroupInfo.name }}</h3>
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
  name: 'EmployeeGroupSingle',
  data() {
    return {
      language: 'en',
      employeeGroupInfo: {
        name: '',
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getEmployeeGroup();
    },
  },
  mounted() {
    this.getEmployeeGroup();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getEmployeeGroup());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getEmployeeGroup() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/corporate/employee-group/${this.$route.params.id}`
        );
        this.employeeGroupInfo = data;
      } catch (e) {
        this.$router.replace('/corporate/employee-group');
      }
    },
  },
};
</script>
