<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="6" md="3">
      <v-card>
        <v-avatar size="150">
          <v-img src="/logo.png" alt="ToguMogu" />
        </v-avatar>
        <div class="py-10" />

        <validation-observer v-slot="{ handleSubmit }">
          <v-form @submit.prevent="handleSubmit(login)">
            <v-card-text>
              <b-email v-model="email" rules="required|email" label="Email" />

              <b-password
                v-model="password"
                rules="required|min:8"
                label="Password"
              />

              <p
                v-if="$store.state.settings.password_edit_enabled"
                class="text-right ma-0"
              >
                <nuxt-link
                  class="error--text text-capitalize"
                  to="/auth/forgot-password"
                >
                  Forgot Password?
                </nuxt-link>
              </p>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn :loading="loading" color="primary" type="submit">
                Login
              </v-btn>
            </v-card-actions>
          </v-form>
        </validation-observer>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { errorMessage } from '@/plugins/sweetalert';
import { activateVCan } from '@/plugins/can-directive';

export default {
  name: 'Login',
  layout: 'auth',
  auth: false,
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      show: false,
    };
  },
  methods: {
    async login() {
      this.loading = true;
      try {
        await this.$auth.loginWith('laravelSanctum', {
          data: {
            email: this.email,
            password: this.password,
          },
        });

        this.loading = false;

        const permissions =
          (this.$auth.loggedIn && this.$auth.user.permissions) || [];

        activateVCan(permissions);

        this.$store.commit('CRUD_SUCCESS_NO_ACTION', 'Successfully Logged In!');
        this.$router.push('/');
      } catch (err) {
        this.loading = false;

        if (err.response.data.is_email_confirmed === false) {
          errorMessage(err.response.data.message).then(() => {
            this.$router.push('/auth/resent-email');
          });
        } else if (err.response.status === 422) {
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
};
</script>
