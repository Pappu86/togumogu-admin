<template>
  <div id="videoEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="video" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Video</h4>
                  <v-spacer></v-spacer>
                  <v-chip text-color="black" color="success">
                    {{ video.status ? 'Published' : 'Saved' }}
                  </v-chip>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-text
                    v-model="video.title"
                    rules="required|min:10|max:180"
                    outlined
                    label="Title"
                    counter="180"
                    @blur="checkSlug"
                  />
                  <b-text
                    v-model="video.slug"
                    rules="required"
                    outlined
                    label="Slug"
                  />
                  <b-text
                    v-model="video.url"
                    rules="required"
                    outlined
                    label="Video url"
                  />

                  <v-row class="mb-5">
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="video.video_language"
                        :items="languageList"
                        label="Video language"
                        outlined
                        hide-details
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="video.video_type"
                        :items="videoTypes"
                        label="Video type"
                        outlined
                        hide-details
                      ></v-select>
                    </v-col>
                  </v-row>

                  <v-row class="mb-5">
                    <v-col cols="12" sm="6">
                      <b-date-time
                        v-model="video.live_start"
                        outlined
                        label="Live start"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-row>
                        <v-col cols="12" sm="4">
                          <b-text
                            v-model="videoDurationHour"
                            rules="numeric"
                            label="Hour"
                            outlined
                            hide-details=""
                          />
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-select
                            v-model="videoDurationMinute"
                            :items="numberList"
                            label="Minute"
                            outlined
                            hide-details
                          ></v-select>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-select
                            v-model="videoDurationSecond"
                            :items="numberList"
                            label="Second"
                            outlined
                            hide-details
                          ></v-select>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <b-text-area
                    v-model="video.sub_title"
                    outlined
                    label="Sub-title"
                  />

                  <b-text-area
                    v-model="video.excerpt"
                    rules="required|min:10"
                    outlined
                    label="Excerpt"
                  />
                  <v-subheader class="pa-0">Content</v-subheader>
                  <b-rich-text-editor
                    v-model="video.content"
                    editor-id="videoContent"
                    :options="{
                      rules: 'required',
                      fieldName: 'content',
                    }"
                    class-name="mt-4"
                  />
                  <br />
                  <b-text
                    v-model="video.meta_title"
                    rules="min:10|max:180"
                    outlined
                    label="Meta Title"
                    counter="180"
                  />
                  <b-text-area
                    v-model="video.meta_description"
                    rules="min:10"
                    outlined
                    label="Meta Description"
                  />
                  <b-text-area
                    v-model="video.meta_keyword"
                    rules="min:10"
                    outlined
                    label="Meta Keyword"
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
                  <b-date-time
                    v-model="video.datetime"
                    rules="required"
                    outlined
                    prepend-icon="mdi-calendar"
                    label="Video Publish Date"
                    hide-details
                  />
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-checkbox
                        v-model="video.is_featured"
                        label="Is Featured?"
                        color="primary"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-checkbox
                        v-model="video.send_push"
                        label="Send Push Notification"
                        color="primary"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions class="justify-center pb-5">
                  <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                  <v-btn
                    outlined
                    color="primary"
                    :disabled="invalid || invalidTrackerDate"
                    @click="handleSubmit(onSubmit(0))"
                  >
                    Save
                  </v-btn>
                  <v-btn
                    id="publishBtn"
                    outlined
                    color="success"
                    :disabled="invalid || invalidTrackerDate"
                    @click="handleSubmit(onSubmit(1))"
                  >
                    Publish
                  </v-btn>
                </v-card-actions>
              </v-card>

              <!-- Video tracker component -->
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
                <scrollbar style="height: 500px">
                  <v-treeview
                    v-model="video.categories"
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
                    v-model="video.tags"
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
                    <v-subheader>Featured Image</v-subheader>
                    <v-btn
                      v-if="video.image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="video.image !== null">
                      <v-img :src="video.image" />
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
                  <v-col cols="12" sm="6">
                    <v-subheader>Meta Image</v-subheader>
                    <v-btn
                      v-if="video.meta_image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('meta_image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="video.meta_image !== null">
                      <v-img :src="video.meta_image" />
                      <v-card-actions class="justify-center">
                        <v-btn
                          color="teal"
                          outlined
                          @click.stop="openDialog('meta_image')"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          color="pink"
                          outlined
                          @click="removeImage('meta_image')"
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
import MediaLibrary from '@/components/MediaLibrary';

