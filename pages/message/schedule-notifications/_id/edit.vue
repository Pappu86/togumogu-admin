<template>
  <div id="scheduleNotificationEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="notification" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <!-- Start edit left section-->
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Notification</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    class="white--text"
                    :color="
                      notification.status === 'active' ? 'success' : 'warning'
                    "
                  >
                    {{ notification.status }}
                  </v-chip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-sheet elevation="0" tag="section" class="pa-2 mb-5 pb-5">
                    <b-text
                      v-model="notification.name"
                      rules="required|min:3"
                      outlined
                      label="Name"
                      dense
                    />
                    <v-select
                      v-model="notification.template_id"
                      :items="templates"
                      :rules="fieldsRules.template"
                      label="Template"
                      outlined
                      hide-details="auto"
                      class="mb-5"
                      dense
                    ></v-select>

                    <v-row>
                      <v-col cols="12">
                        <v-select
                          v-model="notification.activity"
                          :items="activitiesList"
                          :rules="fieldsRules.activity"
                          label="Activity"
                          outlined
                          dense
                          hide-details="auto"
                          class="mb-2 mt-3"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-select
                          v-model="notification.period"
                          :items="periodList(notification.activity)"
                          :rules="fieldsRules.period"
                          label="Period"
                          outlined
                          hide-details="auto"
                          class="mb-5"
                          dense
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <b-text
                          v-model="notification.days"
                          rules="numeric"
                          outlined
                          label="How many days Later"
                          dense
                        />
                      </v-col>
                    </v-row>
                  </v-sheet>
                </v-card-text>
              </v-card>
            </v-col>
            <!-- End edit left section-->
            <!-- Start edit right section-->
            <v-col cols="12" sm="4">
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Publish</h4>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-select
                    v-model="notificationType"
                    :items="typeList"
                    label="Type"
                    outlined
                    dense
                    hide-details="auto"
                    class="mb-5 mt-3"
                    @change="onChangeType"
                  ></v-select>
                  <v-card-actions class="justify-center">
                    <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                    <v-btn
                      outlined
                      color="primary"
                      :disabled="isFormDisabled(invalid)"
                      @click="handleSubmit(onSubmit('inactive'))"
                    >
                      Save
                    </v-btn>
                    <v-btn
                      id="publishBtn"
                      outlined
                      color="success"
                      :disabled="isFormDisabled(invalid)"
                      @click="handleSubmit(onSubmit('active'))"
                    >
                      Publish
                    </v-btn>
                  </v-card-actions>
                </v-card-text>
              </v-card>
            </v-col>
            <!-- End edit right section-->
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
  </div>
</template>

<script>
export default {
  name: 'NotificationEdit',
  data() {
    const defaultForm = Object.freeze({
      name: '',
      status: 'draft',
      template_id: '',
      process_status: 'draft',
    });

    return {
      language: 'en',
      notification: Object.assign({}, defaultForm),
      dialog: false,
      notificationType: '',
      templates: [],
      allTemplates: [],
      typeList: [
        { text: 'SMS', value: 'sms' },
        { text: 'Email', value: 'email' },
        { text: 'Push Notification', value: 'push_notification' },
        { text: 'Database', value: 'database' },
        { text: 'Pop-Up', value: 'pop_up' },
      ],
      periodList(activity) {
        const beforeObj = { text: 'Before', value: 'before' };
        const afterObj = { text: 'After', value: 'after' };
        const forBefore = ['child_birthday', 'user_birthday'];
        const forAfter = [
          'registration',
          'inactive_customer',
          'last_order',
          'child_dob',
        ];
        if (forBefore.includes(activity)) return [beforeObj];
        else if (forAfter.includes(activity)) return [afterObj];
        else return [beforeObj, afterObj];
      },
      loading: false,
      activitiesList: [
        { text: 'Registration', value: 'registration' },
        { text: 'Child Birthday', value: 'child_birthday' },
        { text: 'Child DOB', value: 'child_dob' },
        { text: 'EDD', value: 'edd' },
        { text: 'User Birthday', value: 'user_birthday' },
        { text: 'Inactive Customer', value: 'inactive_customer' },
        { text: 'Last Order', value: 'last_order' },
      ],
      fieldsRules: {
        template: [(val) => !!val || 'This field is required'],
        activity: [(val) => !!val || 'This field is required'],
        period: [(val) => !!val || 'This field is required'],
      },
      isFormDisabled(invalid) {
        return invalid || !this.notification.template_id;
      },
    };
  },
  computed: {
    loggedIn() {
      return this.$auth.loggedIn;
    },
    user() {
      return this.$auth.user;
    },
  },
  watch: {
    language() {
      // this.getCompany();
    },
    notificationType(newVal, oldVal) {
      if (newVal && newVal !== oldVal && this.allTemplates.length) {
        this.templates = [];
        this.allTemplates.forEach((template) => {
          if (template && template.type === newVal) {
            this.templates.push({ text: template.name, value: template.id });
          }
        });
      }
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([this.getTemplates()]).then(() => {
      this.getNotification();
    });

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getTemplates();
      this.getNotification();
    });
  },
  methods: {
    onSubmit(status) {
      this.notification.status = status;
      this.publishNotification();
    },
    async publishNotification() {
      const instance = this;
      instance.loading = true;
      instance.notification.type = instance.notificationType;
      try {
        const notificationData = instance.notification;
        const { message } = await this.$axios.$patch(
          `${this.language}/message/notification/${this.$route.params.id}`,
          notificationData
        );

        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/message/schedule-notifications',
        });
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
    // get payment_method for edit
    async getNotification() {
      const instance = this;
      try {
        const { data } = await instance.$axios.$get(
          `${instance.language}/message/notification/${instance.$route.params.id}/edit`
        );
        instance.notification = Object.assign({}, data);
        instance.notificationType = (data && data.type) || null;
      } catch (e) {
        instance.$router.replace('/message/notifications');
      }
    },
    async getTemplates() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/message/template/all`
        );
        this.allTemplates = data;
      } catch (e) {}
    },
    onChangeType() {
      this.notification.template_id = null;
    },
  },
};
</script>
