<template>
  <div id="hashTags">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Hashtags</h3>
            <v-spacer />
            <v-btn
              :v-can="`create tag`"
              color="primary"
              :loading="creating"
              @click="create"
            >
              New Hashtag
            </v-btn>
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
                :items="hashtags"
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
                  <edit-with-dialog-actions
                    update="update hashtag"
                    delete-action="delete hashtag"
                    @editItem="editItem(item)"
                    @deleteItem="deleteItem(item)"
                  />
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">{{ formTitle }}</span>
          <v-btn icon dark class="ma-0" @click.stop="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <validation-observer v-slot="{ handleSubmit, invalid, reset }">
          <v-form @submit.prevent="handleSubmit(update)" @reset.prevent="reset">
            <v-card-text>
              <b-text
                v-model="editedItem.name"
                rules="required"
                outlined
                label="Name"
              />
              <active-inactive-dialog v-model="editedItem.status" />
            </v-card-text>
            <v-divider />
            <action-button-dialog
              :loading="loading"
              :error="invalid"
              @close="close"
            />
          </v-form>
        </validation-observer>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';

export default {
  name: 'HashTags',
  data() {
    return {
      language: 'en',
      dialog: false,
      hashtags: [],
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
      editedIndex: -1,
      editedItem: {
        id: 0,
        name: '',
        status: 'active',
      },
      defaultItem: {
        id: 0,
        name: '',
        status: 'active',
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Hash Tag' : 'Edit Hash Tag';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getHashtagsByPagination();
    },
    // for server side search
    search() {
      this.getHashtagsByPagination();
    },
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getHashtagsByPagination()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get tag by pagination
    getHashtagsByPagination: debounce(async function () {
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
          `${process.env.API_URL}/common/hashtag?${url}`
        );
        this.loading = false;
        this.hashtags = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // create tag
    async create() {
      this.creating = true;
      try {
        const { hashtagId } = await this.$axios.$post(
          `${process.env.API_URL}/common/hashtag`
        );
        this.creating = false;
        this.editedItem.id = hashtagId;
        this.dialog = true;
      } catch (e) {
        this.creating = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // open dialog to edit category
    editItem(item) {
      this.editedIndex = this.tags.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    // close dialog
    close() {
      this.dialog = false;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
    },
    async update() {
      try {
        const { message } = await this.$axios.$patch(
          `${process.env.API_URL}/common/hashtag/${this.editedItem.id}`,
          this.editedItem
        );
        this.gethashtagsByPagination();
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
    // delete tag group
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteTag(item.id);
        }
        return false;
      });
    },
    async deleteTag(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${process.env.API_URL}/common/hashtag/${id}`
        );
        this.getHashtagsByPagination();
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
