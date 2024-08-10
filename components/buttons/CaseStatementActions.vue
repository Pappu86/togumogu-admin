<template>
  <v-menu transition="slide-x-transition" bottom left offset-y>
    <template v-slot:activator="{ on }">
      <v-btn icon v-on="on">
        <v-icon color="primary">mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list class="pa-0">
      <v-list-tile @click="download">
        <v-list-tile-action>
          <v-icon color="info">mdi-attachment</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ $t('case_statement.download') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-divider />
      <v-list-tile v-if="update" nuxt :to="to">
        <v-list-tile-action>
          <v-icon color="teal">mdi-pencil</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ $t('button.edit') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-divider />
      <v-list-tile v-if="deleteAction" @click="deleteItem">
        <v-list-tile-action>
          <v-icon color="pink">mdi-delete</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ $t('button.delete') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-divider />
      <v-list-tile v-if="update" :to="nextLink">
        <v-list-tile-action>
          <v-icon color="primary">mdi-clock</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ $t('case_statement.add_next_date') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-divider />
      <v-list-tile @click="markAsDismiss">
        <v-list-tile-action>
          <v-icon color="warning">mdi-close</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ $t('case_statement.mark_as_dismiss') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: 'CaseStatementActoins',
  props: {
    to: {
      type: String,
      default: '/case-statements',
    },
    nextLink: {
      type: String,
      default: '/case-statements',
    },
    update: {
      type: Boolean,
      default: true,
    },
    deleteAction: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    // emit delete event
    deleteItem() {
      this.$emit('deleteItem');
    },
    download() {
      this.$emit('download');
    },
    markAsDismiss() {
      this.$emit('markAsDismiss');
    },
  },
};
</script>
