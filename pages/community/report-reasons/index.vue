<template>
  <div id="reportReasons">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Reasons</h3>
            <v-spacer />
            <v-btn
              v-can="`create report_reason`"
              color="primary"
              dark
              :loading="creating"
              @click="create"
            >
              New Reason
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
                :headers="headers"
                :items="reasons"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-0"
              >
                <template v-slot:item.title="{ item }">
                  {{ item.title }}
                </template>
                <template v-slot:item.status="{ item }">
                  <span v-if="item.status === 'active'">
                    <v-chip text-color="white" class="success">
                      Published
                    </v-chip>
                  </span>
                  <span v-else>
                    <v-chip text-color="white" class="warning">Saved</v-chip>
                  </span>
                </template>
                <template v-slot:item.action="{ item }">
                  <v-btn
                    v-can="`view report_reason`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    :to="`/community/report-reasons/${item.id}`"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`update report_reason`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    :to="`/community/report-reasons/${item.id}/edit?edit=true`"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <!-- <v-btn
                    v-can="`delete report_reason`"
                    icon
                    small
                    fab
                    color="pink"
                    title="Delete"
                    @click="deleteItem(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn> -->
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
  name: 'VideoCategory',
  components: {},
  data() {
    return {
      language: 'en',
      dialog: false,
      reasons: [],
      newReasons: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {},
      headers: [
        { text: 'Date', value: 'created_at' },
        { text: 'Title', value: 'title' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Issue' : 'Edit Issue';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getReasonsByPagination();
    },
    // for server side search
    search() {
      this.getReasonsByPagination();
    },
    language() {
      this.getReasonsByPagination();
    },
  },
  mounted() {
    this.getReasonsByPagination();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getReasonsByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get report reason by pagination
    getReasonsByPagination: debounce(async function () {
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
          `${this.language}/community/report-reason?${url}`
        );
        this.loading = false;
        this.reasons = data;
        this.newReasons = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create Report issue
    async create() {
      this.creating = true;
      try {
        const { reportReasonId } = await this.$axios.$post(
          `${this.language}/community/report-reason`
        );
        this.creating = false;
        this.$router.push(`/community/report-reasons/${reportReasonId}/edit`);
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete Report issue
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteReportReason(item.id);
        }
        return false;
      });
    },
    async deleteReportReason(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/community/report-reason/${id}`
        );
        this.getReasonsByPagination();
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
