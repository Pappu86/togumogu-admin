<template>
  <div id="userEntry">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <h4>{{ formTitle }}</h4>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <validation-observer v-slot="{ handleSubmit, invalid, reset }">
            <v-form
              @submit.prevent="handleSubmit(onSubmit)"
              @reset.prevent="reset"
            >
              <div style="height: 0; overflow: hidden">
                <input type="text" name="username" />
                <input type="password" name="password" />
              </div>
              <v-card>
                <v-container grid-list-xl>
                  <b-text
                    v-model="user.name"
                    rules="required|min:3"
                    outlined
                    prepend-icon="mdi-account"
                    label="Name"
                  />
                </v-container>
                <v-container grid-list-xl>
                  <v-row>
                    <v-col cols="12" md="6">
                      <b-text
                        v-model="user.email"
                        rules="required|email"
                        outlined
                        prepend-icon="mdi-email"
                        label="Email"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <b-text
                        v-model="user.mobile"
                        rules="mobile"
                        outlined
                        prepend-icon="mdi-phone"
                        label="Mobile"
                      />
                    </v-col>
                  </v-row>
                </v-container>
                <v-container grid-list-xl>
                  <v-row>
                    <v-col cols="12" md="6">
                      <b-password
                        v-if="passwordRequired"
                        v-model="user.password"
                        rules="min:8"
                        label="Password"
                        outlined
                      />
                      <b-password
                        v-else
                        v-model="user.password"
                        rules="required|min:8"
                        label="Password"
                        outlined
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <b-auto-complete
                        v-model="user.role"
                        :items="roles"
                        rules="required"
                        prepend-icon="mdi-lock"
                        outlined
                        label="Select Role"
                        item-text="label"
                        item-value="name"
                      />
                    </v-col>
                  </v-row>
                </v-container>
                <v-container class="py-0">
                  <b-checkbox
                    v-model="user.email_verified_at"
                    label="Mark email as verified"
                  />
                </v-container>
                <active-inactive v-model="user.status" />
                <action-button
                  :loading="loading"
                  :error="invalid"
                  :title="formTitle"
                />
              </v-card>
            </v-form>
          </validation-observer>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import BPassword from '@/components/forms/BPassword';

export default {
  name: 'UserEntry',
  components: { BPassword },
  data() {
    return {
      show: false,
      loading: false,
      user: {
        id: 0,
        name: '',
        title: null,
        email: '',
        password: '',
        mobile: '',
        address: '',
        email_verified_at: true,
        role: '',
        status: 'active',
      },
      roles: [],
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.id ? 'Edit User' : 'Create User';
    },
    passwordRequired() {
      return !!this.$route.query.id;
    },
  },
  mounted() {
    this.getRoles();
  },
  methods: {
    // get roles
    async getRoles() {
      try {
        const data = await this.$axios.$get(`role-all`);
        this.roles = data;
        // get user if user is edit mode
        const UserId = this.$route.query.id;
        if (UserId && this.roles.length > 0) {
          const { data } = await this.$axios.$get(`user/${UserId}/edit`);

          this.user = data;
        }
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    onSubmit() {
      let url;
      let method;
      const userId = this.$route.query.id;
      if (userId) {
        url = `user/${userId}`;
        method = 'PATCH';
        this.update(url, method);
      } else {
        url = `user`;
        method = 'POST';
        this.update(url, method);
      }
    },
    async update(url, method) {
      try {
        const { message } = (
          await this.$axios({
            url,
            method,
            data: this.user,
          })
        ).data;

        this.$store.dispatch('crud_success', {
          message,
          path: '/users',
        });
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
  },
};
</script>
