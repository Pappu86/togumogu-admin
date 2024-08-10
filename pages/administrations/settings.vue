<template>
  <div id="setting">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card>
            <v-tabs v-model="tab">
              <v-tabs-slider color="primary"></v-tabs-slider>
              <v-tab v-for="(item, index) in settings" :key="index">
                {{ index }}
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item v-for="(items, category) in settings" :key="category">
                <v-data-table
                  :headers="headers"
                  :items="items"
                  :loading="loading"
                  hide-default-footer
                  class="elevation-1"
                >
                  <template v-slot:item.updated_at="{ item }">
                    {{ item.updated_at | toDayDateTimeString }}
                  </template>
                  <template v-slot:item.action="{ item }">
                    <v-btn
                      depressed
                      outlined
                      icon
                      fab
                      dark
                      color="primary"
                      small
                      @click="editItem(item)"
                    >
                      <v-icon> mdi-pencil </v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tab-item>
            </v-tabs-items>
          </v-card>

          <!-- edit key value -->
          <v-dialog v-model="dialog" max-width="500px" persistent>
            <v-card>
              <v-card-title class="justify-space-between primary white--text">
                <span class="headline">Edit Settings</span>
                <v-btn icon dark class="ma-0" @click.stop="closeDialog">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-card-title>
              <v-form @submit.prevent="updateSetting">
                <v-card-text>
                  <v-text-field
                    v-model="editedItem.key"
                    label="Key"
                    readonly
                    disabled
                  ></v-text-field>
                  <v-text-field
                    v-model="editedItem.label"
                    v-validate="'required'"
                    :error-messages="errors && errors.collect('label')"
                    label="Label"
                    data-vv-name="label"
                    required
                  ></v-text-field>
                  <template v-if="typeText">
                    <v-text-field
                      v-model="editedItem.value"
                      v-validate="'required'"
                      :error-messages="errors && errors.collect('value')"
                      label="Value"
                      data-vv-name="value"
                      required
                    ></v-text-field>
                  </template>
                  <template v-if="typeTextarea">
                    <v-textarea
                      v-model="editedItem.value"
                      v-validate="'required'"
                      :error-messages="errors && errors.collect('value')"
                      label="Value"
                      data-vv-name="value"
                      required
                    ></v-textarea>
                  </template>
                  <template v-if="typeBoolean">
                    <v-switch
                      v-model="editedItem.value"
                      color="primary"
                      class="text-capitalize"
                      true-value="true"
                      false-value="false"
                      :label="`${editedItem.value}`"
                    />
                  </template>
                  <template v-if="typeImage">
                    <v-text-field
                      v-model="image"
                      label="Select Image"
                      append-icon="mdi-attachment"
                      readonly
                      @click="$refs.image.click()"
                    ></v-text-field>
                    <input
                      ref="image"
                      type="file"
                      style="display: none"
                      accept="image/*"
                      @change="imageFileOnChange"
                    />
                  </template>
                  <template v-if="typeFile">
                    <v-text-field
                      v-model="file"
                      label="Select File"
                      append-icon="mdi-attachment"
                      readonly
                      @click="$refs.file.click()"
                    ></v-text-field>
                    <input
                      ref="file"
                      type="file"
                      style="display: none"
                      @change="fileOnChange"
                    />
                  </template>
                </v-card-text>
                <v-divider />
                <action-button-dialog
                  :loading="loading"
                  :error="errors && errors.any()"
                  @close="closeDialog"
                />
              </v-form>
            </v-card>
          </v-dialog>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      settings: [],
      tab: null,
      loading: false,
      dialog: false,
      typeText: false,
      typeImage: false,
      typeFile: false,
      typeBoolean: false,
      typeTextarea: false,
      errors: null,
      headers: [
        { text: 'Key', value: 'key' },
        { text: 'Label', value: 'label' },
        { text: 'Value', value: 'value' },
        { text: 'Updated At', value: 'updated_at' },
        { text: 'Actions', value: 'action', sortable: false, align: 'center' },
      ],
      editedItem: {
        id: 0,
        key: '',
        label: '',
        type: 'text',
        value: '',
      },
      defaultItem: {
        id: 0,
        key: '',
        label: '',
        type: 'text',
        value: '',
      },
      image: null,
      imageFormData: new FormData(),
      file: null,
      fileFormData: new FormData(),
    };
  },
  mounted() {
    this.getSettings();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getSettings());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getSettings() {
      this.loading = true;
      try {
        const data = await this.$axios.$get(`${process.env.API_URL}/settings`);
        this.loading = false;
        this.settings = data;
      } catch (e) {
        this.loading = false;
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // edit item
    editItem(item) {
      const type = item.type;
      switch (type) {
        case 'text':
          this.typeText = true;
          break;
        case 'textarea':
          this.typeTextarea = true;
          break;
        case 'boolean':
          this.typeBoolean = true;
          break;
        case 'image':
          this.typeImage = true;
          break;
        case 'file':
          this.typeFile = true;
          break;
        default:
          this.typeText = true;
          break;
      }
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
      this.editedItem = Object.assign({}, this.defaultItem);
      setTimeout(() => {
        this.typeText = false;
        this.typeTextarea = false;
        this.typeBoolean = false;
        this.typeImage = false;
        this.typeFile = false;
        this?.errors?.clear();
        Object.keys(this.imageFormData).forEach((key) =>
          this.imageFormData.delete(key)
        );
        Object.keys(this.fileFormData).forEach((key) =>
          this.fileFormData.delete(key)
        );
        this.image = null;
        this.file = null;
      }, 300);
    },
    updateSetting() {
      // this.$validator.validateAll().then((res) => {
      //   if (res) {
      const type = this.editedItem.type;
      if (type === 'file' || type === 'image') {
        this.updateImageOrFileSettingIntoServer();
      } else {
        this.updateSettingIntoServer();
      }
      //   }
      //   return false;
      // }); }
      //   return false;
      // });
    },
    // update setting into server
    async updateSettingIntoServer() {
      this.loading = true;
      try {
        const { message } = await this.$axios.$patch(
          `${process.env.API_URL}/settings/${this.editedItem.id}`,
          this.editedItem
        );
        // get common settings
        this.$store.dispatch('get_common_settings');
        this.closeDialog();
        this.getSettings();
        this.loading = false;
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (err) {
        this.loading = false;
        if (err.response && err.response.status === 422) {
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
    imageFileOnChange(e) {
      const files = e.target.files || e.dataTransfer.files;
      this.image = files[0].name;
      const key = this.editedItem.key;
      this.imageFormData.append(key, files[0]);
    },
    fileOnChange(e) {
      const files = e.target.files || e.dataTransfer.files;
      this.file = files[0].name;
      const key = this.editedItem.key;
      this.fileFormData.append(key, files[0]);
    },
    // update image or file setting into server
    async updateImageOrFileSettingIntoServer() {
      this.loading = true;
      let formData = this.imageFormData;
      let url = `${process.env.API_URL}/settings-image/${this.editedItem.id}`;
      if (this.editedItem.type === 'file') {
        formData = this.fileFormData;
        url = `${process.env.API_URL}/settings-file/${this.editedItem.id}`;
      }
      Object.keys(this.editedItem).forEach((key) =>
        formData.append(key, this.editedItem[key])
      );
      formData.append('_method', 'PATCH');
      try {
        const { message } = await this.$axios.$post(url, formData);
        // get common settings
        this.$store.dispatch('get_common_settings');
        this.closeDialog();
        this.getSettings();
        this.loading = false;
        window.location.reload();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (err) {
        this.loading = false;
        if (err.response && err.response.status === 422) {
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
