<template>
  <div id="offerRedeems">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Offer Redeems</h3>
            <v-spacer />
            <v-dialog v-model="dialog" max-width="400px">
              <v-card>
                <v-card-title class="justify-space-between primary white--text">
                  <span class="headline">{{ formTitle }}</span>
                  <v-btn icon dark class="ma-0" @click.stop="close">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <validation-observer v-slot="{ handleSubmit, invalid, reset }">
                  <template v-if="isFormLoaded">
                    <v-form
                      @submit.prevent="handleSubmit(onSubmit)"
                      @reset.prevent="reset"
                    >
                      <v-card-text class="pb-0">
                        <v-row class="mt-5">
                          <v-col md="6" class="py-0">
                            <b-text
                              v-model="editedItem.award_points"
                              rules="decimal:0"
                              outlined
                              dense
                              label="Award Points"
                            />
                          </v-col>
                        </v-row>

                        <active-inactive-dialog
                          v-model="editedItem.status"
                          class="mt-0"
                        />
                      </v-card-text>
                      <v-divider></v-divider>
                      <action-button-dialog
                        :loading="loading"
                        :error="invalid"
                        @close="close"
                      />
                    </v-form>
                  </template>
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
                :items="offerRedeems"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.offer_id="{ item }">
                  {{ item.offer.id }}
                </template>
                <template v-slot:item.offer_title="{ item }">
                  {{ item.offer.title }}
                </template>

                <template v-slot:item.redeem_by="{ item }">
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
                  <v-chip
                    class="white--text"
                    :color="item.status ? 'success' : 'warning'"
                  >
                    {{ item.status ? 'Active' : 'Inactive' }}
                  </v-chip>
                </template>
                <template v-slot:item.expired_date="{ item }">
                  {{ getFormatTime(item.expired_date) }}
                </template>
                <template v-slot:item.action="{ item }">
                  <div class="text-center">
                    <v-btn
                      :v-can="`update offer_redeem`"
                      depressed
                      outlined
                      icon
                      fab
                      dark
                      color="teal"
                      class="mr-0"
                      small
                      title="Edit"
                      @click="editItem(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </div>
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
import { format } from 'date-fns';

export default {
  name: 'AppOfferRedeems',
  data() {
    return {
      language: 'en',
      dialog: false,
      offerRedeems: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      selectedPlatforms: [],
      main_headers: [
        { text: 'Date/Time', value: 'created_at' },
        { text: 'Redeem ID', value: 'offer_redeem_no' },
        { text: 'Offer ID', value: 'offer_id' },
        { text: 'Offer Title', value: 'offer_title' },
        { text: 'Spent Points', value: 'spent_reward_point' },
        { text: 'Redeem By', value: 'redeem_by' },
        { text: 'Expired Date', value: 'expired_date' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: true, align: 'center' },
      ],
      editedIndex: -1,
      isFormLoaded: true,
      editedItem: {
        id: 0,
        award_points: '0',
        min_amount: 0,
        max_award_points: 0,
        start_date: '',
        end_date: '',
        status: 'active',
      },
      defaultItem: {
        id: 0,
        award_points: '0',
        min_amount: 0,
        max_award_points: 0,
        start_date: '',
        end_date: '',
        status: 'active',
      },
      getFormatTime(time) {
        return time ? format(new Date(time), "dd-MMM-yyyy' 'KK:mm aa") : '';
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Award Point' : 'Edit Award Point';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getOfferRedeemsByPagination();
    },
    // for server side search
    search() {
      this.getOfferRedeemsByPagination();
    },
    dialog() {
      if (!this.dialog) {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.selectedPlatforms = [];
        this.isFormLoaded = false;
        setTimeout(() => {
          this.isFormLoaded = true;
        }, 100);
      }
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getOfferRedeemsByPagination();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get offer redeem by pagination
    getOfferRedeemsByPagination: debounce(async function () {
      this.loading = true;
      let url = `page=${this.pagination.page}&per_page=${this.pagination.itemsPerPage}`;
      // get by search keyword
      if (this.search) {
        url += `&query=${this.search}`;
      }

      // get by sort option
      if (this.pagination.sortBy.length) {
        const direction = this.pagination.sortDesc[0] ? 'desc' : 'asc';
        url += `&direction=${direction}&sortBy=${this.pagination.sortBy[0]}`;
      }

      try {
        const { data, meta } = await this.$axios.$get(
          `marketing/offer-redeems?${url}`
        );
        this.loading = false;
        this.offerRedeems = data;
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
      // this.selectedPlatforms = item.platforms;

      this.editedIndex = this.offerRedeems.indexOf(item);

      if (item && !item.category) {
        return;
      }

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
        url = `marketing/offer-redeems/${this.editedItem.id}`;
        method = 'PATCH';
        this.update(url, method);
      }
    },
    async update(url, method, options) {
      try {
        const editedItem = this.editedItem;
        editedItem.award_points = this.editedItem.award_points * 1;

        const { message } = (
          await this.$axios({
            url,
            method,
            data: editedItem,
          })
        ).data;

        this.getOfferRedeemsByPagination();
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
  },
};
</script>
