<template>
  <div id="daycareSingle">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-if="partnershipInfo">
            <v-card-title>
              <h4>Single Partnership - &nbsp;</h4>
              <v-chip
                class="white--text"
                :color="
                  partnershipInfo.status === 'active' ? 'success' : 'warning'
                "
              >
                {{ partnershipInfo.status }}
              </v-chip>
              <v-spacer />
              <v-spacer />
              <b-language v-model="language" />
              <v-btn
                v-can="`update partnership`"
                :to="`/corporate/partnership/${partnershipInfo.id}/edit?edit=true&lang=${language}`"
                color="teal"
                outlined
              >
                Edit
              </v-btn>
            </v-card-title>
          </v-card>
        </v-flex>
        <v-flex xs12 md12>
          <v-row>
            <v-col xs12 md12 class="mb-3">
              <template v-if="partnershipInfo.status === 'active'">
                <template
                  v-if="
                    partnershipInfo.referral &&
                    partnershipInfo.referral.dynamic_url
                  "
                >
                  <copy-content
                    :options="{
                      content:
                        partnershipInfo.referral &&
                        partnershipInfo.referral.dynamic_url,
                      isShowContent: true,
                      isShowToast: true,
                      width: 250,
                    }"
                  />
                </template>
                <template v-else="">
                  <v-btn
                    color="success"
                    outlined
                    rounded
                    @click="generateInviteLink()"
                  >
                    <v-icon>mdi-refresh</v-icon>
                  </v-btn>
                </template>
              </template>
            </v-col>
          </v-row>

          <v-card>
            <v-card-title primary-title>
              <div>
                <h3 class="display-1">{{ partnershipInfo.id }}</h3>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'PartnershipSingle',
  data() {
    return {
      language: 'en',
      partnershipInfo: {
        id: '',
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getPartnership();
    },
  },
  mounted() {
    this.getPartnership();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getPartnership());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getPartnership() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/corporate/partnership/${this.$route.params.id}`
        );
        this.partnershipInfo = data;
      } catch (e) {
        this.$router.replace('/corporate/partnership');
      }
    },
    async generateInviteLink() {
      try {
        await this.$axios.$get(
          `${this.language}/corporate/partnership/referral/${this.$route.params.id}`
        );
      } catch (e) {
        this.$router.replace('/corporate/partnership');
      }
    },
  },
};
</script>
