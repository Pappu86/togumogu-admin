<template>
  <div id="commentSingle">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-if="comment">
            <v-card-title>
              <h4>Single Comment - &nbsp;</h4>
              <v-chip v-if="comment.status === 'active'" label class="success">
                Published
              </v-chip>
              <v-chip v-else class="warning" label>Saved</v-chip>
              <v-switch
                v-model="comment.status"
                v-can="`update comment`"
                color="primary"
                true-value="active"
                false-value="inactive"
                class="ml-5"
                @change="statusHandler"
              />
              <v-spacer />
              <v-btn
                v-can="`update comment`"
                :to="`/community/comments/${comment.id}/edit?edit=true&lang=${language}`"
                color="teal"
                outlined
              >
                Edit
              </v-btn>
            </v-card-title>
          </v-card>
        </v-flex>

        <v-flex xs7 md7>
          <v-card class="mx-auto">
            <v-card-text>
              <v-row>
                <v-col
                  v-for="image in comment.images"
                  :key="image.id"
                  class="d-flex child-flex"
                  cols="4"
                >
                  <a :href="image.src" target="_blank" title="See large image">
                    <v-img
                      :src="image.src"
                      :lazy-src="image.src"
                      aspect-ratio="1"
                      class="grey lighten-2"
                    >
                      <template v-slot:placeholder>
                        <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center"
                        >
                          <v-progress-circular
                            indeterminate
                            color="grey lighten-5"
                          ></v-progress-circular>
                        </v-row>
                      </template>
                    </v-img>
                  </a>
                </v-col>
              </v-row>
              <br />
              {{ comment.content }}
            </v-card-text>

            <v-list class="ml-5">
              <template v-for="(item, index) in comment.replies">
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
        <v-flex xs5 md5>
          <v-card class="mx-auto">
            <v-card-title> General Information </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <tbody>
                  <tr>
                    <th>Creator:</th>
                    <td class="text-center">
                      <v-list-item-avatar class="mr-0">
                        <v-img
                          :alt="
                            comment && comment.customer && comment.customer.name
                          "
                          :src="
                            comment &&
                            comment.customer &&
                            comment.customer.avatar
                          "
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
                              comment.customer && comment.customer.id
                            }`"
                          >
                            {{ comment.customer && comment.customer.name }}
                          </v-btn></v-list-item-title
                        >
                      </v-list-item-content>
                      <br />
                    </td>
                  </tr>
                  <tr>
                    <th>Publish Date:</th>
                    <td>
                      {{ comment.created_at }}({{ comment.created_from }})
                    </td>
                  </tr>
                  <tr>
                    <th>Replies:</th>
                    <td>
                      <v-icon class="mr-1"> mdi-chat </v-icon>
                      <span class="subheading mr-2">{{
                        comment.total_replies
                      }}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Total Share:</th>
                    <td>
                      <v-icon class="mr-1"> mdi-share-variant </v-icon>
                      <span class="subheading">{{ comment.share_count }}</span>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>

          <v-card class="mt-4">
            <v-card-title> Reports </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <tbody>
                  <tr
                    v-for="report in comment.reports"
                    :key="`report_` + report.id"
                  >
                    <td>{{ report.reason.title }}</td>
                    <td :title="report.note">
                      {{ getShortReportNote(report.note) }}
                    </td>
                    <td>
                      <v-chip
                        class="ma-2 text-capitalize"
                        :color="getStatusColor(report.status)"
                        :text-color="report.status !== 'pending' ? `white` : ''"
                      >
                        {{ report.status }}
                      </v-chip>
                    </td>
                    <td>
                      <v-btn
                        icon
                        small
                        color="teal"
                        title="Edit"
                        @click="showDetails(report)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <!-- Report details modal -->
    <v-dialog v-model="isShowDetailDailog" persistent max-width="500">
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Report Details</span>
          <v-btn icon dark class="ma-0" @click.stop="closeDialog('details')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pt-5">
          <v-simple-table v-if="detailsItem" dense class="mb-5">
            <tbody>
              <tr>
                <th>Reporter:</th>
                <td class="d-flex height-55i">
                  <v-list-item-avatar class="mr-0">
                    <v-img
                      :alt="
                        detailsItem &&
                        detailsItem.customer &&
                        detailsItem.customer.name
                      "
                      :src="
                        detailsItem &&
                        detailsItem.customer &&
                        detailsItem.customer.avatar
                      "
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
                          detailsItem.customer && detailsItem.customer.id
                        }`"
                      >
                        {{ detailsItem.customer && detailsItem.customer.name }}
                      </v-btn></v-list-item-title
                    >
                  </v-list-item-content>
                  <br />
                </td>
              </tr>
              <tr>
                <th>Date</th>
                <td>
                  {{ detailsItem.created_at }}({{ detailsItem.created_from }})
                </td>
              </tr>
              <tr>
                <th>Reason</th>
                <td>
                  <template v-if="`view report_reason`">
                    <v-btn
                      plain
                      color="primary"
                      class="linkable-text"
                      title="View details"
                      target="_blank"
                      :to="`report-reasons/${
                        detailsItem.reason && detailsItem.reason.id
                      }`"
                    >
                      {{ detailsItem.reason && detailsItem.reason.title }}
                    </v-btn>
                  </template>
                  <template v-else="">
                    {{ detailsItem.reason && detailsItem.reason.title }}
                  </template>
                </td>
              </tr>
              <tr>
                <th>Note</th>
                <td>{{ detailsItem.note }}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td class="pt-2 height-55i">
                  <form class="d-flex">
                    <v-select
                      v-model="detailsItem.status"
                      :items="reportStatusList"
                      label="Status"
                      required
                      outlined
                      dense
                    ></v-select>
                    <v-btn
                      class="ml-2 mt-1"
                      small
                      color="primary"
                      @click="updateReportStatus"
                    >
                      Change
                    </v-btn>
                  </form>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'CommentSingle',
  data() {
    return {
      language: 'en',
      comment: {
        content: '',
        datetime: '',
        status: false,
      },
      isShowDetailDailog: false,
      detailsItem: {
        id: 0,
        note: '',
        customer: {},
        reason: {},
        status: 'pending',
      },
      reportStatusList: [
        { text: 'Pending', value: 'pending' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Approved', value: 'approved' },
      ],
      getStatusColor(status) {
        let result = 'green';
        if (status === 'approved') result = 'green';
        else if (status === 'rejected') result = 'red';
        else if (status === 'pending') result = 'yellow';

        return result;
      },
      getShortReportNote(note) {
        const dots = note.length > 12 ? '...' : '';
        return `${note.substring(0, 12)}${dots}`;
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getComment();
    },
  },
  mounted() {
    this.getComment();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getComment();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getComment() {
      try {
        const { data } = await this.$axios.$get(
          `community/comment/${this.$route.params.id}`
        );
        this.comment = data;
      } catch (e) {
        this.$router.replace('/community/comments');
      }
    },
    statusHandler() {
      this.updateComment();
    },
    async updateComment() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$patch(
          `community/comment/${this.comment.id}`,
          this.comment
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

    // open dialog to details info of comment report
    showDetails(item) {
      this.detailsItem = Object.assign({}, item);
      this.isShowDetailDailog = true;
    },
    closeDialog(type) {
      if (type && type === 'details') {
        this.isShowDetailDailog = false;
        this.detailsItem = Object.assign({}, this.defaultItem);
      }
    },
    async updateReportStatus() {
      try {
        const { message } = await this.$axios.$patch(
          `${process.env.API_URL}/community/report/${this.detailsItem.id}`,
          this.detailsItem
        );
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
        this.isShowDetailDailog = false;
        this.getComment();
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
  },
};
</script>
