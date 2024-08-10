<template>
  <div id="trashedFilterList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Trashed Filters</h3>
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
                :headers="headers"
                :items="filters"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.status="{ item }">
                  <span v-if="item.status">
                    <v-chip text-color="black" class="success"
                      >Published</v-chip
                    >
                  </span>
                  <span v-else>
                    <v-chip text-color="black" class="info">Saved</v-chip>
                  </span>
                </template>
                <template v-slot:item.action="{ item }">
                  <v-btn
                    v-can="`restore filter`"
                    icon
                    small
                    fab
                    color="teal"
                    title="restore"
                    @click="restoreItem(item.id)"
                  >
                    <v-icon>mdi-restore</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`forceDelete filter`"
                    icon
                    small
                    fab
                    color="pink"
                    title="delete"
                    @click="deleteItem(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
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
  name: 'FilterTrashed',
  data() {
    return {
      language: 'en',
      filters: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {},
      headers: [
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Parent Name', value: 'parent_name', sortable: false },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
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
    // get product by pagination
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
          `${process.env.API_URL}/${this.language}/common/filter-trashed?${url}`
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
    // delete filter
    deleteItem(item) {
      let messageText = `You won't be able to revert this!`;
      if (item && !item.parent_id) {
        messageText = `If this filter is deleted, all children associated with it will be deleted. You won't be able to revert this!`;
      }
      confirmationAlert(messageText).then((res) => {
        if (res.value) {
          this.deleteFilter(item.id);
        }
        return false;
      });
    },
    async deleteFilter(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/${this.language}/common/filter-force/${id}`
        );
        this.getFiltersByPagination();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async restoreItem(id) {
      try {
        const { message } = await this.$axios.$get(
          `${process.env.API_URL}/${this.language}/common/filter-trashed/${id}`
        );
        this.getFiltersByPagination();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
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
