<template>
  <div id="questionsList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Questions</h3>
            <v-spacer />
            <v-btn
              v-can="`create question`"
              :loading="creating"
              color="primary"
              @click="createQuestion"
            >
              Create Question
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
                :items="questionsList"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.type="{ item }">
                  <v-chip
                    class="white--text text-capitalize"
                    :color="getTypeColor(item.type)"
                  >
                    {{ item.type }}
                  </v-chip>
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
                    v-can="`view question`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    :to="`/quiz/question/${item.id}`"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`update question`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    :to="`/quiz/question/${item.id}/edit?edit=true&lang=${language}`"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`delete question`"
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

export default {
  name: 'QuestionsList',
  data() {
    return {
      language: 'en',
      questionsList: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {},
      headers: [
        { text: 'Date', value: 'created_at' },
        { text: 'Title', value: 'title', sortable: false },
        { text: 'Type', value: 'type' },
        { text: 'Status', value: 'status' },
        {
          text: 'Actions',
          value: 'action',
          sortable: false,
          align: 'center',
          width: 160,
        },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      getTypeColor(type) {
        let color = 'primary';
        if (type === 'sms') color = 'success';
        else if (type === 'push_notification') color = 'blue';

        return color;
      },
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getQuestionsByPagination();
    },
    // for server side search
    search() {
      this.getQuestionsByPagination();
    },
    language() {
      this.getQuestionsByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getQuestionsByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get article by pagination
    getQuestionsByPagination: debounce(async function () {
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
          `${this.language}/quiz/question?${url}`
        );
        this.loading = false;
        this.questionsList = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create question
    async createQuestion() {
      this.creating = true;
      try {
        const { questionId } = await this.$axios.$post(
          `${this.language}/quiz/question`
        );
        this.creating = false;
        if (questionId) {
          this.$router.push(`/quiz/question/${questionId}/edit`);
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
          `${this.language}/quiz/question/${id}`
        );
        this.getQuestionsByPagination();
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
