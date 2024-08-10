<template>
  <div id="homeSliders">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div style="display: flex">
            <h3>Sliders</h3>
            <v-spacer />
            <v-btn
              :v-can="`create main_slider`"
              :loading="creating"
              color="primary"
              @click="create"
            >
              New Slider
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
                :items="sliders"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.url="{ item }">
                  <v-avatar v-if="item.url">
                    <img :src="item.url" :alt="item.title" />
                  </v-avatar>
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
                  <div class="text-center">
                    <v-btn
                      :v-can="`update main_slider`"
                      depressed
                      outlined
                      icon
                      fab
                      dark
                      color="teal"
                      class="mr-0"
                      small
                      title="Edit"
                      :to="`/home/sliders/${item.id}`"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      :v-can="`delete main_slider`"
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
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'HomeSlider',
  data() {
    return {
      language: 'en',
      dialog: false,
      sliders: [],
      selected: [],
      search: '',
      total: 0,
      loading: false,
      creating: false,
      pagination: {
        descending: true,
      },
      main_headers: [
        { text: 'Image', value: 'url' },
        { text: 'Title', value: 'title' },
        { text: 'Type', value: 'type' },
        { text: 'Category', value: 'category' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Slider' : 'Edit Slider';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getSlidersByPagination();
    },
    // for server side search
    search() {
      this.getSlidersByPagination();
    },
    language() {
      this.getSlidersByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getSlidersByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get Slider by pagination
    getSlidersByPagination: debounce(async function () {
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
          `${this.language}/home/slider?${url}`
        );
        this.loading = false;
        this.sliders = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create Slider
    async create() {
      this.creating = true;
      try {
        const { sliderId } = await this.$axios.$post(
          `${this.language}/home/slider`
        );
        this.creating = false;
        this.$router.push(`/home/sliders/${sliderId}`);
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // delete Slider
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteSlider(item.id);
        }
        return false;
      });
    },
    async deleteSlider(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/home/slider/${id}`
        );
        this.getSlidersByPagination();
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
