<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md4 lg4>
      <v-card class="elevation-2 pa-3">
        <v-form @submit="onSubmit">
          <v-card-text>
            <div class="layout column align-center">
              <h1 class="display-1 text-center mb-4 primary--text">
                Resend Email Confirmation Link
              </h1>
            </div>
            <v-text-field
              v-model="email"
              v-validate="'required|email'"
              :error-messages="errors.collect('email')"
              prepend-icon="mdi-email"
              data-vv-name="email"
              label="Email"
              type="email"
              required
            />
          </v-card-text>
          <v-card-actions>
            <vue-recaptcha
              ref="recaptcha"
              size="invisible"
              :sitekey="site_key"
              @verify="onCaptchaVerified"
              @expired="onCaptchaExpired"
            />
            <v-spacer />
            <v-btn
              :loading="loading"
              :disabled="errors.any()"
              color="primary"
              type="submit"
            >
              Resend
              <span slot="loader" class="custom-loader">
                <v-icon light> mdi-cached </v-icon>
              </span>
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import VueRecaptcha from 'vue-recaptcha';

export default {
  name: 'ResentEmail',
  components: { VueRecaptcha },
  data() {
    return {
      email: '',
      loading: false,
      site_key: process.env.GOOGLE_RECAPTCH_SITE_KEY,
    };
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.$validator.validateAll().then((res) => {
        if (res) {
          this.$refs.recaptcha.execute();
        }
        return false;
      });
    },
    // captch verified
    onCaptchaVerified() {
      this.$refs.recaptcha.reset();
      this.sendEmail();
    },
    // catch expired
    onCaptchaExpired() {
      this.$refs.recaptcha.reset();
    },
    // send verification token into email
    async sendEmail() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$get(
          `${process.env.API_URL}/email/resend?email=${this.email}`
        );
        this.loading = false;
        this.email = '';
        this.$router.replace('/auth/login');
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (err) {
        this.loading = false;
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
  },
  head() {
    return {
      script: [
        {
          src:
            'https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit',
          id: 'google-recaptch',
          hid: 'google-recaptch',
        },
      ],
    };
  },
  layout: 'auth',
  auth: false,
};
</script>
