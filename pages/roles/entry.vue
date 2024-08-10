<template>
  <div id="roleEntry">
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
              <v-card>
                <v-card-text>
                  <b-text
                    v-model="role.name"
                    rules="required|min:3|alpha"
                    outlined
                    prepend-icon="mdi-rename-box"
                    label="Name"
                    :disabled="can_edit"
                  />
                  <b-text
                    v-model="role.label"
                    rules="required|min:3|alpha"
                    outlined
                    prepend-icon="mdi-label"
                    label="Label"
                  />

                  <b-checkbox
                    v-model="role.disable_login"
                    label="Disable login for this role ?"
                  />
                </v-card-text>
                <active-inactive v-model="role.status" />
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
export default {
  name: 'RoleEntry',
  data() {
    return {
      loading: false,
      role: {
        id: 0,
        name: '',
        label: '',
        disable_login: false,
        status: 'active',
      },
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.id ? 'Edit Role' : 'Create Role';
    },
    can_edit() {
      return !!this.$route.query.id;
    },
  },
  mounted() {
    if (this.$route.query.id) {
      this.getRole();
    }
  },
  methods: {
    onSubmit() {
      let url;
      let method;
      const roleId = this.$route.query.id;
      if (roleId) {
        url = `role/${roleId}`;
        method = 'PATCH';
        this.update(url, method);
      } else {
        url = `role`;
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
            data: this.role,
          })
        ).data;

        this.$store.dispatch('crud_success', {
          message,
          path: '/roles',
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
    // get role for edit
    async getRole() {
      try {
        const { data } = await this.$axios.$get(
          `role/${this.$route.query.id}/edit`
        );
        this.role = data;
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
