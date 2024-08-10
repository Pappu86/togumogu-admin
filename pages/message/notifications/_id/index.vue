<template>
  <div id="NotificationSingle">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-if="notificationInfo">
            <v-card-title>
              <h4>Single Notification - &nbsp;</h4>
              <v-chip
                class="white--text"
                :color="
                  notificationInfo.status === 'active' ? 'success' : 'warning'
                "
              >
                {{ notificationInfo.status }}
              </v-chip>
              <v-spacer />
              <v-spacer />
              <b-language v-model="language" />
              <v-btn
                v-can="`update notification`"
                :to="`/message/notifications/${notificationInfo.id}/edit?edit=true&lang=${language}`"
                color="teal"
                outlined
              >
                Edit
              </v-btn>
            </v-card-title>
          </v-card>
        </v-flex>
        <v-flex xs12 md12>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h3 class="display-1">{{ notificationInfo.name }}</h3>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'NotificationSingle',
  data() {
    return {
      language: 'en',
      notificationInfo: {
        name: '',
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getNotification();
    },
  },
  mounted() {
    this.getNotification();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getNotification());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getNotification() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/message/notification/${this.$route.params.id}`
        );
        this.notificationInfo = data;
      } catch (e) {
        this.$router.replace('/message/notifications');
      }
    },
  },
};
</script>