export default {
  name: 'VideoEdit',
  components: { MediaLibrary },
  data() {
    const defaultForm = Object.freeze({
      categories: [],
      tracker: 'other',
      tracker_range: {},
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      datetime: null,
      filters: [],
      tags: [],
      status: 0,
      image: null,
      meta_image: null,
      send_push: false,
      is_featured: false,
      url: null,
      video_language: 'bn',
      video_type: 'recorded',
      live_start: '',
    });

    return {
      language: 'en',
      video: Object.assign({}, defaultForm),
      dailog_type: 'image',
      mediaDialog: false,
      dateModal: false,
      timeModal: false,
      category: '',
      categories: [],
      filters: [],
      filter: null,
      tags: [],
      loading: false,
      invalidTrackerDate: false,
      isReloadTrackerForm: false,
      trackerData: {},
      trackerExistData: {},
      tracker: 'other',
      videoDurationHour: '00',
      videoDurationMinute: '0',
      videoDurationSecond: '0',
      numberList: getNumberList(59),
      languageList: [
        { text: 'Bangla', value: 'bn' },
        { text: 'English', value: 'en' },
      ],
      videoTypes: [
        { text: 'Recorded', value: 'recorded' },
        { text: 'Recorded Live', value: 'recorded_live' },
        { text: 'Live', value: 'live' },
      ],
    };
  },
  watch: {
    language() {
      this.getVideo();
    },
    trackerData(newData, oldData) {
      if (newData) {
        this.invalidTrackerDate = newData.invalidTrackerDate;
        this.video.tracker_start_day = newData.startDays;
        this.video.tracker_end_day = newData.endDays;
        this.video.tracker_range = newData.trackerRange;
        this.video.tracker = newData.tracker;
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
      this.getCategories(),
      this.getTags(),
      this.getFilters(),
    ]).then(() => this.getVideo());

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getCategories();
      this.getFilters();
      this.getTags();
      this.getVideo();
    });
  },
  methods: {
    openDialog(type) {
      this.dailog_type = type;
      this.mediaDialog = true;
    },
    removeImage(type) {
      this.dailog_type = null;
      switch (type) {
        case 'image':
          this.video.image = null;
          break;
        case 'meta_image':
          this.video.meta_image = null;
          break;
      }
    },
    useThisFile(event) {
      switch (this.dailog_type) {
        case 'image':
          this.video.image = event.url;
          break;
        case 'meta_image':
          this.video.meta_image = event.url;
          break;
      }
      this.mediaDialog = false;
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/video/video/slug/${encodeURIComponent(
            this.video.title
          )}`
        );

        this.video.slug = slug;
      } catch (e) {
        this.video.slug = null;
      }
    },
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/video/category-tree`
        );
        this.categories = data;
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
    async getFilters() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/common/filter-all`
        );
        this.filters = data;
      } catch (e) {}
    },
    onSubmit(status) {
      this.video.status = status;
      this.publishVideo();
    },
    async publishVideo() {
      this.loading = true;

      this.video.duration = `${
        this.videoDurationHour ? this.videoDurationHour : '00'
      }:${this.videoDurationMinute}:${this.videoDurationSecond}`;

      try {
        const { message } = await this.$axios.$patch(
          `${this.language}/video/video/${this.video.id}`,
          this.video
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/video/videos',
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
    async getVideo() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/video/video/${this.$route.params.id}/edit`
        );
        this.video = Object.assign({}, data);

        // Get video duration for edit
        const duration = (data && data.duration) || '00:00:00';
        if (duration) {
          const durationSplit = duration.split(':');
          this.videoDurationHour = durationSplit[0];
          this.videoDurationMinute = durationSplit[1] * 1;
          this.videoDurationSecond = durationSplit[2] * 1;
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
        this.$router.replace('/video/videos');
      }
    },
  },
};

// Get months/days list
const getNumberList = (limitItems) => {
  const list = [];
  for (let i = 0; i <= limitItems; i++) {
    list.push(i);
  }
  return list;
};
</script>
