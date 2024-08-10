<template>
  <div id="companyEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="company" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <!-- Start edit left section-->
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Company</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    class="white--text"
                    :color="company.status === 'active' ? 'success' : 'warning'"
                  >
                    {{ company.status }}
                  </v-chip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-sheet elevation="0" tag="section" class="pa-2 mb-5 pb-5">
                    <b-text
                      v-model="company.name"
                      rules="required|min:5|max:100"
                      outlined
                      label="Name"
                      counter="100"
                    />
                    <b-text
                      v-model="company.reg_id"
                      outlined
                      label="Registration Id"
                    />
                    <b-text
                      v-model="company.website"
                      outlined
                      label="Website"
                    />
                    <b-text
                      v-model="company.address"
                      outlined
                      label="Address"
                    />
                    <v-subheader>Details</v-subheader>
                    <b-rich-text-editor
                      v-model="company.details"
                      editor-id="company-details"
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

              <v-card class="mb-4 pb-3">
                <v-card-title>
                  <h4>Category</h4>
                </v-card-title>
                <v-divider />
                <v-sheet class="pa-4 primary lighten-2">
                  <v-text-field
                    v-model="category"
                    label="Search Category"
                    dark
                    flat
                    solo-inverted
                    hide-details
                    clearable
                    clear-icon="mdi-close-circle-outline"
                  ></v-text-field>
                </v-sheet>
                <scrollbar style="height: 300px">
                  <v-treeview
                    v-model="company.categories"
                    :items="categories"
                    :search="category"
                    rules="required"
                    selectable
                    return-object
                  ></v-treeview>
                </scrollbar>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Logo</h4>
                </v-card-title>
                <v-divider />
                <div class="text-center pa-3">
                  <v-btn
                    v-if="company.logo === null"
                    color="primary"
                    class="mx-4"
                    outlined
                    large
                    @click.stop="openDialog('logo')"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                  <template v-if="company.logo !== null">
                    <v-img :src="company.logo" />
                    <v-card-actions class="justify-center">
                      <v-btn
                        color="teal"
                        outlined
                        @click.stop="openDialog('logo')"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn color="pink" outlined @click="removeImage('logo')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </template>
                </div>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Badge</h4>
                </v-card-title>
                <v-divider />
                <div class="text-center pa-3">
                  <v-btn
                    v-if="company.badge === null"
                    color="primary"
                    class="mx-4"
                    outlined
                    large
                    @click.stop="openDialog('badge')"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                  <template v-if="company.badge !== null">
                    <v-img :src="company.badge" />
                    <v-card-actions class="justify-center">
                      <v-btn
                        color="teal"
                        outlined
                        @click.stop="openDialog('badge')"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        color="pink"
                        outlined
                        @click="removeImage('badge')"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </template>
                </div>
              </v-card>
            </v-col>
            <!-- End edit right section-->
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>

    <v-dialog v-model="dialog" scrollable max-width="95vw">
      <v-card id="mediaDialog">
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Upload Files</span>
          <v-btn icon dark class="ma-0" @click.stop="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <media-library @use="useThisFile" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'CompanyEdit',
  components: {},
  data() {
    const defaultForm = Object.freeze({
      name: '',
      categories: [],
      details: '',
      status: 0,
      image: null,
    });

    return {
      language: 'en',
      company: Object.assign({}, defaultForm),
      dailog_type: 'image',
      dialog: false,
      category: '',
      categories: [],
      loading: false,
    };
  },
  computed: {
    loggedIn() {
      return this.$auth.loggedIn;
    },
    user() {
      return this.$auth.user;
    },
  },
  watch: {
    language() {
      this.getCompany();
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([this.getCategories()]).then(() => {
      this.getCompany();
    });

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCategories();
      this.getCompany();
    });
  },
  methods: {
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/corporate/company-category-all`
        );
        this.categories = data;
      } catch (e) {}
    },

    onSubmit(status) {
      this.company.status = status;
      this.publishCompany();
    },

    async publishCompany() {
      const instance = this;
      instance.loading = true;
      try {
        const companyData = instance.company;

        const { message } = await this.$axios.$patch(
          `${this.language}/corporate/companies/${this.$route.params.id}`,
          companyData
        );

        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/corporate/companies',
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
    async getCompany() {
      const instance = this;
      try {
        const { data } = await instance.$axios.$get(
          `${instance.language}/corporate/companies/${instance.$route.params.id}/edit`
        );
        instance.company = Object.assign({}, data);
      } catch (e) {
        instance.$router.replace('/corporate/companies');
      }
    },
    openDialog(type) {
      this.dailog_type = type;
      this.dialog = true;
    },
    removeImage(type) {
      this.dailog_type = null;
      if (type === 'logo') {
        this.company.logo = null;
      } else if (type === 'badge') {
        this.company.badge = null;
      }
    },
    useThisFile(event) {
      this.company[this.dailog_type] = event.url;
      this.dialog = false;
    },
  },
};
</script>
