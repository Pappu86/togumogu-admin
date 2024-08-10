<template>
  <div id="daycareFeatures">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Features</h3>
            <v-spacer />
            <v-btn
              :v-can="`create daycare_feature`"
              color="primary"
              :loading="creating"
              @click="create"
            >
              New Feature
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title class="pa-1">
              <v-text-field
                v-model="search"
                solo
                flat
                prepend-inner-icon="mdi-magnify"
                placeholder="Type something"
                hide-details
              ></v-text-field>
              <div>
                <b-language v-model="language" />
              </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="main_headers"
                :items="features"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.status="{ item }">
                  <v-chip
                    class="white--text"
                    :color="item.status === 'active' ? 'success' : 'warning'"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>

                <template v-slot:item.action="{ item }">
                  <div class="text-center">
                    <v-btn
                      :v-can="`update daycare_feature`"
                      depressed
                      outlined
                      icon
                      fab
                      dark
                      color="primary"
                      class="mr-0"
                      small
                      title="Edit"
                      @click="editItem(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      :v-can="`delete daycare_feature`"
                      depressed
                      outlined
                      icon
                      fab
                      dark
                      color="pink"
                      class="mr-0"
                      small
                      title="Delete"
                      @click="deleteItem(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">{{ formTitle }}</span>
          <v-btn icon dark class="ma-0" @click.stop="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <validation-observer v-slot="{ handleSubmit, invalid, reset }">
          <v-form @submit.prevent="handleSubmit(update)" @reset.prevent="reset">
            <v-card-text>
              <b-text
                v-model="editedItem.title"
                rules="required"
                outlined
                label="Title"
                hide-details
              />
              <active-inactive-dialog v-model="editedItem.status" />
            </v-card-text>
            <v-divider />
            <action-button-dialog
              :loading="loading"
              :error="invalid"
              @close="close"
            />
          </v-form>
        </validation-observer>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'DaycareFeatures',
  data() {
    return {
      language: 'en',
      dialog: false,
      features: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      main_headers: [
        { text: 'Title', value: 'title' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      editedIndex: -1,
      editedItem: {
        id: 0,
        name: '',
        status: 'active',
      },
      defaultItem: {
        id: 0,
        name: '',
        status: 'active',
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Feature' : 'Edit Feature';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getFeaturesByPagination();
    },
    // for server side search
    search() {
      this.getFeaturesByPagination();
    },
    language() {
      this.getFeaturesByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getFeaturesByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get feature by pagination
    getFeaturesByPagination: debounce(async function () {
      this.loading = true;
      let url = `page=${this.pagination.page}&per_page=${this.pagination.itemsPerPage}`;
      // get by search keyword
      if (this.search) {
        url += `&query=${this.search}`;
      }

      // get by sort option
      if (this.pagination.sortBy.length && !this.search) {
        const direction = this.pagination.sortDesc[0] ? 'desc' : 'asc';
        url += `&direction=${direction}&sortBy=${this.pagination.sortBy[0]}`;
      }

      try {
        const { data, meta } = await this.$axios.$get(
          `${process.env.API_URL}/${this.language}/daycare/feature?${url}`
        );
        this.loading = false;
        this.features = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create feature
    async create() {
      this.creating = true;
      try {
        const { featureId } = await this.$axios.$post(
          `${process.env.API_URL}/${this.language}/daycare/feature`
        );
        this.creating = false;
        this.editedItem.id = featureId;
        this.dialog = true;
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // open dialog to edit category
    editItem(item) {
      this.editedIndex = this.features.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    // close dialog
    close() {
      this.dialog = false;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
    },
    async update() {
      try {
        const { message } = await this.$axios.$patch(
          `${process.env.API_URL}/${this.language}/daycare/feature/${this.editedItem.id}`,
          this.editedItem
        );
        this.getFeaturesByPagination();
        this.close();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (err) {
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
    // delete feature group
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteFeature(item.id);
        }
        return false;
      });
    },
    async deleteFeature(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/${this.language}/daycare/feature/${id}`
        );
        this.getFeaturesByPagination();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>
