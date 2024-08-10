<template>
  <div id="postSingle">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-if="blogArticle">
            <v-card-title>
              <h4>Single Post - &nbsp;</h4>
              <v-chip v-if="blogArticle.status" label class="success">
                Published
              </v-chip>
              <v-chip v-else class="pink" label>Saved</v-chip>
              <v-spacer />
              <v-spacer />
              <b-language v-model="language" />
              <v-btn
                v-can="`update blogArticle`"
                :to="`/blog/articles/${blogArticle.id}/edit?edit=true&lang=${language}`"
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
              v-if="blogArticle.image"
              height="300"
              contain
              :src="blogArticle.image"
            ></v-img>

            <v-card-title primary-title>
              <div>
                <h3 class="display-1">{{ blogArticle.title }}</h3>
                <h6 class="subheading">{{ blogArticle.subtitle }}</h6>
                <!-- <v-chip>{{ blogArticle.datetime }}</v-chip> -->
                <!-- <v-chip
                  v-for="category in blogArticle.categories"
                  :key="category.id"
                  color="info"
                >
                  {{ category.name }}
                </v-chip> -->
              </div>
            </v-card-title>
            <v-card-text>
              <p>{{ blogArticle.excerpt }}</p>
              <br />
              <hr />
              <br />
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="blogArticle.content"></div>
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
      blogArticle: {
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
      if (newVal !== oldVal) this.getBlogArticle();
    },
  },
  mounted() {
    this.getBlogArticle();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getBlogArticle());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getBlogArticle() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/blog/article/${this.$route.params.id}`
        );
        this.blogArticle = data;
      } catch (e) {
        this.$router.replace('/blog/articles');
      }
    },
  },
};
</script>
