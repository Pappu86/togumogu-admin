<template>
  <div id="coupons">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Coupons</h3>
            <v-spacer />
            <v-dialog v-model="dialog" max-width="600px">
              <template v-slot:activator="{ on }">
                <v-btn
                  :v-can="`create coupon`"
                  color="primary"
                  v-on="on"
                  @click="editedIndex = -1"
                >
                  New Coupon
                </v-btn>
              </template>
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
                              v-model="editedItem.name"
                              rules="required"
                              outlined
                              label="Name"
                            />
                          </v-col>
                          <v-col md="6" class="py-0">
                            <v-select
                              v-model="editedItem.category"
                              :items="categories"
                              outlined
                              label="Category"
                            ></v-select>
                          </v-col>
                        </v-row>

                        <v-row>
                          <v-col md="6" class="py-0">
                            <b-text
                              v-model="editedItem.code"
                              rules="required"
                              outlined
                              label="Code"
                              hint="The code the customer enters to get the discount. Between 3 and 20 characters."
                            />
                          </v-col>
                          <v-col md="6" class="py-0">
                            <v-select
                              v-model="editedItem.type"
                              :items="types"
                              :rules="fieldsRules.type"
                              outlined
                              label="Type"
                              hint="Percentage or Fixed Amount Discounted"
                            ></v-select>
                          </v-col>
                        </v-row>

                        <v-row>
                          <v-col md="6" class="py-0">
                            <b-text
                              v-model="editedItem.discount"
                              rules="decimal:2"
                              outlined
                              label="Discount"
                              hint="How much amount should be discounted upon using this code?"
                            />
                          </v-col>
                          <v-col md="6" class="py-0">
                            <b-text
                              v-model="editedItem.total_amount"
                              rules="decimal"
                              outlined
                              label="Total amount"
                              hint="The total amount that must be reached before the coupon is valid. Keep it greater than your discount on coupon. By default 100.0000"
                            />
                          </v-col>
                        </v-row>
                        <v-autocomplete
                          v-model="selectedArea"
                          :items="areaList"
                          auto-select-first
                          chips
                          clearable
                          deletable-chips
                          multiple
                          outlined
                          label="Area"
                          hint="This coupon will be valid across allowed area."
                        >
                        </v-autocomplete>

                        <v-select
                          v-model="selectedPlatforms"
                          :items="platforms"
                          :rules="fieldsRules.validOn"
                          outlined
                          label="Valid on"
                          hint="This coupon will be valid across allowed platforms."
                          multiple
                          chips
                        >
                          <template v-slot:prepend-item>
                            <v-list-item ripple @click="toggle('valid-on')">
                              <v-list-item-action>
                                <v-icon
                                  :color="
                                    selectedPlatforms.length > 0
                                      ? 'indigo darken-4'
                                      : ''
                                  "
                                >
                                  {{ checkIconForMultiSelect }}
                                </v-icon>
                              </v-list-item-action>
                              <v-list-item-content>
                                <v-list-item-title>
                                  Select All
                                </v-list-item-title>
                              </v-list-item-content>
                            </v-list-item>
                            <v-divider class="mt-2"></v-divider>
                          </template>
                        </v-select>

                        <v-row>
                          <v-col md="6" class="py-0">
                            <b-date-time
                              v-model="editedItem.start_date"
                              rules="required"
                              label="Start Date"
                              outlined
                              hint="From when the coupon will be valid. Please enter a valid date"
                            />
                          </v-col>
                          <v-col md="6" class="py-0">
                            <b-date-time
                              v-model="editedItem.end_date"
                              rules="required"
                              outlined
                              label="End Date"
                              hint="Coupon will not be valid after end date. Please enter a valid date"
                            />
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col md="6" class="py-0">
                            <b-text
                              v-model="editedItem.uses_per_coupon"
                              rules="numeric"
                              outlined
                              label="Uses Per Coupon"
                              hint="The maximum number of times the coupon can be used by any customer. Leave blank for unlimited."
                            />
                          </v-col>
                          <v-col md="6" class="py-0">
                            <b-text
                              v-model="editedItem.uses_per_customer"
                              rules="numeric"
                              outlined
                              label="Uses Per Customer"
                              hint="The maximum number of times the coupon can be used by single customer. Leave blank for unlimited."
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
                :items="coupons"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.type="{ item }">
                  <span class="text-capitalize">{{ item.type }}</span>
                </template>
                <template v-slot:item.area="{ item }">
                  {{ getAreaNames(item.area) }}
                </template>

                <template v-slot:item.platforms="{ item }">
                  {{ getPlatforms(item.platforms) }}
                </template>

                <template v-slot:item.status="{ item }">
                  <v-chip
                    class="white--text"
                    :color="item.status === 'active' ? 'success' : 'warning'"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>
                <template v-slot:item.start_date="{ item }">
                  {{ getFormatTime(item.start_date) }}
                </template>
                <template v-slot:item.end_date="{ item }">
                  {{ getFormatTime(item.end_date) }}
                </template>
                <template v-slot:item.action="{ item }">
                  <div class="text-center">
                    <v-btn
                      :v-can="`update coupon`"
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
                    <v-btn
                      :v-can="`delete coupon`"
                      depressed
                      outlined
                      icon
                      fab
                      dark
                      color="pink"
                      class="mr-0"
                      small
                      title="Delete"
                      @click="deleteItem(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
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
import { confirmationAlert } from '@/plugins/sweetalert';
import { format } from 'date-fns';

