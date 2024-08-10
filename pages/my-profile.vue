<template>
  <div id="myProfile">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-if="user" class="my-2">
            <v-container grid-list-xl>
              <v-layout row wrap>
                <v-flex xs12 sm3 class="text-xs-center">
                  <v-hover v-if="user.avatar === null">
                    <v-avatar
                      slot-scope="{ hover }"
                      color="purple red--after"
                      size="150px"
                    >
                      <span class="white--text display-3">
                        {{ user.name | avatar }}
                      </span>
                      <v-expand-transition>
                        <div
                          v-if="hover"
                          class="d-flex teal darken-1 v-card--reveal transition-fast-in-fast-out"
                          style="height: 100%"
                        >
                          <v-btn
                            color="primary"
                            class="pa-0 ma-0 white--text"
                            block
                            large
                            @click="openFile"
                          >
                            Change Avatar
                          </v-btn>
                        </div>
                      </v-expand-transition>
                    </v-avatar>
                  </v-hover>
                  <v-hover v-else>
                    <v-avatar slot-scope="{ hover }" size="150px">
                      <v-img :src="user.avatar" :alt="user.name">
                        <v-expand-transition>
                          <div
                            v-if="hover"
                            class="d-flex teal darken-1 v-card--reveal--img transition-fast-in-fast-out"
                            style="height: 100%"
                          >
                            <v-btn
                              color="primary"
                              class="pa-0 ma-0 white--text"
                              block
                              large
                              @click="openFile"
                            >
                              Change Avatar
                            </v-btn>
                          </div>
                        </v-expand-transition>
                      </v-img>
                    </v-avatar>
                  </v-hover>
                  <input
                    ref="avatar"
                    type="file"
                    name="avatar"
                    style="display: none"
                    @change="updateAvatar"
                  />
                </v-flex>
                <v-flex xs12 sm9>
                  <v-form
                    data-vv-scope="info_form"
                    @submit.prevent="updateInfo('info_form')"
                  >
                    <div class="pos-r">
                      <v-subheader> General Information </v-subheader>
                      <v-divider />
                      <v-btn
                        fab
                        small
                        dark
                        icon
                        :class="readonly ? 'primary' : 'pink'"
                        bottom
                        right
                        absolute
                        @click="readonly = !readonly"
                      >
                        <v-icon>
                          mdi-{{ readonly ? 'pencil' : 'close-circle' }}
                        </v-icon>
                      </v-btn>
                    </div>

                    <v-container class="pa-2" grid-list-xl>
                      <v-layout row wrap>
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="user.name"
                            append-icon="mdi-account"
                            label="Name"
                            data-vv-name="name"
                            required
                            :readonly="readonly"
                          />

                          <!-- v-validate="'required'" -->
                          <!-- :error-messages="errors.collect('info_form.name')" -->
                        </v-flex>
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="user.email"
                            append-icon="mdi-email"
                            label="Email"
                            data-vv-name="email"
                            type="email"
                            required
                            :readonly="readonly"
                          />

                          <!-- v-validate="'required|email|unique_email'" -->
                          <!-- :error-messages="errors.collect('info_form.email')" -->
                        </v-flex>
                      </v-layout>
                    </v-container>
                    <v-container class="pa-2" grid-list-xl>
                      <v-layout row wrap>
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="user.mobile"
                            append-icon="mdi-phone"
                            label="Mobile"
                            data-vv-name="mobile"
                            :readonly="readonly"
                          />

                          <!-- v-validate="'mobile|unique_mobile'" -->
                          <!-- :error-messages="errors.collect('info_form.mobile')" -->
                        </v-flex>
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="user.address"
                            append-icon="mdi-map"
                            label="Address"
                            :readonly="readonly"
                          />
                        </v-flex>
                      </v-layout>
                    </v-container>
                    <v-card-actions v-if="!readonly">
                      <v-spacer />
                      <v-btn
                        :loading="loading"
                        :disabled="errors.any('info_form')"
                        color="primary"
                        type="submit"
                      >
                        Update
                      </v-btn>
                    </v-card-actions>
                  </v-form>
                  <div v-if="$store.state.settings.password_edit_enabled">
                    <v-form
                      data-vv-scope="password_form"
                      @submit.prevent="updatePassword('password_form')"
                    >
                      <div class="pos-r">
                        <v-subheader> Reset Password </v-subheader>
                        <v-divider />
                        <v-btn
                          fab
                          small
                          dark
                          icon
                          :class="password_readonly ? 'primary' : 'pink'"
                          bottom
                          right
                          absolute
                          @click="password_readonly = !password_readonly"
                        >
                          <v-icon>
                            mdi-{{
                              password_readonly ? 'pencil' : 'close-circle'
                            }}
                          </v-icon>
                        </v-btn>
                      </div>
                      <v-container class="pa-2" grid-list-xl>
                        <v-layout row wrap>
                          <v-flex xs12 sm6 md6>
                            <v-text-field
                              ref="password"
                              v-model="user.password"
                              :append-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
                              :type="show ? 'text' : 'password'"
                              data-vv-name="password"
                              prepend-icon="mdi-lock"
                              label="Password"
                              required
                              :readonly="password_readonly"
                              @click:append="show = !show"
                            />

                            <!-- v-validate="'required|min:8'" -->
                            <!-- 
                              :error-messages="
                                errors.collect('password_form.password')
                              " -->
                          </v-flex>
                          <v-flex xs12 sm6 md6>
                            <v-text-field
                              v-model="user.password_confirmation"
                              :append-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
                              :type="show ? 'text' : 'password'"
                              data-vv-name="password_confirmation"
                              data-vv-as="password confirmation"
                              prepend-icon="mdi-lock"
                              label="Confirm Password"
                              required
                              :readonly="password_readonly"
                              @click:append="show = !show"
                            />

                            <!-- v-validate="'required|confirmed:password'" -->
                            <!-- 
                              :error-messages="
                                errors.collect(
                                  'password_form.password_confirmation'
                                )
                              " -->
                          </v-flex>
                        </v-layout>
                      </v-container>
                      <v-card-actions v-if="!password_readonly">
                        <v-spacer />
                        <v-btn
                          :loading="password_updating"
                          :disabled="errors.any('password_form')"
                          color="primary"
                          type="submit"
                        >
                          Update
                        </v-btn>
                      </v-card-actions>
                    </v-form>
                  </div>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
