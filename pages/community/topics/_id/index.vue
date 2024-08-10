<template>
  <div id="topicEntry">
    <v-container grid-list-xl fluid>
      <v-row justify="space-between" class="ma-0 py-3">
        <h3>{{ formTitle }}</h3>
        <b-language v-model="language" />
      </v-row>
      <v-row>
        <v-col>
          <validation-observer v-slot="{ handleSubmit, invalid, reset }">
            <v-form
              @submit.prevent="handleSubmit(updateTopic)"
              @reset.prevent="reset"
            >
              <v-card>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="topic.name"
                        rules="required"
                        outlined
                        label="Name"
                        @blur="checkSlug"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="topic.slug"
                        rules="required"
                        outlined
                        label="Slug"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="12">
                      <b-text-area
                        v-model="topic.description"
                        outlined
                        rows="3"
                        label="Description"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
                <active-inactive v-model="topic.status" />
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
  </div>
</template>

<script>
export default {
  name: 'TopicEntry',
  components: {},
  data() {
    return {
      dialog: false,
      loading: false,
      language: 'en',
      topic: {
        id: 0,
        name: '',
        slug: '',
        description: '',
        status: 'active',
      },
      default: {
        id: 0,
        name: '',
        slug: '',
        description: '',
        status: 'active',
      },
      dailog_type: null,
      topics: [],
    };
  },
  computed: {
    formTitle() {
      return this.$route.query.edit === 'true' ? 'Edit topic' : 'Update topic';
    },
  },
  watch: {
    language() {
      this.getTopic();
    },
  },
  mounted() {
    this.getTopic();
  },
  methods: {
    openDialog(type) {
      this.dailog_type = type;
      this.dialog = true;
    },
    async updateTopic() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$patch(
          `${process.env.API_URL}/${this.language}/community/topic/${this.$route.params.id}`,
          this.topic
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/community/topics',
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
    // get topic for edit
    async getTopic() {
      try {
        const { data } = await this.$axios.$get(
          `${process.env.API_URL}/${this.language}/community/topic/${this.$route.params.id}`
        );
        this.topic = data;
      } catch (e) {
        Object.assign(this.topic, this.default);
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/community/topic/slug/${encodeURIComponent(
            this.topic.name
          )}`
        );

        this.topic.slug = slug;
      } catch (e) {
        this.topic.slug = null;
      }
    },
  },
};
</script>
