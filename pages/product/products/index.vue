<template>
  <div id="productsList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Products</h3>
            <v-spacer />
            <v-btn
              v-can="`create product`"
              :loading="creating"
              color="primary"
              @click="createProduct"
            >
              Create Product
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
              <div class="d-flex">
                <v-select
                  v-model="selectedCategory"
                  :items="categoriesList"
                  label="Category"
                  class="mr-5"
                  outlined
                  dense
                  hide-details="auto"
                  style="max-width: 200px"
                ></v-select>
                <b-language v-model="language" class="mt-1" />
              </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="products"
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
                      width: 100,
                    }"
                  />
                </template>

                <template v-slot:item.facebookLink="{ item }">
                  <copy-content
                    :options="{
                      content: item.facebookLink,
                      isShowContent: true,
                      isShowToast: true,
                      width: 100,
                    }"
                  />
                </template>
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
                <template v-slot:item.action="{ item }">
                  <v-btn
                    v-can="`view product`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    :to="`/product/products/${item.id}`"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`update product`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    :to="`/product/products/${item.id}/edit?edit=true&lang=${language}`"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`delete product`"
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
import { setCategoryNamesList } from '@/util';

export default {
  name: 'Product',
  data() {
    return {
      language: 'en',
      products: [],
      selected: [],
      selectedCategory: '',
      categoriesList: [{ text: 'All', value: 'all' }],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {},
      headers: [
        { text: 'Date', value: 'datetime', width: 130 },
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Short Link', value: 'shortLink', width: 100 },
        { text: 'Facebook Link', value: 'facebookLink', width: 100 },
        { text: 'SKU', value: 'sku' },
        { text: 'Price', value: 'price' },
        { text: 'Quantity', value: 'quantity' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getProductsByPagination();
    },
    // for server side search
    search() {
      this.getProductsByPagination();
    },
    language() {
      this.getProductsByPagination();
    },
    selectedCategory(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.getProductsByPagination();
      }
    },
  },
  mounted() {
    this.getCategories();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getProductsByPagination();
      this.getCategories();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get product by pagination
    getProductsByPagination: debounce(async function () {
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

      // get by category
      if (this.selectedCategory && this.selectedCategory !== 'all') {
        url += `&category=${this.selectedCategory}`;
      }

      try {
        const { data, meta } = await this.$axios.$get(
          `${process.env.API_URL}/${this.language}/product/product?${url}`
        );
        this.loading = false;
        this.products = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create product
    async createProduct() {
      this.creating = true;
      try {
        const { productId } = await this.$axios.$post(
          `${process.env.API_URL}/${this.language}/product/product`
        );
        this.creating = false;
        this.$router.push(`/product/products/${productId}/edit`);
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete product
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteProduct(item.id);
        }
        return false;
      });
    },
    async deleteProduct(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/${this.language}/product/product/${id}`
        );
        this.getProductsByPagination();
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
          `${this.language}/product/category-tree`
        );

        // Please insure, keep 'categoriesList' in instance.
        setCategoryNamesList(this, data);
      } catch (e) {}
    },
  },
};
</script>
