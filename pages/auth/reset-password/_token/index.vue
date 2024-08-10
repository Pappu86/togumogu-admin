<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md4 lg4>
      <v-card class="elevation-2 pa-3">
        <v-form @submit="onSubmit">
          <v-card-text>
            <div class="layout column align-center">
              <h1 class="display-1 text-center mb-4 primary--text">
                Reset Password
              </h1>
            </div>
            <v-text-field
              v-model="user.email"
              v-validate="'required|email'"
              :error-messages="errors.collect('email')"
              prepend-icon="mdi-email"
              data-vv-name="email"
              label="Email"
              type="email"
              required
            />
            <v-text-field
              ref="password"
              v-model="user.password"
              v-validate="'required|min:8'"
              :append-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
              :type="show ? 'text' : 'password'"
              :error-messages="errors.collect('password')"
              data-vv-name="password"
              prepend-icon="mdi-lock"
              label="Password"
              required
              @click:append="show = !show"
            />
            <v-text-field
              v-model="user.password_confirmation"
              v-validate="'required|confirmed:password'"
              :append-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
              :type="show ? 'text' : 'password'"
              :error-messages="errors.collect('password_confirmation')"
              data-vv-name="password_confirmation"
              data-vv-as="password confirmation"
              prepend-icon="mdi-lock"
              label="Confirm Password"
              required
              @click:append="show = !show"
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
              Reset Password
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
  name: 'ResetPassword',
  components: { VueRecaptcha },
  data() {
    return {
      user: {
        email: '',
        password: '',
        password_confirmation: '',
        token: this.$route.params.token || '',
      },
      loading: false,
      show: false,
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
      this.resetPassword();
    },
    // catch expired
    onCaptchaExpired() {
      this.$refs.recaptcha.reset();
    },
    // reset password
    async resetPassword() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$post(
          `${process.env.API_URL}/password/reset`,
          this.user
        );
        this.loading = false;
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
  middleware: ['can-reset-password'],
  auth: false,
};
</script>
