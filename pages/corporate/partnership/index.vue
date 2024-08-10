<template>
  <div id="partnershipList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Partnership</h3>
            <v-spacer />
            <v-btn
              v-can="`create partnership`"
              :loading="creating"
              color="primary"
              @click="createPartnership"
            >
              Create Partnership
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
                :items="partnerships"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.company_id="{ item }">
                  {{ item.company && item.company.name }}
                </template>
                <template v-slot:item.group_id="{ item }">
                  {{ item.employee_group && item.employee_group.name }}
                </template>

                <template v-slot:item.referral_url="{ item }">
                  <template v-if="item.status === 'active'">
                    <template v-if="item.referral && item.referral.dynamic_url">
                      <copy-content
                        :options="{
                          content: item.referral && item.referral.dynamic_url,
                          isShowContent: true,
                          isShowToast: true,
                          width: 160,
                        }"
                      />
                    </template>
                    <template v-else="">
                      <v-btn
                        color="success"
                        outlined
                        rounded
                        @click="generateInviteLink(item.id)"
                      >
                        <v-icon>mdi-refresh</v-icon>
                      </v-btn>
                    </template>
                  </template>
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
                    v-can="`view partnership`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    :to="`/corporate/partnership/${item.id}`"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`update partnership`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    :to="`/corporate/partnership/${item.id}/edit?edit=true&lang=${language}`"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`delete partnership`"
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
  name: 'Partnership',
  data() {
    return {
      language: 'en',
      partnerships: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {},
      headers: [
        { text: 'Date', value: 'created_at' },
        { text: 'Company', value: 'company_id' },
        { text: 'Emp. Group', value: 'group_id' },
        { text: 'Referral Link', value: 'referral_url' },
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
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getPartnershipsByPagination();
    },
    // for server side search
    search() {
      this.getPartnershipsByPagination();
    },
    language() {
      this.getPartnershipsByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getPartnershipsByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get article by pagination
    getPartnershipsByPagination: debounce(async function () {
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
          `${this.language}/corporate/partnership?${url}`
        );
        this.loading = false;
        this.partnerships = data;
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
    async createPartnership() {
      this.creating = true;
      try {
        const { partnershipId } = await this.$axios.$post(
          `${this.language}/corporate/partnership`
        );
        this.creating = false;
        if (partnershipId) {
          this.$router.push(`/corporate/partnership/${partnershipId}/edit`);
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
          this.deletePartnership(item.id);
        }
        return false;
      });
    },
    async generateInviteLink(id) {
      this.inviteLinkLoading = true;
      try {
        const { message } = await this.$axios.$get(
          `${this.language}/corporate/partnership/referral/${id}`
        );

        this.getPartnershipsByPagination();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (e) {
        this.inviteLinkLoading = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async deletePartnership(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/corporate/partnership/${id}`
        );
        this.getPartnershipsByPagination();
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
