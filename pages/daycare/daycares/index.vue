<template>
  <div id="daycaresList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Daycares</h3>
            <v-spacer />
            <v-btn
              v-can="`create daycare`"
              :loading="creating"
              color="primary"
              @click="createPost"
            >
              Create Daycare
            </v-btn>
            <v-btn
              v-can="`create daycare`"
              color="success"
              class="ml-2"
              @click="isShowBulkCreateDailog = true"
            >
              Add Bulk Daycares
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
                :items="daycares"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.shortLink="{ item }">
                  <copy-content
                    :options="{
                      content: item.shortLink,
                      isShowContent: true,
                      isShowToast: true,
                      width: 160,
                    }"
                  />
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
                    v-can="`view daycare`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    :to="`/daycare/daycares/${item.id}`"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`update daycare`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    :to="`/daycare/daycares/${item.id}/edit?edit=true&lang=${language}`"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`delete daycare`"
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

    <!-- Employee Bulk add modal -->
    <v-dialog v-model="isShowBulkCreateDailog" persistent max-width="850">
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Add Bulk Daycares</span>
          <v-btn icon dark class="ma-0" @click.stop="closeDialog('bulk')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-form @submit.prevent="onBulkSubmitHandler" @reset.prevent="reset">
          <v-card-text class="pt-5">
            <v-row>
              <v-col cols="6">
                <v-expansion-panels flat>
                  <v-expansion-panel>
                    <v-expansion-panel-header disable-icon-rotate>
                      Category
                      <template v-slot:actions>
                        <v-icon
                          v-if="selectedCategories.length > 0"
                          color="teal"
                        >
                          mdi-check
                        </v-icon>
                        <v-icon
                          v-else=""
                          color="warning"
                          title="Please select category"
                        >
                          mdi-alert
                        </v-icon>
                      </template>
                    </v-expansion-panel-header>
                    <v-divider />
                    <v-expansion-panel-content>
                      <template v-if="categories.length > 0">
                        <v-sheet class="pt-3">
                          <v-text-field
                            v-model="category"
                            placeholder="Search category"
                            outlined
                            clear-icon="mdi-close-circle-outline"
                            hide-details
                            clearable
                            dense
                          ></v-text-field>
                        </v-sheet>
                        <scrollbar style="max-height: 200px">
                          <v-treeview
                            v-model="selectedCategories"
                            :items="categories"
                            :search="category"
                            selectable
                            return-object
                            item-disabled="disabled"
                          ></v-treeview>
                        </scrollbar>
                      </template>
                      <template v-else="">
                        <div
                          class="d-flex pt-5 mt-5 pb-5 justify-center red--text"
                        >
                          Please, At first create a category!
                        </div>
                      </template>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
              <v-col cols="6">
                <v-file-input
                  v-model="file"
                  label="CSV File"
                  placeholder="Select daycares list CSV file"
                  show-size
                  :disabled="selectedCategories.length <= 0"
                  @change="uploadCSVFile(file)"
                  @click:clear="clearFileField()"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-card-text>
          <template v-if="bulkMissingData.length > 0">
            <v-card-text class="pt-2">
              <v-card-title class="pb-0 pt-0">
                Missing name and address these daycares
              </v-card-title>
              <v-simple-table class="mb-5">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left">email</th>
                      <th class="text-left">mobile</th>
                      <th class="text-left">Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in bulkMissingData" :key="index">
                      <td>{{ item.name }}</td>
                      <td>{{ item.email }}</td>
                      <td>{{ item.mobile }}</td>
                      <td>{{ item.address }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>
          </template>
          <v-divider></v-divider>
          <action-button-dialog
            :error="invalidBulkForm"
            :loading="loading"
            @close="closeDialog('bulk')"
          />
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';
import { csvFileToJSON } from '@/util';

export default {
  name: 'DaycareArticle',
  data() {
    return {
      language: 'en',
      daycares: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {},
      headers: [
        { text: 'Date', value: 'created_at' },
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Short Link', value: 'shortLink' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      isShowBulkCreateDailog: false,
      invalidBulkForm: true,
      file: null,
      category: '',
      categories: [],
      selectedCategories: [],
      bulkInsertableData: [],
      bulkMissingData: [],
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getDaycaresByPagination();
    },
    // for server side search
    search() {
      this.getDaycaresByPagination();
    },
    language() {
      this.getDaycaresByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getDaycaresByPagination();
      this.getCategories();
    });

    this.getCategories();
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get article by pagination
    getDaycaresByPagination: debounce(async function () {
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
          `${this.language}/daycare/daycares?${url}`
        );
        this.loading = false;
        this.daycares = data;
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
    async createPost() {
      this.creating = true;
      try {
        const { daycareId } = await this.$axios.$post(
          `${this.language}/daycare/daycares`
        );
        this.creating = false;
        this.$router.push(`/daycare/daycares/${daycareId}/edit`);
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
          `${this.language}/daycare/daycares/${id}`
        );
        this.getDaycaresByPagination();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/daycare/category-all`
        );
        this.categories = data;
      } catch (e) {}
    },
    clearFileField() {
      // Enabled the categories item
      setCategoris(this, false);
    },
    async uploadCSVFile(file) {
      this.bulkMissingData = [];

      if (
        file &&
        (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel')
      ) {
        const csvData = await csvFileToJSON(file);
        const csvDataLength = csvData.length;
        if (csvDataLength && isValidCSVData(this, csvData, csvDataLength)) {
          this.invalidBulkForm = false;
          // Disabled the categories item
          setCategoris(this, true);
        }
      } else {
        this.invalidBulkForm = true;
        if (file) {
          this.$toasted.error('Wrong file format! Please select CSV file.');
        }
      }
    },
    onBulkSubmitHandler() {
      this.onBulkSubmit();
    },
    async onBulkSubmit() {
      const url = `${this.language}/daycare/daycares/bulk-create`;
      try {
        const { message } = (
          await this.$axios({
            url,
            method: 'POST',
            data: this.bulkInsertableData,
          })
        ).data;

        this.bulkInsertableData = [];
        this.getDaycaresByPagination();
        this.closeDialog('bulk');
        this.$store.dispatch('crud_success_dialog', message);
      } catch (err) {
        if (err.response.status === 422) {
          this.$store.commit(
            'APP_NETWORK_ERROR',
            err.response && err.response.data.message
          );
        }
      }
    },
    closeDialog(type) {
      if (type && type === 'bulk') {
        this.bulkInsertableData = [];
        this.bulkMissingData = [];
        this.file = null;
        this.isShowBulkCreateDailog = false;
        this.invalidBulkForm = true;
        // Enabled the categories item
        setCategoris(this, false);
      }
    },
  },
};

const isValidCSVData = (instance, csvData, totalSize) => {
  const newBulkData = [];
  const missingBulkData = [];
  csvData.forEach((daycare) => {
    if (daycare && (!daycare.name || !daycare.address)) {
      missingBulkData.push(daycare);
    } else {
      const daycareData = {
        name: daycare.name || '',
        status: 'active',
        categories: instance.selectedCategories || [],
        contact: {
          name: daycare.contact_name || '',
          email: daycare.email || '',
          website: daycare.website || '',
          mobile: daycare.mobile || '',
        },
        latitude: daycare.latitude || '',
        longitude: daycare.longitude || '',
        content: daycare.content || '',
        description: daycare.description || '',
        meta_title: daycare.meta_title || '',
        meta_description: daycare.meta_description || '',
        meta_keyword: daycare.meta_keyword || '',
        hospital_address: daycare.hospital_address || '',
        house: daycare.address || '',
        location: {
          house: daycare.address || '',
        },
        division_id: daycare.division_id || '',
        district_id: daycare.district_id || '',
        area_id: daycare.area_id || '',
        care_givers: daycare.number_of_care_giver || '',
        year: daycare.establishment_year || '',
        social_links: getSocialLinks(daycare),
      };

      newBulkData.push(daycareData);
    }
  });

  instance.bulkInsertableData = newBulkData;
  instance.bulkMissingData = missingBulkData;

  return !missingBulkData.length;
};

const setCategoris = (instance, isDisabled) => {
  const newCategories = [];
  instance.categories.forEach((category) =>
    newCategories.push({ ...category, disabled: !!isDisabled })
  );
  instance.categories = newCategories;
};

const getSocialLinks = (daycare) => {
  const links = [];

  if (daycare && daycare.facebook_link) {
    links.push({ link: daycare.facebook_link });
  }

  if (daycare && daycare.twitter_link) {
    links.push({ link: daycare.twitter_link });
  }

  if (daycare && daycare.other_link) {
    links.push({ link: daycare.other_link });
  }

  if (daycare && daycare.web_link) {
    links.push({ link: daycare.web_link });
  }

  return links;
};
</script>
