<template>
  <div id="cacheManagement">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <h4>Cache Management</h4>
        </v-flex>
        <v-flex xs12>
          <v-card>
            <v-data-table
              :headers="headers"
              :items="commands"
              :loading="loading"
              hide-default-footer
              item-key="key"
              loading-text="Loading... Please wait"
              class="elevation-1"
            >
              <template v-slot:item.key="{ item }">
                <v-btn
                  small
                  :color="item.class"
                  class="text-lowercase"
                  @click="applyCommand(item.key)"
                >
                  {{ item.key }}
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'CacheManagement',
  data() {
    return {
      commands: [],
      loading: false,
      headers: [
        { text: 'Description', value: 'text' },
        { text: 'Actions', value: 'key' },
      ],
    };
  },
  mounted() {
    this.getSupportedArtisanCommands();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () =>
      this.getSupportedArtisanCommands()
    );
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get supported commands
    async getSupportedArtisanCommands() {
      this.loading = true;
      try {
        const data = await this.$axios.$get(
          `${process.env.API_URL}/cache-supported-commands`
        );
        this.commands = data;
        this.loading = false;
      } catch (e) {
        this.loading = false;
      }
    },

    applyCommand(command) {
      this.$swal
        .fire({
          title: 'Are you sure?',
          text: 'You want to do this action!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, do it!',
        })
        .then((result) => {
          if (result.value) {
            this.runCommand(command);
          }
          return false;
        });
    },
    async runCommand(command) {
      this.loading = true;
      try {
        const { message } = await this.$axios.$get(
          `${process.env.API_URL}/cache-run-command/${command}`
        );
        this.loading = false;
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (e) {
        this.loading = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>
