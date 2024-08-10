<template>
  <div id="file-manager">
    <v-container>
      <v-card class="mb-4" height="100%">
        <v-navigation-drawer
          v-model="drawer"
          permanent
          absolute
          class="sidebar"
        >
          <v-toolbar dense>
            <v-toolbar-title>File Manager</v-toolbar-title>
          </v-toolbar>
          <scrollbar>
            <v-list dense expand class="pb-4">
              <template v-for="(item, i) in sidebarMenus">
                <v-subheader :key="i + '-title'">
                  {{ item.title }}
                </v-subheader>
                <v-list-item
                  v-for="(menu, index) in item.children"
                  :key="index + '-menu'"
                  @click="sidebarSelected(menu)"
                >
                  <v-list-item-action>
                    <v-icon>{{ menu.icon }}</v-icon>
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title>
                      {{ menu.title }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
              <v-divider />
              <v-subheader>Navigator</v-subheader>
              <v-treeview
                :items="folders"
                activatable
                open-on-click
                return-object
                @update:open="folderSelected"
                @update:active="folderSelected"
              >
                <template #prepend="{ open }">
                  <v-icon>
                    {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                  </v-icon>
                </template>
              </v-treeview>
            </v-list>
          </scrollbar>
        </v-navigation-drawer>

        <div class="content">
          <input
            id="files"
            ref="fileInput"
            type="file"
            name="files"
            class="d-none"
            multiple
            @change="filesSelected($event)"
          />
          <v-toolbar dense class="top-menu">
            <v-btn icon>
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>
              {{ selectedFolder ? selectedFolder.name : 'Files' }}
            </v-toolbar-title>
            <v-btn icon>
              <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>

            <v-spacer></v-spacer>

            <v-text-field
              v-model="search"
              flat
              prepend-inner-icon="mdi-magnify"
              placeholder="Search file or folder..."
              hide-details
            />

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  :disabled="!selectedFolder"
                  v-bind="attrs"
                  v-on="on"
                  @click.stop="fileInput.click()"
                >
                  <v-icon>mdi-cloud-upload</v-icon>
                </v-btn>
              </template>
              <span>Upload</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click.stop="openFolderDialog"
                >
                  <v-icon>mdi-folder-plus</v-icon>
                </v-btn>
              </template>
              <span>New Folder</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn icon :disabled="!selectedFile" v-bind="attrs" v-on="on">
                  <v-icon>mdi-file-move</v-icon>
                </v-btn>
              </template>
              <span>Move File</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  class="clipboard"
                  :disabled="!selectedFile"
                  :data-clipboard-text="selectedFile && selectedFile.url"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi-link-variant</v-icon>
                </v-btn>
              </template>
              <span>Copy Link</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn icon :disabled="!selectedFile" v-bind="attrs" v-on="on">
                  <v-icon>mdi-trash-can</v-icon>
                </v-btn>
              </template>
              <span>Delete</span>
            </v-tooltip>
          </v-toolbar>
          <v-progress-linear v-if="loading" :indeterminate="loading" />
          <v-card v-if="items.length" class="ma-2">
            <v-card-text>
              <v-simple-table>
                <template #default>
                  <thead>
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left">Type</th>
                      <th class="text-left">Size</th>
                      <th class="text-left" width="200">Progress</th>
                      <th class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, i) in items" :key="i">
                      <td>{{ item.file.name }}</td>
                      <td>{{ item.file.type }}</td>
                      <td>{{ fileSize(item.file.size, true) }}</td>
                      <td>
                        <v-progress-linear
                          v-model="item.progress"
                          background-opacity="0.3"
                          height="20"
                          rounded
                          stream
                          striped
                          color="light-blue"
                        >
                          <strong>{{ Math.ceil(item.progress) }}%</strong>
                        </v-progress-linear>
                      </td>
                      <td class="text-center">
                        <v-btn
                          icon
                          fab
                          x-small
                          color="pink"
                          @click="removeFile(i)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>
            <v-divider />
            <v-card-actions class="justify-center">
              <v-btn color="secondary" outlined @click="clearAll">
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                type="button"
                outlined
                :loading="uploading"
                @click="uploadAll"
              >
                Upload
                <v-icon right> mdi-cloud-upload </v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
          <v-container fluid>
            <v-row>
              <v-col cols="12" sm="8" class="file-items-box">
                <scrollbar>
                  <v-list>
                    <v-list-item
                      v-for="(file, index) in files"
                      :key="index"
                      @click="openFile(file)"
                      @contextmenu.prevent="showContextMenu(file, $event)"
                    >
                      <template v-if="file.type === 'folder'">
                        <v-list-item-avatar>
                          <v-icon x-large>mdi-folder</v-icon>
                        </v-list-item-avatar>

                        <v-list-item-content>
                          <v-list-item-title>
                            {{ file.name }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ file.items }} items, {{ file.createdAt }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </template>
                      <template v-else>
                        <template v-if="file.type === 'image'">
                          <v-list-item-avatar rounded>
                            <v-img :src="file.url" />
                          </v-list-item-avatar>
                        </template>
                        <template v-else-if="file.type === 'video'">
                          <v-list-item-avatar>
                            <v-icon x-large>mdi-video</v-icon>
                          </v-list-item-avatar>
                        </template>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ file.name }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ file.size }} | {{ file.createdAt }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </template>
                    </v-list-item>
                  </v-list>
                </scrollbar>
              </v-col>
              <v-col
                v-if="selectedFile"
                cols="12"
                sm="4"
                class="file-details-box"
              >
                <scrollbar>
                  <v-card>
                    <template v-if="selectedFile.type === 'folder'">
                      <v-icon size="100">mdi-folder</v-icon>
                    </template>
                    <template v-else>
                      <v-img :src="selectedFile.url" />
                    </template>
                    <v-list>
                      <v-subheader>Name</v-subheader>
                      <v-divider />
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ selectedFile.name }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <template v-if="selectedFile.type === 'folder'">
                        <v-subheader>Items</v-subheader>
                        <v-divider />
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ selectedFile.items }}
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                      <template v-else>
                        <v-subheader>Size</v-subheader>
                        <v-divider />
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ selectedFile.size }}
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                      <v-subheader>Created At</v-subheader>
                      <v-divider />
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ selectedFile.createdAt }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </scrollbar>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </v-card>
    </v-container>

    <v-menu
      v-model="contextMenu"
      :position-x="contextMenuX"
      :position-y="contextMenuY"
      absolute
      offset-y
    >
      <v-list>
        <v-list-item :disabled="!isFolderItemSelected" @click="renameFile">
          <v-list-item-icon>
            <v-icon> mdi-pencil </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> Rename </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-list-item @click="moveFile">
          <v-list-item-icon>
            <v-icon> mdi-file-move </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> Move </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-list-item
          class="clipboard"
          :data-clipboard-text="selectedFile && selectedFile.url"
          @click="copyLink"
        >
          <v-list-item-icon>
            <v-icon> mdi-link-variant </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> Copy Link </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-list-item color="pink lighten-1" @click="showConfirmDelete">
          <v-list-item-icon>
            <v-icon> mdi-trash-can </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> Delete </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-list-item :disabled="isFolderItemSelected" @click="downloadFile">
          <v-list-item-icon>
            <v-icon> mdi-cloud-download </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title> Download </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">{{ formTitle }}</span>
          <v-btn icon dark class="ma-0" @click.stop="closeFolderDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <validation-observer
          ref="folderForm"
          v-slot="{ handleSubmit, invalid, reset }"
        >
          <v-form
            @submit.prevent="handleSubmit(showConfirmCreateOrRename)"
            @reset.prevent="reset"
          >
            <v-card-text>
              <b-text
                v-model="editedItem.name"
                rules="required"
                outlined
                label="Name"
              />
            </v-card-text>
            <v-divider />
            <action-button-dialog
              :loading="creating"
              :error="invalid"
              @close="closeFolderDialog"
            />
          </v-form>
        </validation-observer>
      </v-card>
    </v-dialog>

    <!-- Modal/Dialog of moving file/folder -->
    <v-dialog v-model="isShowMovingDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Moving</span>
          <v-btn icon dark class="ma-0" @click.stop="closeMovingDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-form @submit.prevent="showConfirmMoving">
          <v-card-text>
            <v-sheet class="pa-4 lighten-2">
              <v-row>
                <v-col cols="4">
                  <div>
                    <strong>{{ moveableFileOrFolderName }}</strong>
                    <v-icon>mdi-arrow-right</v-icon>
                  </div>
                </v-col>
                <v-col cols="8">
                  <v-text-field
                    v-model="searchMovingTo"
                    label="Folder name"
                    placeholder="Search moving to folder"
                    outlined
                    clear-icon="mdi-close-circle-outline"
                    hide-details
                    clearable
                  ></v-text-field>
                  <scrollbar style="max-height: 400px">
                    <v-treeview
                      :items="folders"
                      :active.sync="movingToFolder"
                      activatable
                      return-object
                      :search="searchMovingTo"
                    >
                      <template #prepend="{ open }">
                        <v-icon>
                          {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                        </v-icon>
                      </template>
                    </v-treeview>
                  </scrollbar>
                </v-col>
              </v-row>
            </v-sheet>
          </v-card-text>
          <v-divider />
          <action-button-dialog
            :error="!(movingToFolder.length > 0)"
            @close="closeMovingDialog"
          />
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Clipboard from 'clipboard';
import {
  defineComponent,
  ref,
  useContext,
  nextTick,
  onMounted,
  watch,
  computed,
} from '@nuxtjs/composition-api';

import { confirmationAlert } from '@/plugins/sweetalert';

export default defineComponent({
  name: 'FileManager',
  setup(props, { emit }) {
    const { $axios, store, $config, $toasted } = useContext();

    const sidebarMenus = ref([
      {
        title: 'Base',
        children: [
          { title: 'Files', icon: 'mdi-file-multiple', type: 'file' },
          { title: 'Recent Uploads', icon: 'mdi-cloud-upload', type: 'recent' },
          { title: 'Trash', icon: 'mdi-trash-can', type: 'trash' },
        ],
      },
    ]);

    const folders = ref();
    const files = ref();
    const loading = ref(false);
    const selectedFolder = ref();
    const selectedFile = ref();
    const isFolderItemSelected = ref(false);
    const drawer = ref(true);
    const search = ref();
    const items = ref([]);
    const fileInput = ref();
    const uploading = ref(false);
    const creating = ref(false);
    const managerDialog = ref(false);
    const dialog = ref(false);
    const searchMovingTo = ref();
    const isShowMovingDialog = ref(false);
    const movingToFolder = ref([]);
    const moveableFileOrFolderName = ref();
    const editedIndex = ref(-1);
    const formTitle = computed(() => {
      return editedIndex.value === -1 ? 'Create Folder' : 'Edit Folder';
    });
    const editedItem = ref({
      name: '',
    });
    const folderForm = ref();
    const contextMenu = ref(false);
    const contextMenuX = ref(0);
    const contextMenuY = ref(0);
    const innerValue = ref(null);
    const error = ref();

    watch(
      () => props.value,
      (val) => {
        if (val) {
          innerValue.value = val;
        }
      }
    );

    onMounted(() => {
      // initiate clipboard
      const clipboard = new Clipboard('.clipboard');
      clipboard.on('success', (e) => {
        store.commit('CRUD_SUCCESS_NO_ACTION', 'Copied to clipboard!');
        e.clearSelection();
      });

      if (props.value) {
        innerValue.value = props.value;
      }

      getFolders();
      window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
        getFolders();
      });
    });

    // methods
    const useFile = () => {
      emit('input', selectedFile.value.url);
      innerValue.value = selectedFile.value.url;
    };

    const sidebarSelected = (menu) => {
      if (menu.type === 'file') {
        selectedFolder.value = null;
        files.value = [];
      }
    };

    const folderSelected = (event) => {
      if (event.length) {
        selectedFolder.value = event.slice(-1).pop();
        nextTick(() => getFiles(selectedFolder.value.id));
      }
    };

    const showContextMenu = (file, event) => {
      contextMenu.value = false;
      contextMenuX.value = event.clientX;
      contextMenuY.value = event.clientY;
      nextTick(() => {
        selectedFile.value = file;
        contextMenu.value = true;

        isFolderItemSelected.value = file && file.type === 'folder';
      });
    };

    const renameFile = () => {
      if (selectedFile && selectedFile.value.type === 'folder') {
        editedItem.value = Object.assign({}, selectedFile.value);
        editedIndex.value = files.value.findIndex(
          (item) => item.id === selectedFile.value.id
        );

        nextTick(() => (dialog.value = true));
      }
    };

    // Confirm moving dialog
    const showConfirmMoving = () => {
      if (selectedFile && movingToFolder.value[0]) {
        let message = `You won't see this file and won't be able to revert this!`;
        if (selectedFile && selectedFile.value.type === 'folder') {
          message = `You won't see files of '${selectedFile.value.name}' and won't be able to revert this!`;
        }
        confirmationAlert(message, 'Yes, moving').then((res) => {
          if (res.value) {
            movingFolderOrFile();
          }
          return false;
        });
      }
    };

    const movingFolderOrFile = async () => {
      const selectedItem = selectedFile.value;
      const movingItem = movingToFolder.value[0];

      try {
        let url = 'folder';
        if (selectedItem.type === 'folder') {
          url = `folder/move/${selectedItem.id}`;
        }
        const { message } = await $axios.$post(
          `${$config.fileApiUrl}/${url}`,
          movingItem
        );
        // Refresh folders and files directory
        await getFolders();
        await getFiles(selectedItem.parent_id);
        closeMovingDialog();
        store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (err) {
        store.commit(
          'APP_NETWORK_ERROR',
          err.response && err.response.data.message
        );
      }
    };

    const moveFile = () => {
      moveableFileOrFolderName.value = selectedFile.value.name;
      nextTick(() => (isShowMovingDialog.value = true));
    };

    const closeMovingDialog = () => {
      isShowMovingDialog.value = false;
      nextTick(() => {
        searchMovingTo.value = null;
      });
    };

    const copyLink = () => {};

    // Confirm Delete dialog
    const showConfirmDelete = () => {
      if (selectedFile) {
        let message = `You won't see this file and won't be able to revert this!`;
        if (selectedFile && selectedFile.value.type === 'folder') {
          message = `You won't see files of '${selectedFile.value.name}' and won't be able to revert this!`;
        }
        confirmationAlert(message).then((res) => {
          if (res.value) {
            deleteFile();
          }
          return false;
        });
      }
    };

    const deleteFile = async () => {
      let url;
      let folder = false;
      if (selectedFile && selectedFile.value.type === 'folder') {
        url = `folder/${selectedFile.value.id}?folder_names=${selectedFile.value.parent_folder}/${selectedFile.value.slug}`;
        folder = true;
      } else {
        url = `file/${selectedFile.value.id}`;
        folder = false;
      }

      try {
        const { message } = await $axios.$delete(
          `${$config.fileApiUrl}/${url}`
        );

        if (folder) {
          await getFolders();
          await getFiles(selectedFile.value.parent_id);
        } else {
          await getFiles(selectedFile.value.folder_id);
        }
        store.commit('CRUD_SUCCESS_NO_ACTION', message);
        selectedFile.value = null;
      } catch (err) {
        store.commit(
          'APP_NETWORK_ERROR',
          err.response && err.response.data.message
        );
      }
    };

    const downloadFile = () => {
      let url;
      if (selectedFile && selectedFile.value.type === 'folder') {
        url = `folder/${selectedFile.value.id}?folder_names=${selectedFile.value.parent_folder}/${selectedFile.value.slug}&folder_ids=${selectedFile.value.id}`;
      } else {
        url = `file/download?path=${selectedFile.value.path}`;
      }
      try {
        $axios({
          url: `${$config.fileApiUrl}/${url}`,
          method: 'GET',
          responseType: 'blob',
        }).then((response) => {
          const fileURL = window.URL.createObjectURL(new Blob([response.data]));
          const fileLink = document.createElement('a');

          fileLink.href = fileURL;
          fileLink.setAttribute('download', selectedFile.value.name);
          document.body.appendChild(fileLink);
          fileLink.click();
        });
      } catch (err) {
        store.commit(
          'APP_NETWORK_ERROR',
          err.response && err.response.data.message
        );
      }
    };

    const showFile = () => {};

    const closeManagerDialog = () => {
      nextTick(() => (managerDialog.value = false));
      drawer.value = true;
    };

    const removeImage = () => {
      innerValue.value = null;
      error.value = null;
    };

    const openFolderDialog = () => {
      if (selectedFolder.value) {
        const parentFolder = selectedFolder.value.parent_id
          ? `${selectedFolder.value.parent_folder}/${selectedFolder.value.slug}`
          : selectedFolder.value.slug;
        editedItem.value = Object.assign(
          {},
          {
            parent_id: selectedFolder.value.id,
            parent_folder: parentFolder,
          }
        );
      }
      nextTick(() => (dialog.value = true));
    };

    const closeFolderDialog = () => {
      dialog.value = false;
      editedItem.value = Object.assign({}, { name: '' });
      editedIndex.value = -1;
      nextTick(() => folderForm.value.reset());
    };

    // Confirm edit dialog
    const showConfirmCreateOrRename = () => {
      if (
        selectedFile &&
        editedIndex.value > -1 &&
        selectedFile.value.name !== editedItem.value.name
      ) {
        let message = `You won't see this file and would be able to revert this!`;
        if (selectedFile && selectedFile.value.type === 'folder') {
          message = `You won't see files of '${selectedFile.value.name}' and would be able to revert this!`;
        }
        confirmationAlert(message, 'Yes, rename').then((res) => {
          if (res.value) {
            createOrUpdateFolder();
          }
          return false;
        });
      } else if (
        editedIndex.value > -1 &&
        selectedFile.value.name === editedItem.value.name
      ) {
        closeFolderDialog();
      } else {
        createOrUpdateFolder();
      }
    };

    const createOrUpdateFolder = async () => {
      try {
        let url = 'folder';
        if (editedIndex.value > -1) {
          url = `folder/${selectedFile.value.id}`;
        }
        const { message } = await $axios.$post(
          `${$config.fileApiUrl}/${url}`,
          editedItem.value
        );
        // Refresh folders and files directory
        await getFolders();
        await getFiles(editedItem.value.parent_id);
        // if (editedIndex.value > -1) {
        //   await getFiles(selectedFile.value.parent_id);
        // }
        closeFolderDialog();
        store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (err) {
        store.commit(
          'APP_NETWORK_ERROR',
          err.response && err.response.data.message
        );
      }
    };

    const openFile = (file) => {
      selectedFile.value = file;
    };

    const fileSize = (bytes, binary = false) => {
      const base = binary ? 1024 : 1000;
      if (bytes < base) {
        return `${bytes} B`;
      }

      const prefix = binary ? ['Ki', 'Mi', 'Gi'] : ['k', 'M', 'G'];
      let unit = -1;
      while (Math.abs(bytes) >= base && unit < prefix.length - 1) {
        bytes /= base;
        ++unit;
      }
      return `${bytes.toFixed(1)} ${prefix[unit]}B`;
    };

    const filesSelected = (e) => {
      const files = e.target.files;
      for (const file of files) {
        items.value.push({
          file,
          progress: 0,
          source: $axios.CancelToken.source(),
        });
      }
    };

    const removeFile = (index) => {
      if (items.value.length) {
        const item = items.value[index];
        item && item.source && item.source.cancel('Request Canceled!');
      }
      items.value.splice(index, 1);
    };

    const clearAll = () => {
      if (items.value.length) {
        items.value.forEach((item) => {
          item.source && item.source.cancel('Request Canceled!');
        });
      }
      items.value = [];
    };

    const uploadAll = () => {
      uploading.value = true;
      const requests = [];
      items.value.forEach((item, index) => {
        requests.push(upload(item, index));
      });
      Promise.all(requests)
        .then(() => {
          uploading.value = false;
          items.value = [];
        })
        .catch(() => (uploading.value = false))
        .finally(() => getFiles(selectedFolder.value.id));
    };

    const getFolders = async () => {
      loading.value = true;
      try {
        const { data } = await $axios.$get(`${$config.fileApiUrl}/folder`);
        folders.value = data;
        loading.value = false;
      } catch (err) {
        loading.value = false;
        store.commit(
          'APP_NETWORK_ERROR',
          err.response && err.response.data.message
        );
      }
    };

    const getFiles = async (folderId) => {
      loading.value = true;
      try {
        const { data } = await $axios.$get(
          `${$config.fileApiUrl}/folder/${folderId}`
        );
        loading.value = false;
        files.value = data;
      } catch (err) {
        loading.value = false;
        store.commit(
          'APP_NETWORK_ERROR',
          err.response && err.response.data.message
        );
      }
    };

    const upload = async (item, index) => {
      try {
        const formData = new FormData();
        if (selectedFolder.value) {
          const folder = selectedFolder.value.parent_id
            ? `${selectedFolder.value.parent_folder}/${selectedFolder.value.slug}`
            : selectedFolder.value.slug;
          const folderId = selectedFolder.value.id;

          formData.append('folder', folder);
          formData.append('folder_id', folderId);
        }

        formData.append('file', item.file);

        const { message } = await $axios.$post(
          `${$config.fileApiUrl}/file`,
          formData,
          {
            onUploadProgress(event) {
              const { loaded, total } = event;
              item.progress = Math.round((loaded * 100) / total);
            },
            cancelToken: item.source.token,
          }
        );
        items.value.splice(index, 1);
        store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (err) {
        if ($axios.isCancel(err)) {
          store.commit('APP_NETWORK_ERROR', err.message);
        } else if (err.response.status === 422) {
          const { errors } = err.response.data;
          const fields = Object.values(errors);
          for (let i = 0; i < fields.length; i++) {
            for (let j = 0; j < fields[i].length; j++) {
              $toasted.global.form_error(fields[i][j]);
            }
          }
        } else {
          store.commit(
            'APP_NETWORK_ERROR',
            err.response && err.response.data.message
          );
        }
      }
    };

    return {
      sidebarMenus,
      loading,
      folders,
      isFolderItemSelected,
      selectedFolder,
      selectedFile,
      drawer,
      search,
      files,
      openFile,
      items,
      fileSize,
      fileInput,
      filesSelected,
      removeFile,
      uploading,
      clearAll,
      uploadAll,
      creating,
      managerDialog,
      closeManagerDialog,
      dialog,
      openFolderDialog,
      closeFolderDialog,
      showConfirmCreateOrRename,
      createOrUpdateFolder,
      formTitle,
      editedItem,
      editedIndex,
      folderForm,
      contextMenu,
      contextMenuX,
      contextMenuY,
      showContextMenu,
      renameFile,
      moveFile,
      showConfirmMoving,
      searchMovingTo,
      isShowMovingDialog,
      movingToFolder,
      moveableFileOrFolderName,
      closeMovingDialog,
      copyLink,
      showConfirmDelete,
      deleteFile,
      downloadFile,
      showFile,
      folderSelected,
      sidebarSelected,
      innerValue,
      error,
      removeImage,
      useFile,
    };
  },
});
</script>

<style lang="scss" scoped>
#file-manager {
  position: relative;
  height: calc(100vh - 196px);
  .container {
    position: relative;
    height: 100%;
  }
  .content {
    padding: 0 0 0 256px;
  }

  .file-items-box,
  .file-details-box {
    height: calc(100vh - 280px);
    overflow-y: auto;
  }
}
</style>
