<template>
  <div id="commonFilterEntry">
    <v-container grid-list-xl fluid>
      <v-row justify="space-between" class="ma-0 py-3">
        <h3>{{ formTitle }}</h3>
        <b-language v-model="language" />
      </v-row>
      <v-row>
        <v-col>
          <validation-observer v-slot="{ handleSubmit, invalid, reset }">
            <v-form @submit.prevent="handleSubmit(updateFilter)" @reset.prevent="reset">
              <v-card>
                <v-card-text>
                  <v-row justify="center">
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="filter.name"
                        rules="required"
                        outlined
                        label="Parent Filter Name"
                      />
                    </v-col>
                  </v-row>
                  <v-row justify="center">
                    <v-col cols="12" sm="6">
                      <v-subheader>Child Filters</v-subheader>
                      <v-divider />
                    </v-col>
                  </v-row>
                  <v-row v-for="(item, i) in filters" :key="i" justify="center">
                    <v-col cols="11" sm="5">
                      <b-text
                        v-model="item.name"
                        rules="required"
                        outlined
                        dense
                        label="Filter Name"
                      />
                    </v-col>
                    <v-col cols="1" sm="1">
                      <v-btn class="pink" small fab icon @click="removeFilter(i)">
                        <v-icon color="white">mdi-close</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>

                  <v-row justify="center">
                    <v-col cols="12" sm="6" class="text-center">
                      <v-btn color="primary" outlined @click="addFilter">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card-text>
                <active-inactive v-model="filter.status" />
                <action-button :loading="loading" :error="invalid" :title="formTitle" />
              </v-card>
            </v-form>
          </validation-observer>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'CommonFilterEntry',
  data() {
    return {
      loading: false,
      language: 'en',
      filter: {
        id: 0,
        name: '',
        children: [],
        status: 'active',
      },
      default: {
        id: 0,
        name: '',
        children: [],
        status: 'active',
      },
      filters: [],
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true'
        ? 'Edit Filter'
        : 'Update Filter';
    },
  },
  watch: {
    language() {
      this.getFilter();
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    this.getFilter();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getFilter());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    addFilter() {
      this.filters.push({ name: null });
    },
    removeFilter(i) {
      this.filters.splice(i, 1);
    },
    async updateFilter() {
      this.loading = true;
      try {
        this.filter.children = this.filters;

        const { message } = await this.$axios.$patch(
          `${this.language}/common/filter/${this.$route.params.id}`,
          this.filter
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/common/filters',
        });
      } catch (err) {
        this.loading = false;
        if (err.response.status === 422) {
          const { errors } = err.response.data;
          const fields = Object.values(errors);
          for (let i = 0; i < fields.length; i++) {
            for (let j = 0; j < fields[i].length; j++) {
              this.$toasted.global.form_error(fields[i][j]);
            }
          }
        } else {
          this.$store.commit(
            'APP_NETWORK_ERROR',
            err.response && err.response.data.message
          );
        }
      }
    },
    // get filter for edit
    async getFilter() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/common/filter/${this.$route.params.id}`
        );
        this.filter = data;
        this.filters = this.filter.children;
      } catch (e) {
        Object.assign(this.filter, this.default);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>
