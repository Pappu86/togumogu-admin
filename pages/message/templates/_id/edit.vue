<template>
  <div id="templateEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="template" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <!-- Start edit left section-->
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Template</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    class="white--text"
                    :color="
                      template.status === 'active' ? 'success' : 'warning'
                    "
                  >
                    {{ template.status }}
                  </v-chip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-sheet elevation="0" tag="section" class="pa-2 mb-5 pb-5">
                    <b-text
                      v-model="template.name"
                      rules="required|min:3"
                      outlined
                      label="name"
                      dense
                    />
                    <b-text
                      v-model="template.subject"
                      rules="required|min:5"
                      outlined
                      label="Subject"
                      dense
                    />

                    <b-text-area
                      v-if="template.type !== 'email'"
                      v-model="template.content"
                      rules="required|min:10"
                      outlined
                      name="templateContent"
                      label="Content"
                      counter="100"
                    />
                    <template v-else="">
                      <v-subheader>Content</v-subheader>
                      <b-rich-text-editor
                        v-model="template.content"
                        editor-id="template-content"
                        class-name="mt-4"
                      />
                    </template>

                    <template v-if="template.type === 'push_notification'">
                      <v-row>
                        <v-col cols="12" md="12" sm="12">
                          <h4 class="my-5 mb-3">Additional Options</h4>
                          <v-divider class="mb-5" />
                          <b-text
                            v-model="template.ad_channel_name"
                            outlined
                            label="Android Notification Channel"
                            dense
                            hide-details
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" md="12" sm="12">
                          <v-card-subtitle class="pa-0 py-0 pb-3">
                            <h4>Custom data</h4>
                          </v-card-subtitle>
                          <v-divider />
                        </v-col>
                      </v-row>
                      <v-simple-table dense class="mb-5 pb-3">
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left">Key</th>
                              <th class="text-left">Value</th>
                              <th class="text-center" style="width: 165px">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(customData, k) in adionalCustomDataList"
                              :key="k"
                            >
                              <td class="pt-3 pb-3">
                                <b-text
                                  v-model="customData.key"
                                  outlined
                                  label="Key"
                                  hide-details
                                  dense
                                />
                              </td>
                              <td class="pt-3 pb-3">
                                <b-text
                                  v-model="customData.value"
                                  outlined
                                  label="Value"
                                  hide-details
                                  dense
                                />
                              </td>
                              <td class="pt-3 pb-3">
                                <v-btn
                                  class="decor"
                                  color="blue"
                                  @click.stop="addRow()"
                                >
                                  <v-icon>mdi-plus</v-icon>
                                </v-btn>
                                <v-btn
                                  class="decor"
                                  color="red"
                                  @click.stop="removeRow(k, customData)"
                                >
                                  <v-icon>mdi-minus</v-icon>
                                </v-btn>
                              </td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                      <v-row>
                        <v-col cols="12" sm="3">
                          <v-select
                            v-model="template.ad_sound"
                            :items="enabledItems"
                            label="Sound"
                            outlined
                            hide-details
                            dense
                          ></v-select>
                        </v-col>
                        <v-col cols="12" sm="3">
                          <v-select
                            v-model="template.ad_apple_badge"
                            :items="enabledItems"
                            label="Apple badge"
                            outlined
                            hide-details
                            dense
                          ></v-select>
                        </v-col>

                        <v-col cols="12" sm="3">
                          <v-select
                            v-model="expireValue"
                            :items="expireValues"
                            label="Expires value"
                            outlined
                            hide-details
                            dense
                          ></v-select>
                        </v-col>
                        <v-col cols="12" sm="3">
                          <v-select
                            v-model="expireUnit"
                            :items="expireUnits"
                            label="Expires unit"
                            outlined
                            hide-details
                            dense
                          ></v-select>
                        </v-col>
                        <v-col
                          v-if="template.ad_apple_badge === 'enabled'"
                          cols="12"
                        >
                          <b-text
                            v-model="template.ad_apple_badge_count"
                            rules="numeric"
                            outlined
                            label="Apple badge count"
                            hide-details
                            dense
                          />
                        </v-col>
                      </v-row>
                    </template>
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
                    v-model="template.category"
                    :items="categoryList"
                    label="Category"
                    outlined
                    dense
                    hide-details="auto"
                    class="mb-5 mt-3"
                  ></v-select>
                  <v-select
                    v-model="template.type"
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
                      :disabled="invalid"
                      @click="handleSubmit(onSubmit('inactive'))"
                    >
                      Save
                    </v-btn>
                    <v-btn
                      id="publishBtn"
                      outlined
                      color="success"
                      :disabled="invalid"
                      @click="handleSubmit(onSubmit('active'))"
                    >
                      Publish
                    </v-btn>
                  </v-card-actions>
                </v-card-text>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Available Variables</h4>
                </v-card-title>
                <v-divider />
                <div class="text-center">
                  <v-tabs v-model="tab">
                    <v-tab v-for="item in items" :key="item.tab">
                      {{ item.tab }}
                    </v-tab>
                  </v-tabs>

                  <v-tabs-items v-model="tab">
                    <v-tab-item v-for="item in items" :key="item.tab">
                      <v-card flat>
                        <v-card-text>
                          <span
                            v-for="variable in item.variables"
                            :key="variable"
                            class="mr-2 user-select-all"
                            >{{ variable }}</span
                          >
                        </v-card-text>
                      </v-card>
                    </v-tab-item>
                  </v-tabs-items>
                </div>
              </v-card>
              <v-card v-if="template.type === 'push_notification'" class="mb-4">
                <v-card-title>
                  <h4>Image</h4>
                </v-card-title>
                <v-divider />
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-btn
                      v-if="template.image === null"
                      color="primary"
                      class="mx-4 my-4"
                      outlined
                      large
                      @click.stop="openDialog()"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-else-if="template.image">
                      <div class="py-4 px-4">
                        <v-img :src="template.image" />
                      </div>
                      <v-card-actions class="justify-center">
                        <v-btn color="teal" outlined @click.stop="openDialog()">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn color="pink" outlined @click="removeImage()">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-card-actions>
                    </template>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
            <!-- End edit right section-->
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
    <v-dialog v-model="mediaDialog" scrollable max-width="95vw">
      <v-card id="mediaDialog">
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Upload Files</span>
          <v-btn icon dark class="ma-0" @click.stop="mediaDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <media-library @use="useThisFile" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'TemplateEdit',
  components: {},
  data() {
    const defaultForm = Object.freeze({
      name: '',
      subject: '',
      content: '',
      main_template_id: '',
      type: '',
      status: 'inactive',
      image: null,
      ad_custom_data: null,
      ad_sound: 'enabled',
      ad_apple_badge: 'disabled',
      ad_apple_badge_count: 0,
    });

    return {
      language: 'en',
      mediaDialog: false,
      template: Object.assign({}, defaultForm),
      loading: false,
      typeList: [
        { text: 'SMS', value: 'sms' },
        { text: 'Email', value: 'email' },
        { text: 'Database', value: 'database' },
        { text: 'Push Notification', value: 'push_notification' },
      ],
      categoryList: [
        { text: 'Customer', value: 'customer' },
        { text: 'Order', value: 'order' },
        { text: 'Book Fair', value: 'book_fair' },
      ],
      enabledItems: [
        { text: 'Enabled', value: 'enabled' },
        { text: 'Disabled', value: 'disabled' },
      ],
      adionalCustomDataList: [{ key: '', value: '' }],
      expireValue: 1,
      expireValues: [0, 1, 2, 3, 4, 5, 6, 7],
      expireUnit: 'days',
      expireUnits: [
        { text: 'Weeks', value: 'weeks' },
        { text: 'Days', value: 'days' },
        { text: 'Hours', value: 'hours' },
        { text: 'Minutes', value: 'minutes' },
      ],
      tab: null,
      items: [
        {
          tab: 'All',
          variables: [
            '{{customer_name}}',
            '{{customer_dob}}',
            '{{child_name}}',
            '{{child_dob}}',
            '{{child_age}}',
            '{{child_gender}}',
          ],
        },
        {
          tab: 'Customer',
          variables: ['{{customer_name}}', '{{customer_dob}}'],
        },
        {
          tab: 'Child',
          variables: [
            '{{child_name}}',
            '{{child_dob}}',
            '{{child_age}}',
            '{{child_gender}}',
          ],
        },
      ],
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
      this.getTemplate();
    },
    expireUnit(newVal, oldVal) {
      if (newVal !== oldVal) {
        let itemsLength = 8;
        const items = [];

        if (newVal === 'weeks') itemsLength = 5;
        else if (newVal === 'hours') itemsLength = 25;
        else if (newVal === 'minutes') itemsLength = 61;

        for (let i = 0; i < itemsLength; i++) {
          items.push(i);
        }
        this.expireValues = items;
      }
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([]).then(() => {
      this.getTemplate();
    });

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getTemplate();
    });
  },
  methods: {
    onSubmit(status) {
      this.template.status = status;
      this.publishTemplate();
    },
    async publishTemplate() {
      const instance = this;
      instance.loading = true;
      try {
        const templateData = instance.template;

        templateData.ad_expire_value = this.expireValue;
        templateData.ad_expire_unit = this.expireUnit;
        templateData.ad_custom_data = this.adionalCustomDataList;

        const { message } = await this.$axios.$patch(
          `${this.language}/message/template/${this.$route.params.id}`,
          templateData
        );

        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/message/templates',
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
    async getTemplate() {
      const instance = this;
      try {
        const { data } = await instance.$axios.$get(
          `${instance.language}/message/template/${instance.$route.params.id}/edit`
        );
        instance.template = Object.assign({}, data);
        this.expireValue = (data && data.ad_expire_value) || 1;
        this.expireUnit = (data && data.ad_expire_unit) || 'days';
        this.adionalCustomDataList =
          (data && JSON.parse(data.ad_custom_data)) ||
          this.adionalCustomDataList;
      } catch (e) {
        instance.$router.replace('/message/templates');
      }
    },
    // open image select dialog
    openDialog() {
      this.mediaDialog = true;
    },
    // update template image property
    useThisFile(event) {
      this.template.image = event.url;
      this.mediaDialog = false;
    },
    // remove template image property
    removeImage() {
      this.template.image = null;
    },
    addRow() {
      this.adionalCustomDataList.push({
        key: '',
        value: '',
      });
    },
    removeRow(index, item) {
      const idx = this.adionalCustomDataList.indexOf(item);
      if (idx > 0) {
        this.adionalCustomDataList.splice(idx, 1);
      }
    },
  },
};
</script>
