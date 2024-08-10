<template>
  <div id="notificationEntry">
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
                      label="Template"
                      outlined
                      hide-details="auto"
                      class="mb-5"
                      dense
                    ></v-select>
                    <div class="mb-5">
                      <h3 class="mb-3">Target</h3>
                      <v-divider class="mb-2"></v-divider>
                      <TargetComponent
                        v-model="targetQuery"
                        :targets-list="targetQuery"
                      ></TargetComponent>
                      <div class="v-text-field__details">
                        <div
                          class="v-messages theme--light error--text ml-4"
                          role="alert"
                        >
                          <template v-if="isInvalidForm(false)">
                            <div class="v-messages__wrapper">
                              <div class="v-messages__message">
                                Not support duplicate key. Please remove
                                duplicate key!
                              </div>
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                    <template v-if="notificationType === 'push_notification'">
                      <v-row>
                        <v-col cols="12" sm="4" md="4">
                          <v-checkbox
                            v-model="notification.is_android"
                            label="Android"
                            class="mt-0"
                          ></v-checkbox>
                        </v-col>
                        <v-col cols="12" sm="4" md="4">
                          <v-checkbox
                            v-model="notification.is_ios"
                            label="IOS"
                            class="mt-0"
                          ></v-checkbox>
                        </v-col>
                      </v-row>
                    </template>

                    <div class="mb-5 pt-3">
                      <h3 class="mb-3">Scheduling</h3>
                      <v-divider class="mb-2"></v-divider>
                      <v-row class="mb-5 pt-4">
                        <v-col cols="12" sm="6" md="6">
                          <v-select
                            v-model="notification.scheduling_type"
                            :items="scheduleTypes"
                            label="Send to eligible users"
                            outlined
                            hide-details="auto"
                            dense
                          ></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <b-date-time
                            v-if="notification.scheduling_type === 'scheduled'"
                            v-model="notification.scheduling_date"
                            label="Date"
                            :min-date="scheduleMinDate"
                            outlined
                            dense
                          />
                        </v-col>
                      </v-row>
                    </div>
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
                  <v-spacer />
                  <b-language v-model="language" />
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
                  ></v-select>
                  <v-card-actions class="justify-center">
                    <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                    <v-btn
                      outlined
                      color="primary"
                      :disabled="isInvalidForm(invalid)"
                      @click="handleSubmit(onSubmit('inactive'))"
                    >
                      Save
                    </v-btn>
                    <v-btn
                      id="publishBtn"
                      outlined
                      color="success"
                      :disabled="isInvalidForm(invalid)"
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
import TargetComponent from '@/pages/message/notifications/target-component';

export default {
  name: 'NotificationEdit',
  components: {
    // eslint-disable-next-line vue/no-unused-components
    TargetComponent,
  },
  data() {
    const defaultForm = Object.freeze({
      name: '',
      flatform: '',
      status: 'draft',
      template_id: '',
      process_status: 'draft',
      is_android: 0,
      is_ios: 0,
      scheduling_type: 'now',
      scheduling_date: null,
    });

    return {
      language: 'en',
      notification: Object.assign({}, defaultForm),
      dailog_type: 'image',
      dialog: false,
      notificationType: '',
      templates: [],
      allTemplates: [],
      typeList: [
        { text: 'SMS', value: 'sms' },
        { text: 'Email', value: 'email' },
        { text: 'Push Notification', value: 'push_notification' },
      ],
      loading: false,
      scheduleMinDate: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
      scheduleTypes: [
        { text: 'Now', value: 'now' },
        { text: 'Schedule', value: 'scheduled' },
        { text: 'Daily', value: 'daily' },
      ],
      targetQuery: [{ key: '', condition: '', value: '' }],
      isInvalidForm(invalid) {
        const list = [];
        let is = false;
        this.targetQuery.forEach((data) => {
          if (!is) {
            const has = list.includes(data.key);
            if (has) {
              this.$store.commit(
                'APP_GENERAL_ERROR',
                'Not support duplicate key!'
              );
              is = has;
            }
            list.push(data.key);
          }
        });

        return invalid || is;
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
        notificationData.target = instance.targetQuery;
        const { message } = await this.$axios.$patch(
          `${this.language}/message/notification/${this.$route.params.id}`,
          notificationData
        );

        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/message/notifications',
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
        instance.targetQuery =
          (data && JSON.parse(data.target)) || this.targetQuery;
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
  },
};
</script>
