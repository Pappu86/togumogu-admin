<template>
  <div id="questionEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="question" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <!-- Start edit left section-->
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Question</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    class="white--text"
                    :color="
                      question.status === 'active' ? 'success' : 'warning'
                    "
                  >
                    {{ question.status === 'active' ? 'Publish' : 'Inactive' }}
                  </v-chip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-sheet elevation="0" tag="section" class="pa-2 mb-5 pb-5">
                    <b-text
                      v-model="question.title"
                      rules="required|min:3"
                      outlined
                      label="Title"
                      dense
                    />
                    <b-text
                      v-model="question.link_text"
                      outlined
                      label="Link Text"
                      dense
                    />
                    <v-row>
                      <v-col md="6">
                        <b-text
                          v-model="question.time"
                          rules="numeric"
                          outlined
                          label="Time"
                          dense
                          hide-details
                        />
                      </v-col>
                      <v-col md="6">
                        <b-text
                          v-model="question.score"
                          rules="numeric"
                          outlined
                          label="Score"
                          dense
                          hide-details
                        />
                      </v-col>
                      <v-col md="6">
                        <v-select
                          v-model="question.type"
                          :items="typeList"
                          label="Type"
                          outlined
                          dense
                          hide-details
                          class="mb-5 mt-3"
                        ></v-select>
                      </v-col>
                      <v-col md="6">
                        <v-checkbox
                          v-model="question.is_multiple"
                          label="Is Multiple?"
                          color="primary"
                          hide-details
                        />
                      </v-col>
                    </v-row>

                    <div class="mb-5">
                      <h3 class="mb-3">Options</h3>
                      <v-divider class="mb-2"></v-divider>

                      <div id="targetComponent">
                        <v-simple-table dense>
                          <template v-slot:default>
                            <thead>
                              <tr>
                                <th class="text-left">Value</th>
                                <th class="text-left" style="width: 80px">
                                  Is anwwer
                                </th>
                                <th class="text-center" style="width: 165px">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(questionOption, k) in questionOptions"
                                :key="k"
                              >
                                <td class="pt-3 pb-3">
                                  <b-text
                                    v-if="
                                      isShowOption('only-text') ||
                                      isShowOption('text-image')
                                    "
                                    v-model="questionOption.text"
                                    outlined
                                    label="Text"
                                    hide-details
                                    dense
                                    @change="
                                      onChangeQuestionOption(
                                        questionOption,
                                        'text'
                                      )
                                    "
                                  />
                                  <div
                                    v-if="
                                      isShowOption('only-image') ||
                                      isShowOption('text-image')
                                    "
                                    :class="`d-flex ${
                                      isShowOption('text-image') ? 'mt-3' : ''
                                    } `"
                                  >
                                    <img
                                      :src="questionOption.image"
                                      alt=""
                                      width="30"
                                      class="mr-2"
                                    />
                                    <b-text
                                      v-model="questionOption.image"
                                      outlined
                                      label="Image Url"
                                      hide-details
                                      dense
                                      style="width: 100%"
                                      @change="
                                        onChangeQuestionOption(
                                          questionOption,
                                          'image'
                                        )
                                      "
                                    />
                                  </div>
                                </td>
                                <td class="pt-3 pb-3">
                                  <v-checkbox
                                    v-model="questionOption.is_answer"
                                    label="Yes"
                                    color="primary"
                                    class="mt-0"
                                    hide-details
                                    @change="
                                      onChangeQuestionOption(
                                        questionOption,
                                        'isAnswer'
                                      )
                                    "
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
                                    :disabled="isDisabledOptionRemove()"
                                    @click.stop="removeRow(k, questionOption)"
                                  >
                                    <v-icon>mdi-minus</v-icon>
                                  </v-btn>
                                </td>
                              </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                      </div>
                    </div>

                    <b-text-area
                      v-model="question.hint"
                      outlined
                      label="Hint"
                      dense
                      rows="3"
                    />

                    <b-text-area
                      v-model="question.description"
                      outlined
                      label="Description"
                      dense
                    />
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
                    v-model="question.quiz_id"
                    :items="quizs"
                    label="Quiz"
                    outlined
                    hide-details="auto"
                    class="mb-5"
                    dense
                  ></v-select>
                  <b-text
                    v-model="question.serial_no"
                    rules="numeric"
                    outlined
                    label="Serial No"
                    dense
                  />
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
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Tag</h4>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-auto-complete
                    v-model="question.tags"
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
                  <h4>Image</h4>
                </v-card-title>
                <v-divider />
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-subheader>Image</v-subheader>
                    <v-btn
                      v-if="question.image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="question.image !== null">
                      <v-img :src="question.image" />
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
            <!-- End edit right section-->
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
    <v-dialog v-model="dialog" scrollable max-width="95vw">
      <v-card id="dialog">
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Upload Files</span>
          <v-btn icon dark class="ma-0" @click.stop="dialog = false">
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
import TargetComponent from '@/pages/message/notifications/target-component';

export default {
  name: 'QuestionEdit',
  components: {
    // eslint-disable-next-line vue/no-unused-components
    TargetComponent,
  },
  data() {
    const defaultForm = Object.freeze({
      status: 'inactive',
      type: 'only-text',
      title: '',
      audio: '',
      video: '',
      quiz_id: '',
      serial_no: 0,
    });

    return {
      language: 'en',
      question: Object.assign({}, defaultForm),
      dailog_type: 'image',
      dialog: false,
      questionType: '',
      quizs: [],
      tags: [],
      typeList: [
        { text: 'Only Text', value: 'only-text' },
        { text: 'Only Image', value: 'only-image' },
        { text: 'Text & Image', value: 'text-image' },
        { text: 'Audio', value: 'audio' },
      ],
      loading: false,
      questionOptions: [
        {
          text: '',
          image: '',
          audio: '',
          video: '',
          description: '',
          hint: '',
          is_answer: false,
        },
      ],
      isInvalidForm(invalid) {
        return !this.question.quiz_id || invalid;
      },
      isDisabledOptionRemove() {
        return this.questionOptions.length === 1;
      },
      isShowOption(optionType) {
        if (optionType === this.question.type) return true;
        else return false;
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
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([this.getQuizes(), this.getTags()]).then(() => {
      this.getQuestion();
    });

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getQuizes();
      this.getTags();
      this.getQuestion();
    });
  },
  methods: {
    // open image select dialog
    openDialog(type) {
      this.dailog_type = type;
      this.dialog = true;
    },
    // remove selected image
    removeImage(type) {
      this.dailog_type = null;
      switch (type) {
        case 'image':
          this.question.image = null;
          break;
      }
    },
    // update quiz image property
    useThisFile(event) {
      switch (this.dailog_type) {
        case 'image':
          this.question.image = event.url;
          break;
      }
      this.dialog = false;
    },
    onSubmit(status) {
      this.question.status = status;
      this.publishQuestion();
    },
    async publishQuestion() {
      const instance = this;
      instance.loading = true;

      try {
        const questionData = instance.question;
        questionData.options = instance.questionOptions;
        const { message } = await this.$axios.$patch(
          `${this.language}/quiz/question/${this.$route.params.id}`,
          questionData
        );

        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/quiz/question',
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
    async getQuestion() {
      const instance = this;
      try {
        const { data } = await instance.$axios.$get(
          `${instance.language}/quiz/question/${instance.$route.params.id}/edit`
        );

        instance.question = Object.assign({}, data);
        if (data && data.options.length > 0) {
          instance.questionOptions = data.options;
        }
      } catch (e) {
        instance.$router.replace('/quiz/question');
      }
    },
    async getQuizes() {
      try {
        const { data } = await this.$axios.$get(`${this.language}/quiz/all`);
        this.quizs = data;
      } catch (e) {}
    },
    async getTags() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/common/tag-all`
        );
        this.tags = data;
      } catch (e) {}
    },
    addRow() {
      this.questionOptions.push({
        text: '',
        image: '',
        audio: '',
        video: '',
        description: '',
        hint: '',
        is_answer: false,
      });
    },
    removeRow(index, item) {
      // Remove row
      const idx = this.questionOptions.indexOf(item);
      if (idx > 0) {
        this.questionOptions.splice(idx, 1);
      }
    },
    onChangeQuestionOption(option, fieldType) {
      const idx = this.questionOptions.indexOf(option);
      const isMultipleAnswer = this.question?.is_multiple;
      if (!isMultipleAnswer && this.questionOptions.length > 0) {
        const items = [];

        this.questionOptions.forEach((quesOption, index) => {
          if (index === idx && option.is_answer) {
            quesOption = { ...quesOption, is_answer: true };
          } else quesOption = { ...quesOption, is_answer: false };
          items.push(quesOption);
        });

        this.questionOptions = items;
      }
    },
  },
};
</script>
