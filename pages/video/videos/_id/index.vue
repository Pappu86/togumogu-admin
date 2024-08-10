<template>
  <div id="postSingle">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-if="video">
            <v-card-title>
              <h4>Single Post - &nbsp;</h4>
              <v-chip v-if="video.status" label class="success">
                Published
              </v-chip>
              <v-chip v-else class="pink" label>Saved</v-chip>
              <v-spacer />
              <v-spacer />
              <b-language v-model="language" />
              <v-btn
                v-can="`update video`"
                :to="`/video/videos/${video.id}/edit?edit=true&lang=${language}`"
                color="teal"
                outlined
              >
                Edit
              </v-btn>
            </v-card-title>
          </v-card>
        </v-flex>
        <v-flex xs12 md12>
          <v-card>
            <v-img
              v-if="video.image"
              height="300"
              contain
              :src="video.image"
            ></v-img>

            <v-card-title primary-title>
              <div>
                <h3 class="display-1">{{ video.title }}</h3>
                <h6 class="subheading">{{ video.subtitle }}</h6>
                <!-- <v-chip>{{ video.datetime }}</v-chip> -->
                <!-- <v-chip
                  v-for="category in video.categories"
                  :key="category.id"
                  color="info"
                >
                  {{ category.name }}
                </v-chip> -->
              </div>
            </v-card-title>
            <v-card-text>
              <p>{{ video.excerpt }}</p>
              <br />
              <hr />
              <br />
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="video.content"></div>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'PostSingle',
  data() {
    return {
      language: 'en',
      video: {
        title: '',
        excerpt: '',
        content: '',
        datetime: '',
        category_id: null,
        status: false,
        tags: [],
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getVideo();
    },
  },
  mounted() {
    this.getVideo();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getVideo());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getVideo() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/video/video/${this.$route.params.id}`
        );
        this.getVideo = data;
      } catch (e) {
        this.$router.replace('/video/video');
      }
    },
  },
};
</script>
