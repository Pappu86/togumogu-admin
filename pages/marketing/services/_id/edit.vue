<template>
  <div id="serviceEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="service" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Service</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    text-color="white"
                    :color="service.status ? `success` : `primary`"
                  >
                    {{ service.status ? 'Published' : 'Saved' }}
                  </v-chip>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-text
                    v-model="service.title"
                    rules="required|min:3|max:100"
                    outlined
                    label="Title*"
                    counter="100"
                    @blur="checkSlug"
                  />
                  <b-text
                    v-model="service.slug"
                    rules="required"
                    outlined
                    label="Slug*"
                  />
                  <b-auto-complete
                    v-model="service.brand_id"
                    :items="brands"
                    item-text="name"
                    item-value="id"
                    outlined
                    label="Select brand*"
                    hide-details
                  />
                  <div class="pb-5 pb-3"></div>

                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-date-time
                        v-model="service.start_date"
                        outlined
                        label="Start date"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-date-time
                        v-model="service.end_date"
                        outlined
                        label="End date"
                        hide-details
                      />
                    </v-col>
                  </v-row>

                  <div class="pb-5 pb-3"></div>
                  <b-text
                    v-model="service.video_url"
                    outlined
                    label="Video url"
                  />
                  <v-row>
                    <v-col cols="12" sm="8">
                      <b-text
                        v-model="service.external_url"
                        outlined
                        label="External link"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <b-text
                        v-model="service.external_url_btn_text"
                        outlined
                        label="External link btn text"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                  <!-- Start customer service registration -->
                  <v-row>
                    <v-col cols="12" md="12" sm="12">
                      <v-card-subtitle class="pl-0 pr-0 pb-3">
                        <h4>
                          <v-checkbox
                            v-model="service.is_reg"
                            class="d-inline-flex"
                            label="Customer Registration"
                            hide-details
                          ></v-checkbox>
                        </h4>
                      </v-card-subtitle>
                      <v-divider />

                      <v-list class="horizontal">
                        <v-list-item class="horizontal-item pl-0">
                          <v-checkbox
                            v-model="service.is_customer_name"
                            label="Name required"
                            hide-details
                            :disabled="!service.is_reg"
                          ></v-checkbox>
                        </v-list-item>
                        <v-list-item class="horizontal-item pl-0">
                          <v-checkbox
                            v-model="service.is_customer_phone"
                            label="Phone required"
                            hide-details
                            :disabled="!service.is_reg"
                          ></v-checkbox>
                        </v-list-item>
                        <v-list-item class="horizontal-item pl-0">
                          <v-checkbox
                            v-model="service.is_customer_email"
                            label="Email required"
                            hide-details
                            :disabled="!service.is_reg"
                          ></v-checkbox>
                        </v-list-item>
                        <v-list-item class="horizontal-item pl-0">
                          <v-checkbox
                            v-model="service.is_child_name"
                            label="Child name required"
                            hide-details
                            :disabled="!service.is_reg"
                          ></v-checkbox>
                        </v-list-item>
                        <v-list-item class="horizontal-item pl-0">
                          <v-checkbox
                            v-model="service.is_child_age"
                            label="Child age required"
                            hide-details
                            :disabled="!service.is_reg"
                          ></v-checkbox>
                        </v-list-item>
                        <v-list-item class="horizontal-item pl-0">
                          <v-checkbox
                            v-model="service.is_child_gender"
                            label="Child gender required"
                            hide-details
                            :disabled="!service.is_reg"
                          ></v-checkbox>
                        </v-list-item>
                      </v-list>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="service.cta_btn_text"
                        outlined
                        label="Primary CTA button text"
                        hide-details
                      />
                    </v-col>

                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="service.reg_btn_text"
                        outlined
                        label="Submit button text"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                  <!-- End customer service registration -->

                  <!-- Start customer service payment -->
                  <v-row>
                    <v-col cols="12" md="12" sm="12">
                      <v-card-subtitle class="pl-0 pr-0 pb-3">
                        <h4>
                          <v-checkbox
                            v-model="service.is_payment"
                            label="Payment"
                            class="d-inline-flex"
                            hide-details
                          ></v-checkbox>
                        </h4>
                      </v-card-subtitle>
                      <v-divider class="mb-5" />

                      <v-row>
                        <v-col cols="12" sm="6">
                          <b-text
                            v-model="service.price"
                            rules="decimal"
                            outlined
                            label="Price"
                            hide-details
                            :disabled="!service.is_payment"
                          />
                        </v-col>
                        <v-col cols="12" sm="6">
                          <b-text
                            v-model="service.special_price"
                            rules="decimal"
                            outlined
                            label="Special price"
                            hide-details
                            :disabled="!service.is_payment"
                          />
                        </v-col>
                        <v-col cols="12" sm="6">
                          <b-date-time
                            v-model="service.special_price_start_date"
                            outlined
                            label="Special price start datetime"
                            hide-details
                            :disabled="!service.is_payment"
                          />
                        </v-col>
                        <v-col cols="12" sm="6">
                          <b-date-time
                            v-model="service.special_price_end_date"
                            outlined
                            label="Special price end datetime"
                            hide-details
                            :disabled="!service.is_payment"
                          />
                        </v-col>

                        <v-col cols="12" sm="12">
                          <b-text-area
                            v-model="service.special_price_message"
                            outlined
                            label="Special price message"
                            rows="3"
                            hide-details
                            :disabled="!service.is_payment"
                          />
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-autocomplete
                            v-model="service.payment_method"
                            :items="paymentMethodList"
                            auto-select-first
                            chips
                            clearable
                            deletable-chips
                            multiple
                            outlined
                            label="Payment methods"
                            hide-details
                            :disabled="!service.is_payment"
                          >
                          </v-autocomplete>
                        </v-col>

                        <v-col cols="12" sm="6">
                          <b-text
                            v-model="service.now_btn_text"
                            outlined
                            label="Now Button Text"
                            hide-details
                            :disabled="!service.is_payment"
                          />
                        </v-col>
                        <v-col cols="12" sm="6">
                          <b-text
                            v-model="service.later_btn_text"
                            outlined
                            label="Later Button Text"
                            hide-details
                            :disabled="!service.is_payment"
                          />
                        </v-col>
                        <v-col cols="12" sm="6">
                          <b-text
                            v-model="service.external_btn_text"
                            outlined
                            label="External Button Text"
                            hide-details
                            :disabled="!service.is_payment"
                          />
                        </v-col>

                        <v-col cols="12" sm="12">
                          <b-text
                            v-model="service.external_payment_url"
                            outlined
                            label="External payment link"
                            hide-details
                            :disabled="!service.is_payment"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <!-- End customer service registration -->

                  <!-- Start customer service Booking -->
                  <v-row>
                    <v-col cols="12" md="12" sm="12">
                      <v-card-subtitle class="pl-0 pr-0 pb-3">
                        <h4>
                          <v-checkbox
                            v-model="service.is_booking"
                            class="d-inline-flex"
                            label="Booking"
                            hide-details
                          ></v-checkbox>
                        </h4>
                      </v-card-subtitle>
                      <v-divider />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="service.booking_btn_text"
                        outlined
                        label="Booking Information Text"
                        hide-details
                        :disabled="!service.is_booking"
                      />
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="service.booking_type"
                        :items="bookingTypeList"
                        label="Booking Type"
                        outlined
                        hide-details
                        :disabled="!service.is_booking"
                      ></v-select>
                    </v-col>
                  </v-row>
                  <!-- End customer service registration -->

                  <!-- Start customer service additional Questions -->
                  <v-row>
                    <v-col cols="12" md="12" sm="12">
                      <v-card-subtitle class="pl-0 pr-0 pb-3">
                        <h4>
                          <v-checkbox
                            v-model="service.is_additional_qus"
                            class="d-inline-flex"
                            label="Additional Questions"
                            hide-details
                          ></v-checkbox>
                        </h4>
                      </v-card-subtitle>
                      <v-divider />
                    </v-col>
                    <v-col cols="12" sm="12">
                      <v-simple-table dense>
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left">Questions</th>
                              <th class="text-center" style="width: 165px">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(questionInfo, k) in service.questions"
                              :key="k"
                            >
                              <td class="pt-2 pb-2">
                                <b-text
                                  v-model="questionInfo.question"
                                  class="pt-3 pb-3"
                                  outlined
                                  label="Enter question"
                                  hide-details
                                  dense
                                  :disabled="!service.is_additional_qus"
                                />
                              </td>
                              <td class>
                                <v-btn
                                  class="decor"
                                  color="blue"
                                  :disabled="!service.is_additional_qus"
                                  @click.stop="addRow()"
                                >
                                  <v-icon>mdi-plus</v-icon>
                                </v-btn>
                                <v-btn
                                  class="decor"
                                  color="red"
                                  :disabled="!service.is_additional_qus"
                                  @click.stop="removeRow(k, questionInfo)"
                                >
                                  <v-icon>mdi-minus</v-icon>
                                </v-btn>
                              </td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                    </v-col>
                  </v-row>
                  <!-- End customer service registration -->

                  <div class="pb-5"></div>
                  <v-divider class="mb-5" />
                  <b-text-area
                    v-model="service.short_description"
                    rules="required|min:10"
                    outlined
                    label="Short Description*"
                    class="pt-2"
                  />
                  <v-subheader class="pa-0">Long Description*</v-subheader>
                  <b-rich-text-editor
                    v-model="service.long_description"
                    editor-id="serviceLongDescription"
                    class-name="mt-4"
                  />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Publish</h4>
                  <v-spacer />
                  <b-language v-model="language" />
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-checkbox
                    v-model="service.is_featured"
                    label="Is Featured?"
                    color="primary"
                    hide-details
                  />
                  <v-checkbox
                    v-model="service.is_promoted"
                    label="Is Promoted?"
                    color="primary"
                    hide-details
                  />
                </v-card-text>
                <v-card-actions class="justify-center pb-5 pt-5">
                  <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                  <v-btn
                    outlined
                    color="primary"
                    :disabled="isValidForm(invalid)"
                    @click="handleSubmit(onSubmit(0))"
                  >
                    Save
                  </v-btn>
                  <v-btn
                    id="publishBtn"
                    outlined
                    color="success"
                    :disabled="isValidForm(invalid)"
                    @click="handleSubmit(onSubmit(1))"
                  >
                    Publish
                  </v-btn>
                </v-card-actions>
              </v-card>

              <!-- Product tracker component -->
              <template v-if="!isReloadTrackerForm">
                <tracker-form
                  v-model="trackerData"
                  :options="trackerExistData"
                />
              </template>

              <v-card class="mb-4 pb-3">
                <v-card-title>
                  <h4>Category</h4>
                </v-card-title>
                <v-divider />
                <v-sheet class="pa-4 primary lighten-2">
                  <v-text-field
                    v-model="category"
                    label="Search Category"
                    dark
                    flat
                    solo-inverted
                    hide-details
                    clearable
                    clear-icon="mdi-close-circle-outline"
                  ></v-text-field>
                </v-sheet>
                <scrollbar style="height: 300px">
                  <v-treeview
                    v-model="service.categories"
                    :items="categories"
                    :search="category"
                    selectable
                    return-object
                  ></v-treeview>
                </scrollbar>
              </v-card>

              <v-card class="mb-4">
                <v-card-title>
                  <h4>Tag</h4>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-auto-complete
                    v-model="service.tags"
                    :items="tags"
                    item-text="name"
                    item-value="id"
                    outlined
                    return-object
                    multiple
                    label="Select Tag"
                    hide-details
                  />
                </v-card-text>
              </v-card>

              <v-card class="mb-4">
                <v-card-title>
                  <h4>Images</h4>
                </v-card-title>
                <v-divider />
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-subheader>Image*</v-subheader>
                    <v-btn
                      v-if="service.image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="service.image !== null">
                      <v-img :src="service.image" />
                      <v-card-actions class="justify-center">
                        <v-btn
                          color="teal"
                          outlined
                          @click.stop="openDialog('image')"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          color="pink"
                          outlined
                          @click="removeImage('image')"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-card-actions>
                    </template>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
    <v-dialog v-model="mediaDialog" scrollable max-width="90vw">
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
  name: 'ServiceEdit',
  components: {},
  data() {
    const defaultForm = Object.freeze({
      categories: [],
      tags: [],
      title: '',
      slug: '',
      short_description: '',
      long_description: '',
      created_at: null,
      status: 0,
      image: null,
      is_featured: false,
      is_promoted: false,
      video_url: null,
      external_payment_url: null,
      brand_id: null,
      is_reg: false,
      is_child_name: false,
      is_child_age: false,
      is_child_gender: false,
      is_customer_name: false,
      is_customer_email: false,
      is_customer_phone: false,
      is_booking: false,
      is_payment: false,
      is_additional_qus: false,
      payment_method: [],
    });

    return {
      language: 'en',
      service: Object.assign({}, defaultForm),
      dailog_type: 'image',
      mediaDialog: false,
      dateModal: false,
      timeModal: false,
      brands: [],
      category: '',
      categories: [],
      tags: [],
      loading: false,
      isValidForm(invalid) {
        const isValid = !!(this.service.long_description && this.service.image);
        return !(invalid || isValid);
        // return invalid;
      },
      invalidTrackerDate: false,
      trackerData: {},
      trackerExistData: {},
      isReloadTrackerForm: false,
      paymentMethodList: [
        { text: 'Now', value: 'now' },
        { text: 'Later', value: 'later' },
        { text: 'External', value: 'external' },
      ],
      bookingTypeList: [
        { text: 'Event', value: 'event' },
        { text: 'Consultancy', value: 'consultancy' },
        { text: 'Center Visit', value: 'center_visit' },
      ],
      questions: [{ id: 1, question: '', answer: '' }],
    };
  },
  watch: {
    language() {
      this.getService();
    },
    trackerData(newData, oldData) {
      if (newData) {
        this.invalidTrackerDate = newData.invalidTrackerDate;
        this.service.tracker_start_day = newData.startDays;
        this.service.tracker_end_day = newData.endDays;
        this.service.tracker_range = newData.trackerRange;
        this.service.tracker = newData.tracker;
      }
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([
      this.getTags(),
      this.getCategories(),
      this.getBrands(),
    ]).then(() => this.getService());

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getTags();
      this.getCategories();
      this.getBrands();
      this.getService();
    });
  },
  methods: {
    async getBrands() {
      try {
        const { data } = await this.$axios.$get(`${this.language}/brand/all`);
        this.brands = data;
      } catch (e) {}
    },
    openDialog(type) {
      this.dailog_type = type;
      this.mediaDialog = true;
    },
    removeImage(type) {
      this.dailog_type = null;
      switch (type) {
        case 'image':
          this.service.image = null;
          break;
      }
    },
    useThisFile(event) {
      switch (this.dailog_type) {
        case 'image':
          this.service.image = event.url;
          break;
      }
      this.mediaDialog = false;
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/service/service/slug/${encodeURIComponent(
            this.service.title
          )}`
        );

        this.service.slug = slug;
      } catch (e) {
        this.service.slug = null;
      }
    },
    async getTags() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/common/tag-all`
        );
        this.tags = data;
      } catch (e) {}
    },
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/brand/category-tree`
        );
        this.categories = data;
      } catch (e) {}
    },
    onSubmit(status) {
      this.service.status = status;
      this.publishService();
    },
    async publishService() {
      this.loading = true;
      const serviceData = this.service;

      try {
        const { message } = await this.$axios.$patch(
          `${this.language}/service/service/${this.service.id}`,
          serviceData
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/marketing/services',
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
    async getService() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/service/service/${this.$route.params.id}/edit`
        );
        this.service = Object.assign({}, data);

        // Get default questions when had no service questions
        const { questions } = this.service;
        if ((questions && questions.length === 0) || questions === null) {
          this.service.questions = this.questions;
        }

        // Set pregnency/baby tracker data
        this.tracker = data.tracker ? data.tracker : 'other';
        this.trackerExistData.range =
          data && data.tracker_range ? data.tracker_range : {};
        this.trackerExistData.tracker = this.tracker;
        if (data) {
          this.isReloadTrackerForm = true;
          setTimeout(() => {
            this.isReloadTrackerForm = false;
          });
        }
      } catch (e) {
        this.$router.replace('/service/services');
      }
    },

    addRow() {
      let max = 0;
      const questions = this.service.questions;
      if (questions.length > 0) {
        const ids = questions.map((qus) => {
          return qus.id;
        });
        max = Math.max(...ids);
      }

      this.service.questions.push({
        id: max + 1,
        question: '',
        answer: '',
      });
    },
    removeRow(index, question) {
      const idx = this.service.questions.indexOf(question);
      if (idx > 0) {
        this.service.questions.splice(idx, 1);
      }
    },
  },
};
</script>
