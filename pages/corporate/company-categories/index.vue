<template>
  <div id="companyCategories">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Categories</h3>
            <v-spacer />
            <v-btn
              v-can="`create company_category`"
              color="primary"
              dark
              :loading="creating"
              @click="create"
            >
              New Category
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
                :headers="main_headers"
                :items="categories"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.status="{ item }">
                  <v-chip
                    class="white--text"
                    :color="item.status === 'active' ? 'success' : 'warning'"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>
                <template v-slot:item.action="{ item }">
                  <edit-in-same-page-actions
                    update="update company_category"
                    delete-action="delete company_category"
                    :to="`/corporate/company-categories/${item.id}`"
                    @editItem="editItem(item)"
                    @deleteItem="deleteItem(item)"
                  />
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
  name: 'CompanyCategory',
  data() {
    return {
      language: 'en',
      dialog: false,
      categories: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      main_headers: [
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      logItems: {},
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Category' : 'Edit Category';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getCategoriesByPagination();
    },
    // for server side search
    search() {
      this.getCategoriesByPagination();
    },
    language() {
      this.getCategoriesByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getCategoriesByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get category by pagination
    getCategoriesByPagination: debounce(async function () {
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
        const { data } = await this.$axios.$get(
          `${this.language}/corporate/company-category?${url}`
        );
        this.loading = false;
        this.categories = data;
        this.logItems = data;
        this.total = this.logItems.length;

        // console.log(meta.total);
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create category
    async create() {
      this.creating = true;
      try {
        const { categoryId } = await this.$axios.$post(
          `${this.language}/corporate/company-category`
        );
        this.creating = false;
        if (categoryId) {
          this.$router.push(`/corporate/company-categories/${categoryId}`);
        }
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete category
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteCategory(item.id);
        }
        return false;
      });
    },
    async deleteCategory(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/corporate/company-category/${id}`
        );
        this.getCategoriesByPagination();
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
