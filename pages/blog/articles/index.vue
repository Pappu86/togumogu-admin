<template>
  <div id="articlesList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Articles</h3>
            <v-spacer />
            <v-btn
              v-can="`create blog_article`"
              :loading="creating"
              color="primary"
              @click="createPost"
            >
              Create Post
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
                :items="articles"
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
                <template v-slot:item.tracker_range="{ item }">
                  <template v-if="item.tracker_range">{{
                    getTrackerRange(item.tracker_range)
                  }}</template>
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
                    v-can="`view blog_article`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    :to="`/blog/articles/${item.id}`"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`update blog_article`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    :to="`/blog/articles/${item.id}/edit?edit=true&lang=${language}`"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`delete blog_article`"
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
  name: 'BlogArticle',
  data() {
    return {
      language: 'en',
      articles: [],
      selected: [],
      categoriesList: [{ text: 'All', value: 'all' }],
      selectedCategory: '',
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {},
      headers: [
        { text: 'Date', value: 'datetime' },
        { text: 'Title', value: 'title' },
        { text: 'Short Link', value: 'shortLink' },
        { text: 'Tracker Type', value: 'tracker' },
        { text: 'Tracker Range', value: 'tracker_range', sortable: false },
        { text: 'Categories', value: 'categories', sortable: false },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      getTrackerRange(range) {
        const { start, end } = range;
        const startYear =
          start && start.year
            ? `${start.year}${start.year > 1 ? 'years' : 'year'}`
            : '';
        const startMonth =
          start && start.month
            ? `${start.month}${start.month > 1 ? 'months' : 'month'}`
            : '';
        const startWeek =
          start && start.week
            ? `${start.week}${start.week > 1 ? 'weeks' : 'week'}`
            : '';
        const startDay =
          start && start.day
            ? `${start.day}${start.day > 1 ? 'days' : 'day'}`
            : '';

        const endYear =
          end && end.year
            ? `${end.year}${end.year > 1 ? 'years' : 'year'}`
            : '';
        const endMonth =
          end && end.month
            ? `${end.month}${end.month > 1 ? 'months' : 'month'}`
            : '';
        const endWeek =
          end && end.week
            ? `${end.week}${end.week > 1 ? 'weeks' : 'week'}`
            : '';
        const endDay =
          end && end.day ? `${end.day}${end.day > 1 ? 'days' : 'day'}` : '';

        return `(${startYear} ${startMonth} ${startWeek} ${startDay}) - (${endYear} ${endMonth} ${endWeek} ${endDay})`;
      },
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getArticlesByPagination();
    },
    // for server side search
    search() {
      this.getArticlesByPagination();
    },
    language() {
      this.getArticlesByPagination();
    },
    selectedCategory(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.getArticlesByPagination();
      }
    },
  },
  mounted() {
    this.getCategories();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCategories();
      this.getArticlesByPagination();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get article by pagination
    getArticlesByPagination: debounce(async function () {
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
          `${process.env.API_URL}/${this.language}/blog/article?${url}`
        );
        this.loading = false;
        this.articles = data;
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
        const { articleId } = await this.$axios.$post(
          `${process.env.API_URL}/${this.language}/blog/article`
        );
        this.creating = false;
        if (articleId) {
          this.$router.push(`/blog/articles/${articleId}/edit`);
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
          this.deletePost(item.id);
        }
        return false;
      });
    },
    async deletePost(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/${this.language}/blog/article/${id}`
        );
        this.getArticlesByPagination();
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
          `${this.language}/blog/category-tree`
        );
        // Please insure, keep 'categoriesList' in instance.
        setCategoryNamesList(this, data);
      } catch (e) {}
    },
  },
};
</script>
