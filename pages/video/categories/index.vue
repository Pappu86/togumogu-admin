<template>
  <div id="videoCategories">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Categories</h3>
            <v-spacer />
            <v-btn
              v-can="`create video_category`"
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
            <v-card-text>
              <vue-nestable v-model="newCategories" :max-depth="3">
                <template slot-scope="{ item }">
                  <vue-nestable-handle :item="item">
                    <v-icon>mdi-drag</v-icon>
                  </vue-nestable-handle>
                  <div class="nestable-title">
                    {{ item.name }}
                  </div>
                  <v-spacer />
                  <div class="nestable-status">
                    <v-chip
                      class="white--text"
                      :color="item.status === 'active' ? 'success' : 'warning'"
                    >
                      {{ item.status }}
                    </v-chip>
                  </div>
                  <div class="nestable-action">
                    <v-btn
                      :v-can="`update video_category`"
                      depressed
                      outlined
                      icon
                      fab
                      dark
                      color="primary"
                      class="mr-0"
                      small
                      title="Edit"
                      :to="`/video/categories/${item.id}`"
                      nuxt
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      :v-can="`delete video_category`"
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
              </vue-nestable>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                :loading="loading"
                color="primary"
                outlined
                @click="updateParentChild"
              >
                Update
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { VueNestable, VueNestableHandle } from 'vue-nestable';
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'VideoCategory',
  components: { VueNestable, VueNestableHandle },
  data() {
    return {
      language: 'en',
      dialog: false,
      categories: [],
      newCategories: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      main_headers: [
        { text: 'Name', value: 'name' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
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
    // search() {
    //   this.getCategoriesByPagination();
    // },
    language() {
      this.getCategoriesByPagination();
    },
    search(searchKey, oldValue) {
      if (!searchKey) this.newCategories = this.categories;

      if (searchKey !== oldValue) {
        const categoriesList = this.categories;
        const newCategoriesList = [];

        categoriesList.forEach((category) => {
          let name = category.name;
          const regEx = new RegExp(searchKey, 'gi');
          // Get all child category name
          name += getNameString(category.children);
          const matched = name.match(regEx);
          if (matched) {
            newCategoriesList.push(category);
          }

          this.newCategories = newCategoriesList;
        });
      }
    },
  },
  mounted() {
    this.getCategoriesByPagination();
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
      const url = `page=${1}&per_page=${300}`;

      try {
        const { data, meta } = await this.$axios.$get(
          `${this.language}/video/category?${url}`
        );
        this.loading = false;
        this.categories = data;
        this.newCategories = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // update parent child
    async updateParentChild() {
      try {
        const { message } = await this.$axios.$post(
          `${this.language}/video/category-rebuild`,
          this.newCategories
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
    // create category
    async create() {
      this.creating = true;
      try {
        const { categoryId } = await this.$axios.$post(
          `${this.language}/video/category`
        );
        this.creating = false;
        this.$router.push(`/video/categories/${categoryId}`);
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
          `${this.language}/video/category/${id}`
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

// Get children category name
const getNameString = (childCategories) => {
  let name = '';
  if (childCategories && childCategories.length > 0) {
    childCategories.forEach((category) => {
      name += category.name;

      if (category.children) {
        name += getNameString(category.children);
      }
    });
  }
  return name;
};
</script>
