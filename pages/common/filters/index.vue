<template>
  <div id="filters">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Filters</h3>
            <v-spacer />
            <v-btn
              :v-can="`create filter`"
              color="primary"
              :loading="creating"
              @click="create"
            >
              New Filter
            </v-btn>
          </div>
        </v-flex>
        <v-flex xs12>
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
                :items="filters"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                show-expand
                single-expand
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
                  <edit-in-same-page-actions
                    update="update filter"
                    delete-action="delete filter"
                    :to="`/common/filters/${item.id}?edit=true&lang=${language}`"
                    @deleteItem="deleteItem(item)"
                  />
                </template>
                <template v-slot:expanded-item="{ headers, item }">
                  <td v-if="item.children.length" :colspan="headers.length">
                    <v-row justify="center">
                      <v-col cols="12" sm="10">
                        <v-simple-table>
                          <template v-slot:default>
                            <thead>
                              <tr>
                                <th class="text-left">Name</th>
                                <th class="text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="child in item.children"
                                :key="child.id"
                              >
                                <td>{{ child.name }}</td>
                                <td class="text-center">
                                  <v-btn
                                    :v-can="`delete filter`"
                                    depressed
                                    outlined
                                    icon
                                    fab
                                    dark
                                    color="pink"
                                    class="mr-0"
                                    small
                                    title="Delete"
                                    @click="deleteItem(child)"
                                  >
                                    <v-icon>mdi-delete</v-icon>
                                  </v-btn>
                                </td>
                              </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                      </v-col>
                    </v-row>
                  </td>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'CommonFilter',
  data() {
    return {
      language: 'en',
      dialog: false,
      filters: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      main_headers: [
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Filter' : 'Edit Filter';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getFiltersByPagination();
    },
    // for server side search
    search() {
      this.getFiltersByPagination();
    },
    language() {
      this.getFiltersByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getFiltersByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get filter by pagination
    getFiltersByPagination: debounce(async function () {
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
          `${this.language}/common/filter?${url}`
        );
        this.loading = false;
        this.filters = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create filter
    async create() {
      this.creating = true;
      try {
        const { filterId } = await this.$axios.$post(
          `${this.language}/common/filter`
        );
        this.creating = false;
        this.$router.push(`/common/filters/${filterId}`);
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete filter
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteFilter(item.id);
        }
        return false;
      });
    },
    // delete filter
    deleteChild(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteChildFilter(item.id);
        }
        return false;
      });
    },
    async deleteFilter(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/common/filter/${id}`
        );
        this.getFiltersByPagination();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async deleteChildFilter(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/common/filter-child/${id}`
        );
        this.getFiltersByPagination();
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
