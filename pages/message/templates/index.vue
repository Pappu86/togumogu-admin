<template>
  <div id="templatesList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Templates</h3>
            <v-spacer />
            <v-btn
              v-can="`create template`"
              :loading="creating"
              color="primary"
              @click="createTemplate"
            >
              Create Template
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
                <div class="d-flex">
                  <v-select
                    v-model="selectedType"
                    :items="typeList"
                    label="Type"
                    class="mr-5"
                    outlined
                    dense
                    hide-details="auto"
                    style="max-width: 200px"
                  ></v-select>
                  <b-language v-model="language" class="mt-1" />
                </div>
              </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="templates"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.type="{ item }">
                  <v-chip
                    class="white--text text-capitalize"
                    :color="getTypeColor(item.type)"
                  >
                    {{ item.type }}
                  </v-chip>
                </template>

                <template v-slot:item.status="{ item }">
                  <v-chip
                    class="white--text"
                    :color="item.status === 'active' ? 'success' : 'warning'"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>
                <template v-slot:item.action="{ item }">
                  <v-btn
                    v-can="`view template`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    :to="`/message/templates/${item.id}`"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`update template`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    :to="`/message/templates/${item.id}/edit?edit=true&lang=${language}`"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`delete template`"
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
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'Templates',
  data() {
    return {
      language: 'en',
      templates: [],
      selected: [],
      selectedType: 'all',
      typeList: [
        { text: 'SMS', value: 'sms' },
        { text: 'Email', value: 'email' },
        { text: 'Push Notification', value: 'push_notification' },
        { text: 'All', value: 'all' },
      ],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {},
      headers: [
        { text: 'Date', value: 'created_at' },
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Type', value: 'type' },
        { text: 'Status', value: 'status' },
        {
          text: 'Actions',
          value: 'action',
          sortable: false,
          align: 'center',
          width: 160,
        },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      getTypeColor(type) {
        let color = 'primary';
        if (type === 'sms') color = 'success';
        else if (type === 'push_notification') color = 'blue';

        return color;
      },
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getTemplatesByPagination();
    },
    // for server side search
    search() {
      this.getTemplatesByPagination();
    },
    language() {
      this.getTemplatesByPagination();
    },
    selectedType(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.getTemplatesByPagination();
      }
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getTemplatesByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get article by pagination
    getTemplatesByPagination: debounce(async function () {
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

      // get by type
      if (this.selectedType && this.selectedType !== 'all') {
        url += `&type=${this.selectedType}`;
      }

      try {
        const { data, meta } = await this.$axios.$get(
          `${this.language}/message/template?${url}`
        );
        this.loading = false;
        this.templates = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create article
    async createTemplate() {
      this.creating = true;
      try {
        const { templateId } = await this.$axios.$post(
          `${this.language}/message/template`
        );
        this.creating = false;
        if (templateId) {
          this.$router.push(`/message/templates/${templateId}/edit`);
        }
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete article
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deletePost(item.id);
        }
        return false;
      });
    },
    async deletePost(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/message/templates/${id}`
        );
        this.getTemplatesByPagination();
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
