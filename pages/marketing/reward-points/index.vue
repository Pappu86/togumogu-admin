<template>
  <div id="rewardPoints">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Reward Points</h3>
            <v-spacer />
            <v-dialog v-model="dialog" max-width="400px">
              <!-- <template v-slot:activator="{ on }">
                <v-btn
                  :v-can="`create reward_points`"
                  color="primary"
                  v-on="on"
                  @click="editedIndex = -1"
                >
                  New Reward Points
                </v-btn>
              </template> -->
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
                          <v-col md="12" class="py-0">
                            <v-select
                              v-model="editedItem.category"
                              :items="categories"
                              outlined
                              label="Category"
                              dense
                            ></v-select>
                          </v-col>
                        </v-row>
                        <v-row class="mt-5">
                          <v-col md="6" class="py-0">
                            <v-select
                              v-model="editedItem.type"
                              :items="types"
                              outlined
                              label="Type"
                              dense
                            ></v-select>
                          </v-col>

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

                        <v-row>
                          <v-col md="6" class="py-0">
                            <b-text
                              v-if="isShow(editedItem, 'max_award_points')"
                              v-model="editedItem.max_award_points"
                              rules="decimal:0"
                              outlined
                              label="Max points at a time"
                              dense
                            />
                          </v-col>
                          <v-col md="6" class="py-0">
                            <b-text
                              v-if="isShow(editedItem, 'min_amount')"
                              v-model="editedItem.min_amount"
                              rules="decimal:0"
                              outlined
                              label="Minimum Amount"
                              dense
                            />
                          </v-col>
                        </v-row>

                        <v-row>
                          <v-col md="6" class="py-0">
                            <b-date-time
                              v-model="editedItem.start_date"
                              label="Start Date"
                              outlined
                              dense
                              hint="From when the award point will be valid. Please enter a valid date"
                            />
                          </v-col>
                          <v-col md="6" class="py-0">
                            <b-date-time
                              v-model="editedItem.end_date"
                              outlined
                              label="End Date"
                              dense
                              hint="Award point will not be valid after end date. Please enter a valid date"
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
                :items="rewardPoints"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.type="{ item }">
                  <span class="text-capitalize">{{ item.type }}</span>
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
                <template v-slot:item.category="{ item }">
                  {{ getCategoryName(item.category) }}
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
                      :v-can="`update reward-points`"
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
import { confirmationAlert } from '@/plugins/sweetalert';
import { format } from 'date-fns';

export default {
  name: 'AppRewardPoints',
  data() {
    return {
      language: 'en',
      dialog: false,
      rewardPoints: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      types: [
        { text: 'Fixed', value: 'fixed', disabled: true },
        { text: 'Percentage', value: 'percentage', disabled: false },
      ],
      categories: [
        {
          text: 'Receiver reward point for signup',
          value: 'receiver_reward_point_for_signup',
          disabled: true,
        },
        {
          text: 'Sender reward point for signup',
          value: 'sender_reward_point_for_signup',
          disabled: true,
        },
        {
          text: 'Order Created',
          value: 'order_created',
          disabled: true,
        },
        {
          text: 'Post Created',
          value: 'post_created',
          disabled: true,
        },
        {
          text: 'Post Comment',
          value: 'post_comment',
          disabled: true,
        },
        {
          text: 'Article Read',
          value: 'article_read',
          disabled: true,
        },
        {
          text: 'Video watch',
          value: 'video_watch',
          disabled: true,
        },
        {
          text: 'Profile updated',
          value: 'profile_updated',
          disabled: true,
        },
        {
          text: 'Service Registration',
          value: 'service_registration',
          disabled: true,
        },
      ],
      platforms: ['web', 'android', 'ios', 'manual'],
      selectedPlatforms: [],
      main_headers: [
        { text: 'Category Name', value: 'category' },
        { text: 'Award Points', value: 'award_points' },
        { text: 'Type', value: 'type' },
        { text: 'Start Date', value: 'start_date' },
        { text: 'End Date', value: 'end_date' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: true, align: 'center' },
      ],
      editedIndex: -1,
      isFormLoaded: true,
      editedItem: {
        id: 0,
        category: '',
        award_points: '0',
        type: 'fixed',
        min_amount: 0,
        max_award_points: 0,
        start_date: '',
        end_date: '',
        status: 'active',
        selectedPlatforms: [],
      },
      defaultItem: {
        id: 0,
        category: 'receiver_reward_point_for_signup',
        award_points: '0',
        type: 'fixed',
        min_amount: 0,
        max_award_points: 0,
        start_date: '',
        end_date: '',
        status: 'active',
        selectedPlatforms: [],
      },
      isShow(item, type) {
        const list = ['order_created'];
        return list.includes(item.category);
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
      getCategoryName(type) {
        if (type) {
          const category = this.categories.find((item) => item.value === type);
          return category ? category.text : '';
        }
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Award Point' : 'Edit Award Point';
    },
    likesAllPlatform() {
      return this.selectedPlatforms.length === this.platforms.length;
    },
    likesSomePlatform() {
      return this.selectedPlatforms.length > 0 && !this.likesAllPlatform;
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
      this.getRewardPointsByPagination();
    },
    // for server side search
    search() {
      this.getRewardPointsByPagination();
    },
    editedItem(newVal, oldVal) {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        this.types = this.types.filter((type) => {
          if (
            newVal.category !== 'order_created' &&
            type.value === 'percentage'
          ) {
            type.disabled = true;
          } else type.disabled = false;
          return type;
        });
      }
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
      this.getRewardPointsByPagination();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get reward points by pagination
    getRewardPointsByPagination: debounce(async function () {
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
          `marketing/reward-points?${url}`
        );
        this.loading = false;
        this.rewardPoints = data;
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

      this.editedIndex = this.rewardPoints.indexOf(item);

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
        url = `marketing/reward-points/${this.editedItem.id}`;
        method = 'PATCH';
        this.update(url, method);
      } else {
        url = `marketing/reward-points`;
        method = 'POST';
        this.update(url, method, { actionType: 'new' });
      }
    },
    async update(url, method, options) {
      try {
        const editedItem = this.editedItem;
        editedItem.platforms = this.selectedPlatforms;
        if (options && options.actionType === 'new') {
          delete editedItem.selectedPlatforms;
        }

        editedItem.award_points = this.editedItem.award_points * 1;

        const { message } = (
          await this.$axios({
            url,
            method,
            data: editedItem,
          })
        ).data;

        this.getRewardPointsByPagination();
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
    // delete reward points group
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteRewardPoints(item.id);
        }
        return false;
      });
    },
    async deleteRewardPoints(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/marketing/reward-points/${id}`
        );
        this.getRewardPointsByPagination();
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
      });
    },
  },
};
</script>
