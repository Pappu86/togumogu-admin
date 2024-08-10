<template>
  <div id="videosList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Trashed Videos</h3>
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
                :items="videos"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
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
                    v-can="`restore video`"
                    icon
                    small
                    fab
                    color="teal"
                    title="restore"
                    @click="restoreItem(item.id)"
                  >
                    <v-icon>mdi-restore</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`forceDelete video`"
                    icon
                    small
                    fab
                    color="pink"
                    title="delete"
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
  name: 'VideoTrashed',
  data() {
    return {
      language: 'en',
      videos: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {},
      headers: [
        { text: 'Date', value: 'datetime' },
        { text: 'Title', value: 'title', sortable: false },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getVideosByPagination();
    },
    // for server side search
    search() {
      this.getVideosByPagination();
    },
    language() {
      this.getVideosByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getVideosByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get video by pagination
    getVideosByPagination: debounce(async function () {
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
          `${process.env.API_URL}/${this.language}/video/video-trashed?${url}`
        );
        this.loading = false;
        this.videos = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // delete video
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteVideo(item.id);
        }
        return false;
      });
    },
    async deleteVideo(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/${this.language}/video/video-force/${id}`
        );
        this.getVideosByPagination();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async restoreItem(id) {
      try {
        const { message } = await this.$axios.$get(
          `${process.env.API_URL}/${this.language}/video/video-trashed/${id}`
        );
        this.getVideosByPagination();
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
