<template>
  <div id="ageGroupEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="ageGroup" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Age Group</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    text-color="white"
                    :color="
                      ageGroup.status === 'active' ? 'success' : 'warning'
                    "
                  >
                    {{ ageGroup.status }}
                  </v-chip>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-text
                    v-model="ageGroup.name"
                    rules="required"
                    outlined
                    label="Name"
                  />

                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="ageGroup.start"
                        rules="required|numeric"
                        outlined
                        label="Start number"
                        dense
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="ageGroup.end"
                        rules="required|numeric"
                        outlined
                        label="End number"
                        dense
                      />
                    </v-col>
                  </v-row>
                  <v-select
                    v-model="ageGroup.type"
                    :items="ageRangeList"
                    label="Age rage type"
                    outlined
                    hide-details
                    dense
                  ></v-select>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Publish</h4>
                  <v-spacer />
                  <b-language v-model="language" />
                </v-card-title>
                <v-divider />
                <v-card-actions class="justify-center pb-5">
                  <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                  <v-btn
                    outlined
                    color="primary"
                    :disabled="invalid"
                    @click="handleSubmit(onSubmit(0))"
                  >
                    Save
                  </v-btn>
                  <v-btn
                    id="publishBtn"
                    outlined
                    color="success"
                    :disabled="invalid"
                    @click="handleSubmit(onSubmit(1))"
                  >
                    Publish
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
  </div>
</template>

<script>
export default {
  name: 'AgeGroupEdit',
  components: {},
  data() {
    const defaultForm = Object.freeze({
      name: '',
      start: '',
      end: '',
      type: 'm',
      status: 'active',
    });

    return {
      language: 'en',
      ageGroup: Object.assign({}, defaultForm),
      loading: false,
      ageRangeList: [
        { text: 'Day', value: 'd' },
        { text: 'Month', value: 'm' },
        { text: 'Year', value: 'y' },
      ],
    };
  },
  watch: {
    language() {
      this.getAgeGroup();
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([]).then(() => this.getAgeGroup());

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getAgeGroup();
    });
  },
  methods: {
    onSubmit(status) {
      this.ageGroup.status = status ? 'active' : 'inactive';
      this.publishAgeGroup();
    },
    async publishAgeGroup() {
      this.loading = true;

      try {
        const { message } = await this.$axios.$patch(
          `${this.language}/common/age-group/${this.ageGroup.id}`,
          this.ageGroup
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/common/age-groups',
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
    async getAgeGroup() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/common/age-group/${this.$route.params.id}/edit`
        );
        this.ageGroup = Object.assign({}, data);
      } catch (e) {
        this.$router.replace('/common/age-groups');
      }
    },
  },
};
</script>
