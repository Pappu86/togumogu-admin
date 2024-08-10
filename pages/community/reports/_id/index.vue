<template>
  <div id="postSingle">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-if="post">
            <v-card-title>
              <h4>Single Post - &nbsp;</h4>
              <v-chip v-if="post.status === 'active'" label class="success">
                Published
              </v-chip>
              <v-chip v-else class="warning" label>Saved</v-chip>
              <v-switch
                v-model="post.status"
                v-can="`update post`"
                color="primary"
                true-value="active"
                false-value="inactive"
                class="ml-5"
                @change="statusHandler"
              />
              <v-spacer />
              <v-btn
                v-can="`update post`"
                :to="`/community/posts/${post.id}/edit?edit=true&lang=${language}`"
                color="teal"
                outlined
              >
                Edit
              </v-btn>
            </v-card-title>
          </v-card>
        </v-flex>
        <v-flex xs12 md12>
          <v-card class="mx-auto">
            <v-card-text class="text-h5">
              <v-img
                v-if="post.image"
                height="300"
                contain
                :src="post.image"
              ></v-img>
              <br />
              {{ post.content }}
            </v-card-text>

            <v-card-actions>
              <v-list-item class="grow">
                <v-list-item-avatar class="mr-0">
                  <v-img
                    :alt="post && post.customer && post.customer.name"
                    :src="post && post.customer && post.customer.avatar"
                  ></v-img>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title class="py-0">
                    <v-btn
                      plain
                      color="primary"
                      class="linkable-text"
                      title="View details"
                      target="_blank"
                      :to="`/customers/${post.customer && post.customer.id}`"
                    >
                      {{ post.customer && post.customer.name }}
                    </v-btn></v-list-item-title
                  >
                </v-list-item-content>

                <v-row align="center" justify="end">
                  <v-icon class="mr-1"> mdi-chat </v-icon>
                  <span class="subheading mr-2">{{
                    post.comments && post.comments.length
                  }}</span>
                  <span class="mr-1">·</span>
                  <v-icon class="mr-1"> mdi-share-variant </v-icon>
                  <span class="subheading">{{ post.share_count }}</span>
                </v-row>
              </v-list-item>
            </v-card-actions>
            <v-divider />

            <v-list class="ml-5">
              <template v-for="(item, index) in post.comments">
                <div :key="item.id + index">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title
                        v-html="item.content"
                      ></v-list-item-title>
                    </v-list-item-content>

                    <v-spacer />
                    <v-btn
                      v-can="`view comment`"
                      icon
                      small
                      fab
                      target="_blank"
                      color="primary"
                      title="View"
                      :to="`/community/comments/${item.id}`"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </v-list-item>

                  <v-card-actions class="py-0">
                    <v-list-item class="grow">
                      <v-list-item-avatar class="mr-0">
                        <v-img
                          :src="item.customer && item.customer.avatar"
                        ></v-img>
                      </v-list-item-avatar>

                      <v-list-item-content>
                        <v-list-item-title class="py-0">
                          <v-btn
                            plain
                            color="primary"
                            class="linkable-text"
                            title="View details"
                            target="_blank"
                            :to="`/customers/${
                              item.customer && item.customer.id
                            }`"
                          >
                            {{ item.customer && item.customer.name }}
                          </v-btn></v-list-item-title
                        >
                      </v-list-item-content>
                    </v-list-item>
                  </v-card-actions>
                  <v-divider />
                </div>
              </template>
            </v-list>
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
      post: {
        content: '',
        datetime: '',
        status: false,
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getPost();
    },
  },
  mounted() {
    this.getPost();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getPost();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getPost() {
      try {
        const { data } = await this.$axios.$get(
          `community/post/${this.$route.params.id}`
        );
        this.post = data;
      } catch (e) {
        this.$router.replace('/community/posts');
      }
    },
    statusHandler() {
      this.updatePost();
    },
    async updatePost() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$patch(
          `community/post/${this.post.id}`,
          this.post
        );
        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
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
  },
};
</script>
