<template>
  <div id="homeSliderEntry">
    <v-container grid-list-xl fluid>
      <v-row justify="space-between" class="ma-0 py-3">
        <h3>{{ formTitle }}</h3>
        <b-language v-model="language" />
      </v-row>
      <v-row>
        <v-col>
          <validation-observer v-slot="{ handleSubmit, invalid, reset }">
            <v-form
              @submit.prevent="handleSubmit(updateSlider)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text v-model="slider.title" outlined label="Title" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="slider.subtitle"
                        outlined
                        label="Subtitle"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text v-model="slider.link" outlined label="Link" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="slider.category"
                        :items="categoryList"
                        label="Category"
                        outlined
                        hide-details
                      ></v-select>
                    </v-col>
                  </v-row>
                  <v-row justify="center">
                    <v-col cols="12" sm="6">
                      <v-subheader>Image/Video</v-subheader>
                      <v-btn
                        v-if="slider.url === null"
                        color="primary"
                        outlined
                        block
                        @click.stop="openDialog()"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                      <v-card v-if="slider.url !== null">
                        <template v-if="slider.type === 'image'">
                          <v-img :src="slider.url" />
                        </template>
                        <template v-else>
                          <video
                            :src="slider.url"
                            controls
                            width="100%"
                          ></video>
                        </template>
                        <v-card-actions class="justify-center">
                          <v-btn
                            color="teal"
                            outlined
                            @click.stop="openDialog()"
                          >
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn color="pink" outlined @click="removeImage()">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-col>
                  </v-row>
                  <v-radio-group v-model="slider.type" row>
                    <v-radio label="Image" value="image" />
                    <v-radio label="Video" value="video" />
                  </v-radio-group>
                </v-card-text>
                <active-inactive v-model="slider.status" />
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
    <v-dialog v-model="dialog" scrollable max-width="90vw">
      <v-card id="mediaDialog">
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
export default {
  name: 'HomeSliderEntry',
  data() {
    const defaultForm = Object.freeze({
      title: '',
      subtitle: '',
      status: 'active',
      url: null,
      type: 'image',
      link: null,
      category: 'main',
    });
    return {
      dialog: false,
      loading: false,
      language: 'en',
      slider: Object.assign({}, defaultForm),
      categoryList: [
        { text: 'Main', value: 'main' },
        { text: 'Offer', value: 'offer' },
      ],
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true'
        ? 'Edit Slider'
        : 'Update Slider';
    },
  },
  watch: {
    language() {
      this.getSlider();
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    this.getSlider();
  },
  methods: {
    openDialog() {
      this.dialog = true;
    },
    removeImage() {
      this.slider.url = null;
    },
    useThisFile(event) {
      this.slider.url = event.url;
      this.dialog = false;
    },
    async updateSlider() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$patch(
          `${this.language}/home/slider/${this.$route.params.id}`,
          this.slider
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/home/sliders',
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
    // get slider for edit
    async getSlider() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/home/slider/${this.$route.params.id}`
        );
        this.slider = data;
      } catch (e) {
        Object.assign(this.slider, this.defaultForm);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>
