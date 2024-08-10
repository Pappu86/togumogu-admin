<template>
  <div id="topics">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Topics</h3>
            <v-spacer />
            <v-btn
              v-can="`create topic`"
              color="primary"
              dark
              :loading="creating"
              @click="create"
            >
              New Topic
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
              <vue-nestable v-model="newTopics" :max-depth="1">
                <template slot-scope="{ item }">
                  <div class="nest-row">
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
                        :color="
                          item.status === 'active' ? 'success' : 'warning'
                        "
                      >
                        {{ item.status }}
                      </v-chip>
                    </div>
                    <div class="nestable-action">
                      <v-btn
                        :v-can="`update topc`"
                        depressed
                        outlined
                        icon
                        fab
                        dark
                        color="primary"
                        class="mr-0"
                        small
                        title="Edit"
                        :to="`/community/topics/${item.id}?edit=true`"
                        nuxt
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        :v-can="`delete topic`"
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
      topics: [],
      newTopics: [],
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
      return this.editedIndex === -1 ? 'New Topic' : 'Edit Topic';
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
      if (!searchKey) this.newTopics = this.topics;

      if (searchKey !== oldValue) {
        const topicsList = this.topics;
        const newTopicsList = [];

        topicsList.forEach((topic) => {
          let name = topic.name;
          const regEx = new RegExp(searchKey, 'gi');
          // Get all child topic name
          name += getNameString(topic.children);
          const matched = name.match(regEx);
          if (matched) {
            newTopicsList.push(topic);
          }

          this.newTopics = newTopicsList;
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
    // get topic by pagination
    getCategoriesByPagination: debounce(async function () {
      this.loading = true;
      const url = `page=${1}&per_page=${300}`;

      try {
        const { data, meta } = await this.$axios.$get(
          `${this.language}/community/topic?${url}`
        );
        this.loading = false;
        this.topics = data;
        this.newTopics = data;
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
          `${this.language}/community/topic-rebuild`,
          this.newTopics
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
    // create topic
    async create() {
      this.creating = true;
      try {
        const { topicId } = await this.$axios.$post(
          `${this.language}/community/topic`
        );
        this.creating = false;
        this.$router.push(`/community/topics/${topicId}`);
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete topic
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
          `${this.language}/community/topic/${id}`
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

// Get children topic name
const getNameString = (childCategories) => {
  let name = '';
  if (childCategories && childCategories.length > 0) {
    childCategories.forEach((topic) => {
      name += topic.name;

      if (topic.children) {
        name += getNameString(topic.children);
      }
    });
  }
  return name;
};
</script>
