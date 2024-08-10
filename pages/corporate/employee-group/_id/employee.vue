<template>
  <div id="employeeList">
    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex xs12>
          <div class="d-flex mt-5">
            <div>
              <h3>{{ groupInfo && groupInfo.name }}</h3>
              <small class="grey--text">
                <v-icon x-small>mdi-factory</v-icon>
                {{
                  groupInfo && groupInfo.company && groupInfo.company.name
                }}</small
              >
            </div>
            <v-spacer />
            <v-btn
              v-can="`create employee`"
              :loading="creating"
              color="primary"
              class="mr-2"
              disabled
            >
              Send SMS/Email
            </v-btn>
            <v-btn
              v-can="`create employee`"
              color="primary"
              @click="newCreateDialogEvent('add')"
            >
              Create Employee
            </v-btn>
            <v-btn
              v-can="`create employee`"
              color="success"
              class="ml-2"
              @click="isShowBulkCreateDailog = true"
            >
              Add Bulk Employees
            </v-btn>
          </div>
        </v-flex>
        <v-flex xs12>
          <v-card>
            <v-card-title class="pa-1">
              <v-text-field
                v-model="search"
                solo
                flat
                prepend-inner-icon="mdi-magnify"
                placeholder="Type something"
                hide-details
              ></v-text-field>
              <div>
                <b-language v-model="language" />
              </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="employeeList"
                :options.sync="pagination"
                :server-items-length="total"
                :loading="loading"
                show-select
                class="elevation-1"
              >
                <template v-slot:item.is_registered="{ item }">
                  {{ item.is_registered ? 'Yes' : 'No' }}
                </template>
                <template v-slot:item.join_date="{ item }">
                  {{ formattedDate(item.join_date) }}
                </template>
                <template v-slot:item.status="{ item }">
                  <v-chip
                    class="white--text"
                    :color="item.status === 'active' ? 'success' : 'warning'"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>
                <template v-slot:item.action="{ item }">
                  <v-btn
                    v-can="`view employee`"
                    icon
                    small
                    fab
                    color="primary"
                    title="View"
                    @click="showDetails(item)"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`update employee`"
                    icon
                    small
                    fab
                    color="teal"
                    title="Edit"
                    @click="editItem(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-can="`delete employee`"
                    icon
                    small
                    fab
                    color="pink"
                    title="Delete"
                    @click="deleteItem(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    <!-- Employee update modal -->
    <v-dialog v-model="isAddOrEditDailog" persistent max-width="500">
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">{{ formTitle }}</span>
          <v-btn
            icon
            dark
            class="ma-0"
            @click.stop="closeDialog('add-or-edit')"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <validation-observer v-slot="{ handleSubmit, invalid, reset }">
          <template v-if="isFormLoaded">
            <v-form
              @submit.prevent="handleSubmit(onSubmit)"
              @reset.prevent="reset"
            >
              <v-card-text class="pb-0">
                <b-text
                  v-model="groupInfo.company.name"
                  outlined
                  label="Company Name"
                  readonly
                  disabled
                />
                <b-text
                  v-model="groupInfo.name"
                  outlined
                  label="Group Name"
                  readonly
                  disabled
                />
                <b-text
                  v-model="editedItem.name"
                  rules="required"
                  outlined
                  label="Name"
                />

                <b-text
                  v-model="editedItem.company_employee_id"
                  outlined
                  label="Company Employee Id"
                />
                <v-row>
                  <v-col md="6" class="py-0">
                    <b-text
                      v-model="editedItem.email"
                      rules="email"
                      outlined
                      label="Email"
                    />
                  </v-col>
                  <v-col md="6" class="py-0">
                    <b-text
                      v-model="editedItem.phone"
                      rules="required|mobile"
                      outlined
                      label="Phone"
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col md="6" class="py-0">
                    <b-text
                      v-model="editedItem.designation"
                      outlined
                      label="Designation"
                    />
                  </v-col>
                  <v-col md="6" class="py-0">
                    <b-date-time
                      v-model="editedItem.join_date"
                      rules="required"
                      outlined
                      label="Joining Date"
                    />
                  </v-col>
                </v-row>

                <active-inactive-dialog
                  v-model="editedItem.status"
                  class="mt-0"
                />
              </v-card-text>
              <v-divider></v-divider>
              <action-button-dialog
                :loading="loading"
                :error="invalid"
                @close="closeDialog('add-or-edit')"
              />
            </v-form>
          </template>
        </validation-observer>
      </v-card>
    </v-dialog>
    <!-- Employee details modal -->
    <v-dialog v-model="isShowDetailDailog" persistent max-width="500">
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Employee Details</span>
          <v-btn icon dark class="ma-0" @click.stop="closeDialog('details')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pt-5">
          <v-simple-table v-if="detailsItem" dense class="mb-5">
            <tbody>
              <tr>
                <th>Name:</th>
                <td>
                  {{ detailsItem.name }}
                  <v-icon
                    v-if="detailsItem.is_registered"
                    color="success"
                    class="ml-5"
                    title="Verified user"
                    >mdi-account-check</v-icon
                  >
                  <v-icon
                    v-else=""
                    color="warning"
                    class="ml-5"
                    title="Not verified user"
                    >mdi-account-alert</v-icon
                  >
                </td>
              </tr>
              <tr>
                <th style="width: 160px">Company Employee Id:</th>
                <td>{{ detailsItem.company_employee_id }}</td>
              </tr>
              <tr>
                <th>Group:</th>
                <td>{{ groupInfo && groupInfo.name }}</td>
              </tr>
              <tr>
                <th>Company:</th>
                <td>
                  {{ groupInfo && groupInfo.company && groupInfo.company.name }}
                </td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{{ detailsItem.phone }}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{{ detailsItem.email }}</td>
              </tr>
              <tr>
                <th>Designation</th>
                <td>{{ detailsItem.designation }}</td>
              </tr>
              <tr>
                <th>Joining Date</th>
                <td>{{ detailsItem.join_date }}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td class="pt-2">
                  <v-chip
                    class="white--text"
                    :color="
                      detailsItem.status === 'active' ? 'success' : 'warning'
                    "
                  >
                    {{ detailsItem.status }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Employee Bulk add modal -->
    <v-dialog v-model="isShowBulkCreateDailog" persistent max-width="650">
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Add Bulk Employees</span>
          <v-btn icon dark class="ma-0" @click.stop="closeDialog('bulk')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-form @submit.prevent="onBulkSubmitHandler" @reset.prevent="reset">
          <v-card-text class="pt-5">
            <v-file-input
              v-model="file"
              label="CSV File"
              placeholder="Select employee list CSV file"
              show-size
              @change="uploadCSVFile(file)"
            ></v-file-input>
          </v-card-text>
          <template v-if="bulkMissingData.length > 0">
            <v-card-text class="pt-2">
              <v-card-title class="pb-0 pt-0">
                Missing name or phone of these employees
              </v-card-title>
              <v-simple-table class="mb-5">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Name</th>
                      <th class="text-left">Email</th>
                      <th class="text-left">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in bulkMissingData" :key="index">
                      <td>{{ item.name }}</td>
                      <td>{{ item.email }}</td>
                      <td>{{ item.phone }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>
          </template>

          <v-divider></v-divider>
          <action-button-dialog
            :error="invalidBulkForm"
            :loading="isBuilkInserting"
            @close="closeDialog('bulk')"
          />
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { confirmationAlert } from '@/plugins/sweetalert';
import { csvFileToJSON } from '@/util';
import { format } from 'date-fns';

export default {
  name: 'EmployeeList',
  data() {
    return {
      language: 'en',
      isAddOrEditDailog: false,
      employeeList: [],
      groupInfo: {},
      selected: [],
      search: '',
      total: 0,
      loading: false,
      isBuilkInserting: false,
      creating: false,
      pagination: {},
      headers: [
        {
          text: 'Employee Id',
          value: 'company_employee_id',
          sortable: false,
        },
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Phone', value: 'phone' },
        { text: 'Designation', value: 'designation' },
        { text: 'Registered', value: 'is_registered' },
        { text: 'Joining_date', value: 'join_date', width: 115 },
        { text: 'Status', value: 'status' },
        {
          text: 'Actions',
          value: 'action',
          sortable: false,
          align: 'center',
          width: 180,
        },
      ],
      itemsPerPageItems: [10, 20, 50, 100],
      editedIndex: -1,
      updating: false,
      isFormLoaded: true,
      editedItem: {
        id: 0,
        name: '',
        email: '',
        phone: '',
        company_employee_id: '',
        designation: '',
        join_date: '',
        group_id: this.$route.params.id,
        company_id: '',
        is_registered: 0,
        status: 'active',
      },
      defaultItem: {
        id: 0,
        name: '',
        email: '',
        phone: '',
        company_employee_id: '',
        designation: '',
        join_date: '',
        group_id: this.$route.params.id,
        company_id: '',
        is_registered: 0,
        status: 'active',
      },
      isShowDetailDailog: false,
      detailsItem: {
        id: 0,
        name: '',
        email: '',
        phone: '',
        company_employee_id: '',
        designation: '',
        join_date: '',
        group_id: this.$route.params.id,
        company_id: '',
        is_registered: 0,
        status: 'active',
      },
      isShowBulkCreateDailog: false,
      file: null,
      invalidBulkForm: true,
      bulkInsertableData: [],
      bulkMissingData: [],
      formattedDate(date) {
        // Here check invalid date
        const matchedZero = date && date.match(/0/g).length;
        if (matchedZero !== 14) return format(new Date(date), 'dd-MMM-yyyy');
        else return '-';
      },
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Employee' : 'Edit Employee';
    },
  },
  watch: {
    // for server side pagination
    pagination() {
      this.getEmployeeListByPagination();
    },
    // for server side search
    search() {
      this.getEmployeeListByPagination();
    },
    language() {
      this.getEmployeeListByPagination();
    },
  },
  mounted() {
    this.getGroupInfo();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getEmployeeListByPagination();
      this.getGroupInfo();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // open dialog to details info of employee
    showDetails(item) {
      this.detailsItem = Object.assign({}, item);
      this.isShowDetailDailog = true;
    },
    // open dialog to edit form of an employee
    editItem(item) {
      this.editedIndex = this.employeeList.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.isAddOrEditDailog = true;
    },
    // open dialog to new form of an employee
    newCreateDialogEvent() {
      this.editedIndex = -1;
      this.isAddOrEditDailog = true;
      this.editedItem.company_id =
        this.groupInfo && this.groupInfo.company && this.groupInfo.company.id;
    },
    onSubmit() {
      let url;
      let method;
      if (this.editedIndex > -1) {
        url = `${this.language}/corporate/employee/${this.editedItem.id}`;
        method = 'PATCH';
        this.updateEmployee(url, method);
      } else {
        url = `${this.language}/corporate/employee`;
        method = 'POST';
        this.updateEmployee(url, method, { actionType: 'new' });
      }
    },
    async uploadCSVFile(file) {
      this.bulkMissingData = [];
      if (
        file &&
        (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel')
      ) {
        const csvData = await csvFileToJSON(file);
        const csvDataLength = csvData.length;
        if (csvDataLength && isValidCSVData(this, csvData, csvDataLength)) {
          this.invalidBulkForm = false;
        }
      } else {
        this.invalidBulkForm = true;
        if (file) {
          this.$toasted.error('Wrong file format! Please select CSV file.');
        }
      }
    },
    onBulkSubmitHandler() {
      this.onBulkSubmit();
    },
    async onBulkSubmit() {
      this.isBuilkInserting = true;
      const url = `${this.language}/corporate/employee/bulk-create`;
      try {
        const { message } = (
          await this.$axios({
            url,
            method: 'POST',
            data: this.bulkInsertableData,
          })
        ).data;

        this.bulkInsertableData = [];
        this.getEmployeeListByPagination();
        this.closeDialog('bulk');
        this.$store.dispatch('crud_success_dialog', message);
        if (message) this.isBuilkInserting = false;
      } catch (err) {
        if (err.response.status === 422) {
          this.isBuilkInserting = false;
          this.$store.commit(
            'APP_NETWORK_ERROR',
            err.response && err.response.data.message
          );
        }
      }
    },
    // add or update employee
    async updateEmployee(url, method, options) {
      try {
        const editedItem = this.editedItem;
        const { message } = (
          await this.$axios({
            url,
            method,
            data: editedItem,
          })
        ).data;

        this.getEmployeeListByPagination();
        this.closeDialog('add-or-edit');
        this.$store.dispatch('crud_success_dialog', message);
      } catch (err) {
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
    closeDialog(type) {
      if (type && type === 'add-or-edit') {
        this.isAddOrEditDailog = false;
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      } else if (type && type === 'details') {
        this.isShowDetailDailog = false;
        this.detailItem = Object.assign({}, this.defaultItem);
      } else if (type && type === 'bulk') {
        this.bulkInsertableData = [];
        this.bulkMissingData = [];
        this.file = null;
        this.isShowBulkCreateDailog = false;
        this.invalidBulkForm = true;
      }
    },
    // get article by pagination
    getEmployeeListByPagination: debounce(async function () {
      this.loading = true;
      let url = `page=${this.pagination.page}&per_page=${this.pagination.itemsPerPage}`;

      // get by search keyword
      if (this.search) {
        url += `&query=${this.search}`;
      }

      // get by search keyword
      const groupId = this.$route.params.id;
      if (groupId) {
        url += `&group_id=${groupId}`;
      }

      // get by sort option
      if (this.pagination.sortBy.length && !this.search) {
        const direction = this.pagination.sortDesc[0] ? 'desc' : 'asc';
        url += `&direction=${direction}&sortBy=${this.pagination.sortBy[0]}`;
      }

      try {
        const { data, meta } = await this.$axios.$get(
          `${this.language}/corporate/employee?${url}`
        );
        this.loading = false;
        this.employeeList = data;
        this.total = meta.total;
      } catch (e) {
        this.loading = false;

        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    }, 500),
    // delete article
    deleteItem(item) {
      confirmationAlert().then((res) => {
        if (res.value) {
          this.deleteEmployee(item.id);
        }
        return false;
      });
    },
    async deleteEmployee(id) {
      try {
        const { message } = await this.$axios.$delete(
          `${this.language}/corporate/employee/${id}`
        );
        this.getEmployeeListByPagination();
        this.$store.commit('CRUD_SUCCESS_NO_ACTION', message);
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    async getGroupInfo() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/corporate/employee-group/${this.$route.params.id}`
        );
        this.groupInfo = data;
      } catch (e) {
        console.log(e);
      }
    },
  },
};

const isValidCSVData = (instance, csvData, totalSize) => {
  const newBulkData = [];
  const missingBulkData = [];
  csvData.forEach((employee) => {
    if (employee && (!employee.name || !employee.phone)) {
      missingBulkData.push(employee);
    } else {
      if (employee.join_date) {
        const joinDate = new Date(employee.join_date);
        employee.join_date = format(joinDate, 'yyyy-dd-MM HH:mm:ss');
      }

      newBulkData.push({
        ...employee,
        group_id: instance.groupInfo.id,
        company_id: instance.groupInfo.company.id,
        status: 'active',
        created_at: new Date(),
      });
    }
  });

  instance.bulkInsertableData = newBulkData;
  instance.bulkMissingData = missingBulkData;

  return !missingBulkData.length;
};
</script>
