<template>
  <div id="communityReporsList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Reports</h3>
            <v-spacer />
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
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="communityReports"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.reason="{ item }">
                  <template v-if="`view report_reason`">
                    <v-btn
                      plain
                      color="primary"
                      class="linkable-text"
                      title="View details"
                      target="_blank"
                      :to="`report-reasons/${item.reason && item.reason.id}`"
                    >
                      {{ item.reason && item.reason.title }}
                    </v-btn>
                  </template>
                  <template v-else="">
                    {{ item.reason && item.reason.title }}
                  </template>
                </template>

                <template v-slot:item.post="{ item }">
                  <template v-if="`view post`">
                    <v-btn
                      plain
                      color="primary"
                      class="linkable-text"
                      title="View details"
                      target="_blank"
                      :to="`posts/${item.post && item.post.id}`"
                    >
                      {{ item.post && item.post.content }}
                    </v-btn>
                  </template>
                  <template v-else="">
                    {{ item.post && item.post.content }}
                  </template>
                </template>

                <template v-slot:item.comment="{ item }">
                  <template v-if="`view comment`">
                    <v-btn
                      plain
                      color="primary"
                      class="linkable-text"
                      title="View details"
                      target="_blank"
                      :to="`comments/${item.comment && item.comment.id}`"
                    >
                      {{ item.comment && item.comment.content }}
                    </v-btn>
                  </template>
                  <template v-else="">
                    {{ item.comment && item.comment.content }}
                  </template>
                </template>

                <template v-slot:item.created_by="{ item }">
                  <template v-if="`view customer`">
                    <v-btn
                      plain
                      color="primary"
                      class="linkable-text"
                      title="View details"
                      target="_blank"
                      :to="`/customers/${item.customer && item.customer.id}`"
                    >
                      {{ item.customer && item.customer.name }}
                    </v-btn>
                  </template>
                  <template v-else="">
                    {{ item.customer && item.customer.name }}
                  </template>
                </template>
                <template v-slot:item.status="{ item }">
                  <span v-if="item.status === 'pending'">
                    <v-chip text-color="black" class="warning">
                      Pending
                    </v-chip>
                  </span>
                  <span v-else-if="item.status === 'rejected'">
                    <v-chip text-color="white" color="red">Rejected</v-chip>
                  </span>
                  <span v-else-if="item.status === 'approved'">
                    <v-chip text-color="white" class="success">Approved</v-chip>
                  </span>
                </template>
                <template v-slot:item.action="{ item }">
                  <v-btn
                    v-can="`view report`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    :to="getViewLink(item)"
                  >
                    <v-icon>mdi-eye</v-icon>
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
  name: 'CommunityReports',
  data() {
    return {
      communityReports: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {},
      headers: [
        { text: 'Date', value: 'created_at' },
        { text: 'Reason', value: 'reason' },
        { text: 'Post', value: 'post' },
        { text: 'Comment', value: 'comment' },
        { text: 'Created By', value: 'created_by' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      getViewLink(item) {
        let url = `posts/${item.post && item.post.id}`;
        if (item.comment && item.comment.id) {
          url = `comments/${item.comment && item.comment.id}`;
        }

        return url;
      },
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getReportsByPagination();
    },
    // for server side search
    search() {
      this.getReportsByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getReportsByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get reports by pagination
    getReportsByPagination: debounce(async function () {
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
          `${process.env.API_URL}/community/report?${url}`
        );
        this.loading = false;
        this.communityReports = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // delete post
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
          `${process.env.API_URL}/community/post/${id}`
        );
        this.getReportsByPagination();
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
