<template>
  <div id="costs">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <div style="display: flex">
            <h3>Delivery Cost Tree</h3>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <h4>Division Tree</h4>
            </v-card-title>
            <v-divider />
            <v-sheet class="pa-4 primary lighten-2">
              <v-text-field
                v-model="division"
                label="Search Area"
                dark
                flat
                solo-inverted
                hide-details
                clearable
                clear-icon="mdi-close-circle-outline"
              ></v-text-field>
            </v-sheet>
            <scrollbar style="height: 500px">
              <v-treeview
                v-model="areas"
                :items="divisions"
                :search="division"
                selectable
                return-object
                color="primary"
              ></v-treeview>
            </scrollbar>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <h4>Selected Areas</h4>
            </v-card-title>
            <v-divider />
            <validation-observer
              ref="form"
              v-slot="{ handleSubmit, invalid, reset }"
              tag="div"
            >
              <v-form
                @submit.prevent="handleSubmit(onSubmit)"
                @reset.prevent="reset"
              >
                <v-card-text>
                  <scrollbar style="height: 375px">
                    <v-simple-table>
                      <tbody>
                        <tr v-for="area in areas" :key="area.id">
                          <td>{{ area.name }}</td>
                        </tr>
                      </tbody>
                    </v-simple-table>
                  </scrollbar>
                </v-card-text>
                <v-divider />
                <v-card-text>
                  <b-text
                    v-model="editedItem.cost"
                    rules="required|decimal:2"
                    outlined
                    label="Cost"
                  />

                  <b-text
                    v-model="editedItem.cart_amount"
                    rules="decimal:2"
                    outlined
                    label="Cart amount"
                  />

                  <b-text
                    v-model="editedItem.special_delivery_cost"
                    rules="decimal:2"
                    outlined
                    label="Special delivery cost"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn class="seconday" @click="resetForm"> Cancel </v-btn>
                  <v-btn
                    type="submit"
                    :loading="creating"
                    :disabled="invalid"
                    class="primary"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-form>
            </validation-observer>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'ShippingCostTree',
  data() {
    return {
      language: 'en',
      costs: [],
      loading: false,
      creating: false,
      division: '',
      divisions: [],
      editedItem: {
        area_ids: [],
        cost: '',
        cart_amount: '0',
        special_delivery_cost: '0',
      },
      defaultItem: {
        area_ids: [],
        cost: '',
        cart_amount: '0',
        special_delivery_cost: '0',
      },
      areas: [],
    };
  },
  mounted() {
    this.getDivisions();

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getDivisions();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // reset form
    resetForm() {
      this.areas = [];
      this.editedItem = Object.assign({}, this.defaultItem);
      this.$refs.form.reset();
    },
    // update area
    async onSubmit() {
      this.editedItem.area_ids = [];
      if (this.areas.length) {
        this.areas.forEach((item) => this.editedItem.area_ids.push(item.id));
        await this.update();
      } else {
        this.$store.commit('APP_NETWORK_ERROR', 'Please select any area');
      }
    },
    // create bulk cost
    async update() {
      this.creating = true;
      try {
        const { message } = await this.$axios.$post(
          `shipping/cost-bulk`,
          this.editedItem
        );
        this.creating = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/shipping/costs',
        });
      } catch (err) {
        this.creating = false;
        if (err.response.status === 422) {
          const { errors } = err.response.data;
          this.$refs.form.setErrors(errors);
        } else {
          this.$store.commit(
            'APP_NETWORK_ERROR',
            err.response && err.response.data.message
          );
        }
      }
    },
    async getDivisions() {
      try {
        const { data } = await this.$axios.$get(`shipping/division-tree`);
        this.divisions = data;
      } catch (e) {}
    },
  },
};
</script>
