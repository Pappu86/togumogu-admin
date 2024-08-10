<template>
  <div id="offersList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Offers</h3>
            <v-spacer />
            <v-btn
              v-can="`create offer`"
              :loading="creating"
              color="primary"
              @click="createOffer"
            >
              Create Offer
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
                :items="offers"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.status="{ item }">
                  <span v-if="item.status">
                    <v-chip text-color="black" class="success">
                      Published
                    </v-chip>
                  </span>
                  <span v-else>
                    <v-chip text-color="black" class="info">Saved</v-chip>
                  </span>
                </template>
                <template v-slot:item.coupon="{ item }">
                  {{ item.coupon }}
                </template>
                <template v-slot:item.start_day="{ item }">
                  {{ getFormattedDate(item.start_date) }}
                </template>
                <template v-slot:item.end_day="{ item }">
                  {{ getFormattedDate(item.end_date) }}
                </template>
                <template v-slot:item.action="{ item }">
                  <v-btn
                    v-can="`view offer`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    :to="`/marketing/offers/${item.id}`"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`update offer`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    :to="`/marketing/offers/${item.id}/edit?edit=true&lang=${language}`"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`delete offer`"
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
import { format } from 'date-fns';

export default {
  name: 'Offer',
  data() {
    return {
      language: 'en',
      offers: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {},
      headers: [
        { text: 'Date', value: 'created_at' },
        { text: 'Title', value: 'title' },
        { text: 'Reward Points', value: 'reward_amount' },
        { text: 'Start Date', value: 'start_date' },
        { text: 'End Date', value: 'end_date' },
        { text: 'Validity Days', value: 'validity_day' },
        { text: 'Coupon', value: 'coupon' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      getFormattedDate(date) {
        return format(new Date(date), 'YYYY/MM/MM HH:ss');
      },
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getOffersByPagination();
    },
    // for server side search
    search() {
      this.getOffersByPagination();
    },
    language() {
      this.getOffersByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getOffersByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get offer by pagination
    getOffersByPagination: debounce(async function () {
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
          `${process.env.API_URL}/${this.language}/offer/offer?${url}`
        );
        this.loading = false;
        this.offers = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create offer
    async createOffer() {
      this.creating = true;
      try {
        const { offerId } = await this.$axios.$post(
          `${process.env.API_URL}/${this.language}/offer/offer`
        );
        this.creating = false;
        this.$router.push(`/marketing/offers/${offerId}/edit`);
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete offer
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteOffer(item.id);
        }
        return false;
      });
    },
    async deleteOffer(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/${this.language}/offer/offer/${id}`
        );
        this.getOffersByPagination();
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