// import { extend } from 'vee-validate';

export default {
  name: 'SingleUser',
  data() {
    return {
      user: {
        id: 0,
        name: '',
        email: '',
        mobile: '',
        address: '',
        avatar: null,
        password: '',
        password_confirmation: '',
      },
      loading: false,
      password_updating: false,
      show: false,
      readonly: true,
      reset_password_enabled: true,
      password_readonly: true,
    };
  },
  computed: {
    authUser() {
      return this.$auth.user;
    },
  },
  mounted() {
    // get user
    this.getUser();

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getUser());

    // const isUniqueEmail = (value) => {
    //   return this.$axios
    //     .$get(
    //       `${process.env.API_URL}/auth/check?user_id=${this.auth_user.id}&email=${value}`
    //     )
    //     .then((response) => {
    //       return {
    //         valid: response.valid,
    //         data: {
    //           message: response.message,
    //         },
    //       };
    //     });
    // };

    // const isUniqueMobile = (value) => {
    //   return this.$axios
    //     .$get(
    //       `${process.env.API_URL}/auth/check?user_id=${this.auth_user.id}&mobile=${value}`
    //     )
    //     .then((response) => {
    //       return {
    //         valid: response.valid,
    //         data: {
    //           message: response.message,
    //         },
    //       };
    //     });
    // };
    // extend('unique_email', {
    //   validate: isUniqueEmail,
    //   getMessage: (field, params, data) => {
    //     return data.message;
    //   }
    // });

    // extend('unique_mobile', {
    //   validate: isUniqueMobile,
    //   getMessage: (field, params, data) => {
    //     return data.message;
    //   }
    // });
  },
  beforeDestroy() {
    // window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getUser() {
      try {
        const { data } = await this.$axios.$get(
          `${process.env.API_URL}/user/${this.authUser.id}`
        );
        this.user = data;
        this.user.password = '';
        this.user.password_confirmation = '';
      } catch (e) {
        this.$router.push('/');
      }
    },
    openFile() {
      this.$refs.avatar.click();
    },
    async updateAvatar(e) {
      const files = e.target.files || e.dataTransfer.files;
      if (!files.length) {
        return;
      }
      const formData = new FormData();
      formData.append('avatar', files[0]);
      this.loading = true;
      try {
        const { message, user } = await this.$axios.$post(
          `${process.env.API_URL}/update-user-avatar/${this.authUser.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        this.loading = false;
        // update user
        this.user = user;
        // fetch user
        await this.$auth.fetchUser();
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
    updateInfo(scope) {
      this.$validator.validateAll(scope).then((res) => {
        if (res) {
          this.updateInformation();
        }
        return false;
      });
    },
    updatePassword(scope) {
      this.$validator.validateAll(scope).then((res) => {
        if (res) {
          this.updateUserPassword();
        }
        return false;
      });
    },
    // update info into server
    async updateInformation() {
      this.loading = true;
      try {
        const { message, user } = await this.$axios.$patch(
          `${process.env.API_URL}/update-user-info/${this.authUser.id}`,
          this.user
        );
        this.loading = false;
        this.readonly = true;

        // update user
        this.user = user;
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
    // update password into server
    async updateUserPassword() {
      this.password_updating = true;
      try {
        const { message, user } = await this.$axios.$patch(
          `${process.env.API_URL}/update-user-password/${this.authUser.id}`,
          this.user
        );
        this.password_updating = false;
        this.password_readonly = true;
        // update user
        this.user = user;

        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
        this.errors.clear('password_form');
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
};
</script>
