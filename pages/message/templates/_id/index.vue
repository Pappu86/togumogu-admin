<template>
  <div id="templateSingle">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-if="templateInfo">
            <v-card-title>
              <h4>{{ templateInfo.name }} - &nbsp;</h4>
              <v-chip
                class="white--text"
                :color="
                  templateInfo.status === 'active' ? 'success' : 'warning'
                "
              >
                {{ templateInfo.status }}
              </v-chip>
              <v-spacer />
              <v-spacer />
              <b-language v-model="language" />
              <v-btn
                v-can="`update template`"
                :to="`/message/templates/${templateInfo.id}/edit?edit=true&lang=${language}`"
                color="teal"
                outlined
              >
                Edit
              </v-btn>
            </v-card-title>
          </v-card>
        </v-flex>
        <v-flex xs12 md12>
          <v-card-title primary-title class="py-0">
            <h5 class="display-5">{{ templateInfo.subject }}</h5>
          </v-card-title>
        </v-flex>
      </v-layout>

      <v-card elevation="3" class="py-4 px-4">
        <v-card-body>
          <div
            style="margin: 0px auto; max-width: 600px"
            v-html="templateInfo.content"
          ></div>
        </v-card-body>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'TemplateSingle',
  data() {
    return {
      language: 'en',
      templateInfo: {
        type: '',
        title: '',
        content: '',
        main_template_id: '',
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getTemplate();
    },
  },
  mounted() {
    this.getTemplate();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getTemplate());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getTemplate() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/message/template/${this.$route.params.id}`
        );
        this.templateInfo = data;
      } catch (e) {
        this.$router.replace('/message/templates');
      }
    },
  },
};
</script>