export default {
  name: 'AppCoupons',
  data() {
    return {
      language: 'en',
      dialog: false,
      coupons: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      categories: [
        { text: 'Public', value: 'public' },
        { text: 'Corporate General', value: 'corporate' },
        { text: 'Corporate partnership', value: 'partnership' },
      ],
      types: ['percentage', 'fixed'],
      platforms: ['web', 'android', 'ios', 'manual'],
      areaList: [],
      allAreaList: [],
      selectedPlatforms: [],
      selectedArea: [],
      fieldsRules: {
        type: [(val) => (val || '').length > 0 || 'This field is required'],
        validOn: [(val) => (val || '').length > 0 || 'This field is required'],
        area: [(val) => (val || '').length > 0 || 'This field is required'],
      },
      main_headers: [
        { text: 'Code', value: 'code' },
        { text: 'Name', value: 'name' },
        { text: 'Type', value: 'type' },
        { text: 'Discount', value: 'discount' },
        { text: 'Area', value: 'area' },
        { text: 'Valid on', value: 'platforms' },
        { text: 'Start Date', value: 'start_date' },
        { text: 'End Date', value: 'end_date' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: true, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      editedIndex: -1,
      isFormLoaded: true,
      editedItem: {
        id: 0,
        name: '',
        code: '',
        category: 'public',
        type: 'percentage',
        discount: '0',
        total_amount: '',
        start_date: '',
        end_date: '',
        uses_per_coupon: '0',
        uses_per_customer: '1',
        status: 'active',
        selectedPlatforms: [],
        selectedArea: [],
      },
      defaultItem: {
        id: 0,
        name: '',
        code: '',
        category: 'public',
        type: 'percentage',
        discount: '0',
        total_amount: '',
        start_date: '',
        end_date: '',
        uses_per_coupon: '0',
        uses_per_customer: '1',
        status: 'active',
        selectedPlatforms: [],
        selectedArea: [],
      },
      getAreaNames(areaList) {
        const total = (areaList && areaList.length) || 0;
        let names = '';
        if (total > 0) {
          areaList.forEach((areaInfo, index) => {
            if (areaInfo)
              names += `${areaInfo.name}${total - 1 !== index ? ', ' : ''}`;
          });
          return names;
        } else return '-';
      },
      getPlatforms(platforms) {
        const total = (platforms && platforms.length) || 0;
        if (total > 0) {
          let names = '';
          platforms.forEach((platform, index) => {
            if (platform)
              names += `${platform}${total - 1 !== index ? ', ' : ''}`;
          });
          return names;
        } else return '-';
      },
      getFormatTime(time) {
        return time ? format(new Date(time), "dd-MMM-yyyy' 'KK:mm aa") : '';
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Coupon' : 'Edit Coupon';
    },
    likesAllPlatform() {
      return this.selectedPlatforms.length === this.platforms.length;
    },
    likesSomePlatform() {
      return this.selectedPlatforms.length > 0 && !this.likesAllPlatform;
    },
    likesAllArea() {
      return this.selectedArea.length === this.areaList.length;
    },
    likesSomeArea() {
      return this.selectedArea.length > 0 && !this.likesAllArea;
    },
    checkIconForMultiSelect() {
      if (this.likesAllPlatform) return 'mdi-close-box';
      if (this.likesSomePlatform) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getCouponsByPagination();
    },
    // for server side search
    search() {
      this.getCouponsByPagination();
    },
    language() {
      this.getCouponsByPagination();
    },
    dialog() {
      if (!this.dialog) {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.selectedPlatforms = [];
        this.selectedArea = [];
        this.isFormLoaded = false;
        setTimeout(() => {
          this.isFormLoaded = true;
        }, 100);
      }
    },
  },
  mounted() {
    this.getAreas();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getAreas();
      this.getCouponsByPagination();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get coupon by pagination
    getCouponsByPagination: debounce(async function () {
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
          `marketing/coupons?${url}`
        );
        this.loading = false;
        this.coupons = data;
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
      this.selectedPlatforms = item.platforms;
      this.selectedArea = getAreaNames(item.area);

      this.editedIndex = this.coupons.indexOf(item);

      if (item && !item.category) {
        item.category = 'public';
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
        url = `marketing/coupons/${this.editedItem.id}`;
        method = 'PATCH';
        this.update(url, method);
      } else {
        url = `marketing/coupons`;
        method = 'POST';
        this.update(url, method, { actionType: 'new' });
      }
    },
    async update(url, method, options) {
      try {
        const editedItem = this.editedItem;
        editedItem.platforms = this.selectedPlatforms;
        editedItem.area = getAreaIds(this).filter((el) => !!(el !== null));
        if (options && options.actionType === 'new') {
          delete editedItem.selectedPlatforms;
          delete editedItem.selectedArea;
        }

        const { message } = (
          await this.$axios({
            url,
            method,
            data: editedItem,
          })
        ).data;

        this.getCouponsByPagination();
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
    // delete coupon group
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteCoupon(item.id);
        }
        return false;
      });
    },
    async deleteCoupon(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/marketing/coupons/${id}`
        );
        this.getCouponsByPagination();
        this.$store.dispatch('crud_success_dialog', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    toggle(type) {
      this.$nextTick(() => {
        if (type === 'valid-on') {
          if (this.likesAllPlatform) this.selectedPlatforms = [];
          else this.selectedPlatforms = this.platforms.slice();
        }

        if (type === 'area') {
          if (this.likesAllArea) this.selectedArea = [];
          else this.selectedArea = this.areaList.slice();
        }
      });
    },
    async getAreas() {
      try {
        const { data } = await this.$axios.$get(`shipping/area-all`);

        if (data && data.length > 0) {
          this.allAreaList = data;
          data.forEach((areaInfo) => {
            !!areaInfo && this.areaList.push(areaInfo.name);
          });
        }
      } catch (e) {}
    },
  },
};

// Start outer methods
const getAreaIds = (instance) => {
  const selectedArea = instance.selectedArea;
  const allAreaList = instance.allAreaList;

  if (selectedArea.length > 0) {
    let couponDivisonList = [];
    selectedArea.forEach((areaName) => {
      const dataObj = allAreaList.find(
        (divisionInfo) => divisionInfo.name === areaName
      );
      couponDivisonList = [...couponDivisonList, ...[dataObj]];
    });

    return couponDivisonList;
  } else return [];
};

const getAreaNames = (areaList) => {
  const namesArray = [];
  areaList.forEach((info) => {
    if (info) namesArray.push(info.name);
  });

  return namesArray;
};
</script>
