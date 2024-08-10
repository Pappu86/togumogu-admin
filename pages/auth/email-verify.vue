<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md4 lg4>
      <v-card class="elevation-2 pa-3">
        <v-card-text>
          <div class="layout column align-center">
            <h1 class="display-1 text-center mb-4 primary--text">
              Email Confirmation
            </h1>
          </div>
          <template v-if="success">
            <v-alert :value="true" type="success">
              {{ message }}
            </v-alert>
            <v-btn nuxt to="/auth/login" block class="primary"> Log In </v-btn>
          </template>
          <template v-else>
            <v-alert :value="true" type="error">
              {{ message }}
            </v-alert>
            <v-btn nuxt to="/auth/resent-email" block class="primary">
              Resent Confirmation Link
            </v-btn>
          </template>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'ConfirmEmail',
  layout: 'auth',
  auth: false,
  async asyncData({ app, query }) {
    try {
      const data = await app.$axios.$get(query.queryURL);
      return {
        message: data.message,
        status: data.status,
        success: true,
        error: false,
      };
    } catch (e) {
      return {
        message: e.response.data.message,
        status: e.response.status,
        success: false,
        error: true,
      };
    }
  },
};
</script>
