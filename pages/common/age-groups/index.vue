<template>
  <div id="ageGroups">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Age Groups</h3>
            <v-spacer />
            <v-btn
              :v-can="`create age_group`"
              color="primary"
              :loading="creating"
              @click="create"
            >
              New Age Group
            </v-btn>
          </div>
        </v-flex>
        <v-flex xs12>
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
                    :items="ageGroups"
                    :options.sync="pagination"
                    :server-items-length="total"
                    :loading="loading"
                    show-select
                    class="elevation-1"
                  >
                    <template v-slot:item.range="{ item }">
                      {{ item.start }} - {{ item.end }}
                    </template>
                    <template v-slot:item.type="{ item }">
                      {{ getTypeName(item.type) }}
                    </template>
                    <template v-slot:item.status="{ item }">
                      <v-chip
                        class="white--text"
                        :color="
                          item.status === 'active' ? 'success' : 'warning'
                        "
                      >
                        {{ item.status }}
                      </v-chip>
                    </template>
                    <template v-slot:item.action="{ item }">
                      <v-btn
                        v-can="`view age_group`"
                        icon
                        small
                        fab
                        color="primary"
                        title="View"
                        :to="`/common/age-groups/${item.id}`"
                      >
                        <v-icon>mdi-eye</v-icon>
                      </v-btn>
                      <v-btn
                        v-can="`update age_group`"
                        icon
                        small
                        fab
                        color="teal"
                        title="Edit"
                        :to="`/common/age-groups/${item.id}/edit?edit=true&lang=${language}`"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        v-can="`delete age_group`"
                        icon
                        small
                        fab
                        color="pink"
                        title="Delete"
                        @click="deleteItem(item)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'CommonAgeGroups',
  data() {
    return {
      language: 'en',
      dialog: false,
      ageGroups: [],
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
        { text: 'Range', value: 'range', sortable: false },
        { text: 'Type', value: 'type', sortable: false },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      getTypeName(type) {
        return type === 'y' ? 'Year' : type === 'd' ? 'Day' : 'Month';
      },
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
      this.getAgeGroupsByPagination();
    },
    // for server side search
    search() {
      this.getAgeGroupsByPagination();
    },
    language() {
      this.getAgeGroupsByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getAgeGroupsByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get filter by pagination
    getAgeGroupsByPagination: debounce(async function () {
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
          `${this.language}/common/age-group?${url}`
        );
        this.loading = false;
        this.ageGroups = data;
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
        const { ageGroupId } = await this.$axios.$post(
          `${this.language}/common/age-group`
        );
        this.creating = false;
        this.$router.push(`/common/age-groups/${ageGroupId}/edit`);
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
          this.deleteAgeGroup(item.id);
        }
        return false;
      });
    },
    async deleteAgeGroup(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/common/age-group/${id}`
        );
        this.getAgeGroupsByPagination();
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
