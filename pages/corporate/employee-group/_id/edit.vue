<template>
  <div id="employeeGroupEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="employeeGroup" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <!-- Start edit left section-->
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Employee Group</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    class="white--text"
                    :color="
                      employeeGroup.status === 'active' ? 'success' : 'warning'
                    "
                  >
                    {{ employeeGroup.status }}
                  </v-chip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-sheet elevation="0" tag="section" class="pa-2 mb-5 pb-5">
                    <b-text
                      v-model="employeeGroup.name"
                      rules="required|min:5|max:180"
                      outlined
                      label="Name"
                      counter="180"
                      @blur="checkSlug"
                    />
                    <b-text
                      v-model="employeeGroup.slug"
                      rules="required"
                      outlined
                      label="Slug"
                    />
                    <v-subheader>Details</v-subheader>
                    <b-rich-text-editor
                      v-model="employeeGroup.details"
                      editor-id="employee-group-content"
                      class-name="mt-4"
                    />
                  </v-sheet>
                </v-card-text>
              </v-card>
            </v-col>
            <!-- End edit left section-->
            <!-- Start edit right section-->
            <v-col cols="12" sm="4">
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Publish</h4>
                  <v-spacer />
                  <b-language v-model="language" />
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-card-actions class="justify-center">
                    <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                    <v-btn
                      outlined
                      color="primary"
                      :disabled="invalid"
                      @click="handleSubmit(onSubmit('inactive'))"
                    >
                      Save
                    </v-btn>
                    <v-btn
                      id="publishBtn"
                      outlined
                      color="success"
                      :disabled="invalid"
                      @click="handleSubmit(onSubmit('active'))"
                    >
                      Publish
                    </v-btn>
                  </v-card-actions>
                </v-card-text>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Company</h4>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-auto-complete
                    v-model="employeeGroup.company"
                    rules="required"
                    :items="companies"
                    item-text="name"
                    item-value="id"
                    outlined
                    return-object
                    label="Select company"
                    hide-details
                  />
                </v-card-text>
              </v-card>
            </v-col>
            <!-- End edit right section-->
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
  </div>
</template>

<script>
export default {
  name: 'EmployeeGroupEdit',
  components: {},
  data() {
    const defaultForm = Object.freeze({
      name: '',
      slug: '',
      status: 0,
      created_at: null,
      company: null,
      details: '',
    });

    return {
      language: 'en',
      employeeGroup: Object.assign({}, defaultForm),
      loading: false,
      companies: [],
    };
  },
  computed: {},
  watch: {
    language() {
      this.getEmployeeGroup();
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([this.getCompanies()]).then(() => {
      this.getEmployeeGroup();
    });

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCompanies();
      this.getEmployeeGroup();
    });
  },
  methods: {
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/corporate/employee-group/slug/${encodeURIComponent(
            this.employeeGroup.name
          )}`
        );
        this.employeeGroup.slug = slug;
      } catch (e) {
        this.employeeGroup.slug = null;
      }
    },
    async getCompanies() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/corporate/company/all`
        );
        this.companies = data;
      } catch (e) {}
    },
    onSubmit(status) {
      this.employeeGroup.status = status;
      this.publishEmployeeGroup();
    },

    async publishEmployeeGroup() {
      const instance = this;
      instance.loading = true;
      try {
        const employeeGroupData = instance.employeeGroup;

        const { message } = await this.$axios.$patch(
          `${this.language}/corporate/employee-group/${this.$route.params.id}`,
          employeeGroupData
        );

        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/corporate/employee-group',
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
    // get payment_method for edit
    async getEmployeeGroup() {
      const instance = this;
      try {
        const { data } = await instance.$axios.$get(
          `${instance.language}/corporate/employee-group/${instance.$route.params.id}/edit`
        );
        instance.employeeGroup = Object.assign({}, data);
      } catch (e) {
        instance.$router.replace('/corporate/employee-group');
      }
    },
  },
};
</script>
