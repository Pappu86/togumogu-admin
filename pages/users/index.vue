<template>
  <div id="usersList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Users</h3>
            <v-spacer />
            <v-btn v-can="`create user`" to="/users/entry" color="primary" nuxt>
              Create User
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
              <v-btn icon>
                <v-icon>mdi-filter-variant</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="users"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.avatar="{ item }">
                  <v-avatar v-if="item.avatar" size="32">
                    <img :src="item.avatar" :alt="item.name" />
                  </v-avatar>
                  <v-avatar v-else size="32" color="purple red--after">
                    <span class="white--text">
                      {{ item.name | avatar }}
                    </span>
                  </v-avatar>
                </template>
                <template v-slot:item.status="{ item }">
                  <v-chip
                    class="white--text"
                    :color="item.status === 'active' ? 'success' : 'warning'"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>
                <template v-slot:item.role="{ item }">
                  <v-chip
                    :color="item.role === 'super-admin' ? 'success' : 'info'"
                    class="white--text"
                  >
                    {{ item.role }}
                  </v-chip>
                </template>
                <template v-slot:item.action="{ item }">
                  <v-btn
                    v-can="`update user`"
                    depressed
                    outlined
                    icon
                    fab
                    dark
                    color="primary"
                    class="mr-0"
                    small
                    title="Edit"
                    :to="`/users/entry?id=${item.id}`"
                    nuxt
                  >
                    <v-icon>mdi-pencil</v-icon>
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

export default {
  name: 'User',
  data() {
    return {
      users: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      pagination: {},
      headers: [
        { text: 'Avatar', value: 'avatar' },
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Status', value: 'status' },
        { text: 'Role', value: 'role', sortable: false },
        {
          text: 'Actions',
          value: 'action',
          sortable: false,
          align: 'center',
          width: '150px',
        },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
  },
  watch: {
    pagination() {
      this.getUserByPagination();
    },
    search() {
      this.getUserByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getUserByPagination());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get user by pagination
    getUserByPagination: debounce(async function () {
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
        const { data, meta } = await this.$axios.$get(`user?${url}`);
        this.loading = false;
        this.users = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    async deleteUser(id) {
      try {
        const { message } = await this.$axios.$delete(`user/${id}`);
        this.getUserByPagination();
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
