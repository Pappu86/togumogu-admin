<template>
  <div id="costs">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Delivery Costs</h3>
            <v-spacer />
            <v-dialog v-model="dialog" max-width="500px" persistent>
              <template v-slot:activator="{ on }">
                <v-btn :v-can="`create cost`" color="primary" v-on="on">
                  New Cost
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="justify-space-between primary white--text">
                  <span class="headline">{{ formTitle }}</span>
                  <v-btn icon dark class="ma-0" @click.stop="close">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-card-title>
                <validation-observer v-slot="{ handleSubmit, invalid, reset }">
                  <v-form
                    @submit.prevent="handleSubmit(onSubmit)"
                    @reset.prevent="reset"
                  >
                    <v-card-text>
                      <b-auto-complete
                        v-model="editedItem.area_id"
                        :items="areas"
                        rules="required"
                        item-text="name"
                        item-value="id"
                        outlined
                        label="Select Area"
                      />
                      <b-text
                        v-model="editedItem.cost"
                        rules="required|decimal:2"
                        outlined
                        label="Cost"
                      />
                      <b-text
                        v-model="editedItem.cart_amount"
                        rules="decimal:2"
                        outlined
                        label="Cart amount"
                      />

                      <b-text
                        v-model="editedItem.special_delivery_cost"
                        rules="decimal:2"
                        outlined
                        label="Special delivery cost"
                      />
                    </v-card-text>
                    <v-divider />
                    <action-button-dialog
                      :loading="loading"
                      :error="invalid"
                      @close="close"
                    />
                  </v-form>
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
                :items="costs"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.cart_amount="{ item }">
                  {{ item.cart_amount ? item.cart_amount : '-' }}
                </template>
                <template v-slot:item.special_delivery_cost="{ item }">
                  {{
                    item.special_delivery_cost
                      ? item.special_delivery_cost
                      : '-'
                  }}
                </template>

                <template v-slot:item.action="{ item }">
                  <edit-with-dialog-actions
                    update="update shipping_cost"
                    delete-action="delete shipping_cost"
                    @editItem="editItem(item)"
                    @deleteItem="deleteItem(item)"
                  />
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
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'ShippingCost',
  data() {
    return {
      language: 'en',
      dialog: false,
      costs: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      main_headers: [
        { text: 'Area', value: 'area', sortable: false },
        { text: 'Cost', value: 'cost', align: 'right' },
        { text: 'Minimum cart amount', value: 'cart_amount', align: 'right' },
        {
          text: 'Special delivery cost',
          value: 'special_delivery_cost',
          align: 'right',
        },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      editedIndex: -1,
      editedItem: {
        id: 0,
        area_id: null,
        cost: null,
        cart_amount: 0,
        special_delivery_cost: 0,
      },
      defaultItem: {
        id: 0,
        area_id: null,
        cost: null,
        cart_amount: 0,
        special_delivery_cost: 0,
      },
      areas: [],
      shipping_methods: [],
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Cost' : 'Edit Cost';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getCostsByPagination();
    },
    // for server side search
    search() {
      this.getCostsByPagination();
    },
    language() {
      this.getCostsByPagination();
    },
  },
  mounted() {
    this.getAreas();

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getAreas();
      this.getCostsByPagination();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get cost by pagination
    getCostsByPagination: debounce(async function () {
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
        const { data, meta } = await this.$axios.$get(`shipping/cost?${url}`);
        this.loading = false;
        this.costs = data;
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
      this.editedIndex = this.costs.indexOf(item);
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
        url = `shipping/cost/${this.editedItem.id}`;
        method = 'PATCH';
        this.update(url, method);
      } else {
        url = `shipping/cost`;
        method = 'POST';
        this.update(url, method);
      }
    },
    async update(url, method) {
      try {
        const { message } = (
          await this.$axios({
            url,
            method,
            data: this.editedItem,
          })
        ).data;

        this.getCostsByPagination();
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
    // delete cost group
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteCost(item.id);
        }
        return false;
      });
    },
    async deleteCost(id) {
      try {
        const { message } = await this.$axios.$delete(`shipping/cost/${id}`);
        this.getCostsByPagination();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async getAreas() {
      try {
        const { data } = await this.$axios.$get(`shipping/area-all`);
        this.areas = data;
      } catch (e) {}
    },
  },
};
</script>
