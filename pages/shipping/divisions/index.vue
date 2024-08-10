<template>
  <div id="divisions">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Divisions</h3>
            <v-spacer />
            <v-dialog v-model="dialog" max-width="500px" persistent>
              <template v-slot:activator="{ on }">
                <v-btn :v-can="`create division`" color="primary" v-on="on">
                  New Division
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="justify-space-between primary white--text">
                  <span class="headline">{{ formTitle }}</span>
                  <v-btn icon dark class="ma-0" @click.stop="close">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-card-title>
                <validation-observer v-slot="{ handleSubmit, invalid, reset }">
                  <v-form
                    @submit.prevent="handleSubmit(onSubmit)"
                    @reset.prevent="reset"
                  >
                    <v-card-text>
                      <b-text
                        v-model="editedItem.name"
                        rules="required"
                        outlined
                        label="Name"
                      />
                      <b-text
                        v-model="editedItem.bn_name"
                        rules="required"
                        outlined
                        label="Bangla Name"
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
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="main_headers"
                :items="divisions"
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
                  <edit-with-dialog-actions
                    update="update division"
                    delete-action="delete division"
                    @editItem="editItem(item)"
                    @deleteItem="deleteItem(item)"
                  />
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'ShippingDivision',
  data() {
    return {
      language: 'en',
      dialog: false,
      divisions: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      main_headers: [
        { text: 'Name', value: 'name' },
        { text: 'Bangla Name', value: 'bn_name' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      editedIndex: -1,
      editedItem: {
        id: 0,
        name: '',
        bn_name: '',
        status: 'active',
      },
      defaultItem: {
        id: 0,
        name: '',
        bn_name: '',
        status: 'active',
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Division' : 'Edit Division';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getDivisionsByPagination();
    },
    // for server side search
    search() {
      this.getDivisionsByPagination();
    },
    language() {
      this.getDivisionsByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getDivisionsByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get division by pagination
    getDivisionsByPagination: debounce(async function () {
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
          `shipping/division?${url}`
        );
        this.loading = false;
        this.divisions = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // open dialog to edit category
    editItem(item) {
      this.editedIndex = this.divisions.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    // close dialog
    close() {
      this.dialog = false;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
    },
    onSubmit() {
      let url;
      let method;
      if (this.editedIndex > -1) {
        url = `shipping/division/${this.editedItem.id}`;
        method = 'PATCH';
        this.update(url, method);
      } else {
        url = `shipping/division`;
        method = 'POST';
        this.update(url, method);
      }
    },
    async update(url, method) {
      try {
        const { message } = (
          await this.$axios({
            url,
            method,
            data: this.editedItem,
          })
        ).data;

        this.getDivisionsByPagination();
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
    // delete division group
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteDivision(item.id);
        }
        return false;
      });
    },
    async deleteDivision(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/shipping/division/${id}`
        );
        this.getDivisionsByPagination();
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
