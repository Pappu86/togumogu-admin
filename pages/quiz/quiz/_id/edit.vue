<template>
  <div id="productEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="quiz" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Quiz</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    class="white--text"
                    :color="quiz.status === 'active' ? 'success' : 'warning'"
                  >
                    {{ quiz.status }}
                  </v-chip>
                </v-card-title>

                <v-divider></v-divider>
                <v-card-text>
                  <v-sheet elevation="2" tag="section" class="pa-2 mb-4">
                    <div>
                      <b-text
                        v-model="quiz.title"
                        rules="required|min:5|max:150"
                        outlined
                        label="Title"
                        counter="150"
                        dense
                        @blur="checkSlug"
                      />
                    </div>
                    <div>
                      <b-text
                        v-model="quiz.slug"
                        rules="required"
                        outlined
                        label="Slug"
                        dense
                      />
                    </div>
                    <div>
                      <b-text
                        v-model="quiz.sub_title"
                        rules="required|min:5|max:150"
                        outlined
                        label="Subtitle"
                        counter="150"
                        dense
                      />
                    </div>
                  </v-sheet>
                  <v-sheet elevation="2" tag="section" class="pa-2 mb-4">
                    <v-row>
                      <v-col md="6" class="p-0 mt-2">
                        <b-date-time
                          v-model="quiz.start_date"
                          rules="required"
                          label="Start Date"
                          outlined
                          dense
                          hint="From when the quiz will be valid. Please enter a valid date"
                        />
                      </v-col>
                      <v-col md="6" class="p-0 mt-2">
                        <b-date-time
                          v-model="quiz.end_date"
                          rules="required"
                          outlined
                          dense
                          label="End Date"
                          hint="Quiz will not be valid after end date. Please enter a valid date"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-0">
                      <v-col md="6" class="py-0">
                        <b-text
                          v-model="quiz.max_time"
                          rules="decimal:2"
                          outlined
                          dense
                          label="Max time (seconds)"
                        />
                      </v-col>
                      <v-col md="6" class="py-0">
                        <v-dialog
                          ref="dialog"
                          v-model="dialog"
                          :return-value.sync="color"
                          persistent
                          width="300"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="color"
                              label="Color"
                              outlined
                              readonly
                              dense
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-card>
                            <v-color-picker v-model="color" show-swatches />
                            <v-card-actions>
                              <v-spacer />
                              <v-btn text @click="dialog = false">Cancel</v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click="$refs.dialog.save(color)"
                                >OK</v-btn
                              >
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                      </v-col>
                    </v-row>
                  </v-sheet>
                  <v-sheet elevation="2" tag="section" class="pa-2 mb-4">
                    <div>
                      <b-text
                        v-model="quiz.dynamic_link"
                        outlined
                        dense
                        label="Dynamic Link"
                      />
                    </div>
                    <div>
                      <v-autocomplete
                        v-model="selectedArea"
                        :items="areaList"
                        auto-select-first
                        chips
                        clearable
                        deletable-chips
                        multiple
                        dense
                        outlined
                        label="Area"
                        hint="This quiz will be valid across allowed area."
                      ></v-autocomplete>
                    </div>
                    <div>
                      <v-select
                        v-model="selectedPlatforms"
                        :items="platforms"
                        outlined
                        label="Valid on"
                        hint="This quiz will be valid across allowed platforms."
                        multiple
                        chips
                        dense
                      >
                        <template v-slot:prepend-item>
                          <v-list-item ripple @click="toggle('valid-on')">
                            <v-list-item-action>
                              <v-icon
                                :color="
                                  selectedPlatforms.length > 0
                                    ? 'indigo darken-4'
                                    : ''
                                "
                                >{{ checkIconForMultiSelect }}</v-icon
                              >
                            </v-list-item-action>
                            <v-list-item-content>
                              <v-list-item-title>Select All</v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                          <v-divider class="mt-2"></v-divider>
                        </template>
                      </v-select>
                    </div>
                  </v-sheet>
                  <v-sheet elevation="2" tag="section" class="pa-2 mb-4">
                    <div>
                      <b-text
                        v-model="quiz.button_text"
                        outlined
                        label="Button Text"
                        counter="150"
                        dense
                      />
                    </div>
                    <div class="mb-5">
                      <v-subheader class="pa-0">Description</v-subheader>
                      <b-rich-text-editor
                        v-model="quiz.description"
                        editor-id="quizDescription"
                        class-name="mt-4"
                      />
                    </div>
                    <div>
                      <b-text-area
                        v-model="quiz.meta_description"
                        outlined
                        label="Meta Description"
                        dense
                      />
                    </div>
                    <div>
                      <b-text-area
                        v-model="quiz.meta_keyword"
                        outlined
                        label="Meta Keyword"
                        dense
                      />
                    </div>
                    <div class="mb-5">
                      <v-subheader class="pa-0"
                        >Terms and Conditions</v-subheader
                      >
                      <b-rich-text-editor
                        v-model="quiz.terms_and_conditions"
                        editor-id="serviceLongDescription"
                        class-name="mt-4"
                      />
                    </div>
                    <b-text-area
                      v-model="quiz.ending_msg"
                      outlined
                      label="Ending Message"
                      dense
                    />
                  </v-sheet>
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
                  <b-date-time
                    v-model="quiz.created_at"
                    rules="required"
                    outlined
                    prepend-icon="mdi-calendar"
                    label="Quiz Publish Date"
                    hide-details
                    dense
                  />
                  <v-checkbox
                    v-model="quiz.is_featured"
                    label="Is Featured?"
                    color="primary"
                    hide-details
                  />
                  <v-checkbox
                    v-model="quiz.retry_allow"
                    label="Is Retry Allow?"
                    color="primary"
                    hide-details
                  />
                </v-card-text>
                <v-card-actions class="justify-center pb-5">
                  <v-btn outlined @click="$router.back()">Cancel</v-btn>
                  <v-btn
                    outlined
                    color="primary"
                    :disabled="invalid || invalidTrackerDate"
                    @click="handleSubmit(onSubmit('inactive'))"
                    >Save</v-btn
                  >
                  <v-btn
                    id="publishBtn"
                    outlined
                    color="success"
                    :disabled="invalid || invalidTrackerDate"
                    @click="handleSubmit(onSubmit('active'))"
                    >Publish</v-btn
                  >
                </v-card-actions>
              </v-card>

              <!-- Article tracker component -->
              <template v-if="!isReloadTrackerForm">
                <tracker-form
                  v-model="trackerData"
                  :options="trackerExistData"
                />
              </template>

              <!-- Quiz  Points component -->
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Points</h4>
                </v-card-title>
                <v-divider />
                <v-sheet class="pa-4">
                  <b-text
                    v-model="quiz.total_points"
                    rules="required|decimal:2"
                    outlined
                    label="Total Points"
                    dense
                  />

                  <b-text
                    v-model="quiz.reward_points"
                    rules="required|decimal:2"
                    outlined
                    label="Rewards Points"
                    dense
                  />
                </v-sheet>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Image</h4>
                </v-card-title>
                <v-divider />
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-subheader>Featured Image</v-subheader>
                    <v-btn
                      v-if="quiz.image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="quiz.image !== null">
                      <v-img :src="quiz.image" />
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
  name: 'QuizEdit',
  data() {
    const defaultForm = Object.freeze({
      title: '',
      sub_title: '',
      slug: '',
      status: 'inactive',
      buttonText: '',
      meta_description: '',
      terms_and_conditions: '',
      start_date: null,
      end_date: null,
      max_time: '',
      created_at: null,
      image: null,
      is_featured: false,
      platforms: [],
      area: [],
      color: '',
      retry_allow: 0,
      tracker: 'other',
      tracker_range: {},
    });

    return {
      language: 'en',
      quiz: Object.assign({}, defaultForm),
      dailog_type: 'image',
      mediaDialog: false,
      dateModal: false,
      timeModal: false,
      loading: false,
      platforms: ['web', 'app'],
      areaList: [],
      allAreaList: [],
      selectedArea: [],
      selectedPlatforms: [],
      dialog: false,
      color: '',
      invalidTrackerDate: false,
      isReloadTrackerForm: false,
      trackerData: {},
      trackerExistData: {},
      tracker: 'other',
    };
  },
  computed: {
    likesAllPlatform() {
      return this.selectedPlatforms.length === this.platforms.length;
    },
    likesSomePlatform() {
      return this.selectedPlatforms.length > 0 && !this.likesAllPlatform;
    },
    checkIconForMultiSelect() {
      if (this.likesAllPlatform) return 'mdi-close-box';
      if (this.likesSomePlatform) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
  },
  watch: {
    language() {
      this.getQuiz();
    },
    color(val) {
      if (val && val.hex) {
        this.quiz.color = val.hex;
        this.color = val.hex;
      }
    },
    trackerData(newData, oldData) {
      if (newData) {
        this.invalidTrackerDate = newData.invalidTrackerDate;
        this.quiz.tracker_start_day = newData.startDays;
        this.quiz.tracker_end_day = newData.endDays;
        this.quiz.tracker_range = newData.trackerRange;
        this.quiz.tracker = newData.tracker;
      }
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([this.getAreas()]).then(() => this.getQuiz());
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getAreas();
      this.getQuiz();
    });
  },
  methods: {
    // add dynamic tab into quiz
    addTab() {
      this.tabs.push({ locale: this.language, title: null, content: null });
    },
    removeTab(i) {
      this.tabs.splice(i, 1);
    },
    // open image select dialog
    openDialog(type) {
      this.dailog_type = type;
      this.mediaDialog = true;
    },
    // remove selected image
    removeImage(type) {
      this.dailog_type = null;
      switch (type) {
        case 'image':
          this.quiz.image = null;
          break;
      }
    },
    // update quiz image property
    useThisFile(event) {
      switch (this.dailog_type) {
        case 'image':
          this.quiz.image = event.url;
          break;
      }
      this.mediaDialog = false;
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/quiz/quiz/slug/${encodeURIComponent(
            this.quiz.title
          )}`
        );

        this.quiz.slug = slug;
      } catch (e) {
        this.quiz.slug = null;
      }
    },
    onSubmit(status) {
      this.quiz.status = status;
      this.publishQuiz();
    },
    async publishQuiz() {
      this.loading = true;
      try {
        this.quiz.area = getAreaIds(this).filter((el) => !!(el !== null));
        this.quiz.platforms = this.selectedPlatforms;
        this.quiz.color = this.color;
        const { message } = await this.$axios.$patch(
          `${this.language}/quiz/quiz/${this.quiz.id}`,
          this.quiz
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/quiz/quiz',
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
    async getQuiz() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/quiz/quiz/${this.$route.params.id}`
        );
        // this.selectedArea = JSON.parse(data.area);
        // this.selectedPlatforms = JSON.parse(data.platforms);
        this.color = data.color;
        this.quiz = Object.assign({}, data);

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
        // this.$router.replace('/product/products');
      }
    },
    toggle(type) {
      this.$nextTick(() => {
        if (type === 'valid-on') {
          if (this.likesAllPlatform) this.selectedPlatforms = [];
          else this.selectedPlatforms = this.platforms.slice();
        }
        if (type === 'area') {
          if (this.likesAllArea) this.selectedArea = [];
          else this.selectedArea = this.areaList.slice();
        }
      });
    },
    async getAreas() {
      try {
        const { data } = await this.$axios.$get(`shipping/area-all`);
        if (data && data.length > 0) {
          this.allAreaList = data;
          data.forEach((areaInfo) => {
            !!areaInfo && this.areaList.push(areaInfo.name);
          });
        }
      } catch (e) {}
    },
    editItem(item) {
      this.selectedPlatforms = item.platforms;
      this.selectedArea = getAreaNames(item.area);
      this.editedIndex = this.quiz.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
  },
};
const getAreaNames = (areaList) => {
  const namesArray = [];
  areaList.forEach((info) => {
    if (info) namesArray.push(info.name);
  });

  return namesArray;
};
const getAreaIds = (instance) => {
  const selectedArea = instance.selectedArea;
  const allAreaList = instance.allAreaList;

  if (selectedArea.length > 0) {
    let couponDivisonList = [];
    selectedArea.forEach((areaName) => {
      const dataObj = allAreaList.find(
        (divisionInfo) => divisionInfo.name === areaName
      );
      couponDivisonList = [...couponDivisonList, ...[dataObj]];
    });

    return couponDivisonList;
  } else return [];
};
</script>
