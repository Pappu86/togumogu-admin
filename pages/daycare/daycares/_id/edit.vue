<template>
  <div id="daycareEntry">
    <v-progress-linear v-if="loading" :indeterminate="loading" />
    <validation-observer v-slot="{ handleSubmit, invalid, reset }">
      <v-form v-if="daycare" @reset.prevent="reset">
        <v-container grid-list-xl fluid>
          <v-row>
            <!-- Start edit left section-->
            <v-col cols="12" sm="8">
              <v-card>
                <v-card-title>
                  <h4>Edit Daycare</h4>
                  <v-spacer></v-spacer>
                  <v-chip
                    class="white--text"
                    :color="daycare.status === 'active' ? 'success' : 'warning'"
                  >
                    {{ daycare.status }}
                  </v-chip>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-sheet elevation="0" tag="section" class="pa-2 mb-5 pb-5">
                    <b-text
                      v-model="daycare.name"
                      rules="required|min:5|max:180"
                      outlined
                      label="Name"
                      counter="180"
                      @blur="checkSlug"
                    />
                    <b-text
                      v-model="daycare.slug"
                      rules="required"
                      outlined
                      label="Slug"
                    />
                    <b-text-area
                      v-model="daycare.description"
                      rules="required|min:10|max:300"
                      outlined
                      label="Description"
                      counter="300"
                    />
                    <v-subheader>Content</v-subheader>
                    <b-rich-text-editor
                      v-model="daycare.content"
                      editor-id="daycareContent"
                      class-name="mt-4"
                    />
                  </v-sheet>
                  <v-divider class="mb-5 pb-2" />
                  <v-sheet elevation="0" tag="section" class="pa-2 mb-4">
                    <v-row>
                      <v-col cols="12" sm="4" class="py-0">
                        <b-text
                          v-model="daycare.code"
                          outlined
                          label="Daycare Code"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="4" class="py-0">
                        <v-dialog
                          ref="tRFromdialog"
                          v-model="timeRangeFromTimeModal"
                          :return-value.sync="tRFromTime"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="tRFromTime"
                              label="Daily Time (From)"
                              prepend-icon="mdi-clock-time-four-outline"
                              readonly
                              v-bind="attrs"
                              outlined
                              hide-details
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-time-picker
                            v-if="timeRangeFromTimeModal"
                            v-model="tRFromTime"
                            ampm-in-title
                            format="ampm"
                            full-width
                          >
                            <v-spacer></v-spacer>
                            <v-btn
                              text
                              color="primary"
                              @click="timeRangeFromTimeModal = false"
                            >
                              Cancel
                            </v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.tRFromdialog.save(tRFromTime)"
                            >
                              OK
                            </v-btn>
                          </v-time-picker>
                        </v-dialog>
                      </v-col>
                      <v-col cols="12" sm="4" class="py-0">
                        <v-dialog
                          ref="tRTodialog"
                          v-model="timeRangeToTimeModal"
                          :return-value.sync="tRToTime"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="tRToTime"
                              label="Daily Time (To)"
                              prepend-icon="mdi-clock-time-four-outline"
                              readonly
                              v-bind="attrs"
                              outlined
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-time-picker
                            v-if="timeRangeToTimeModal"
                            v-model="tRToTime"
                            ampm-in-title
                            format="ampm"
                            full-width
                          >
                            <v-spacer></v-spacer>
                            <v-btn
                              text
                              color="primary"
                              @click="timeRangeToTimeModal = false"
                              >Cancel</v-btn
                            >
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.tRTodialog.save(tRToTime)"
                              >OK</v-btn
                            >
                          </v-time-picker>
                        </v-dialog>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <v-card-subtitle class="pa-0 py-0 pb-3">
                          <h4>Age Range</h4>
                        </v-card-subtitle>
                        <v-divider />
                      </v-col>
                      <v-divider />
                      <v-col cols="12" sm="3">
                        <b-text
                          v-model="aRFromAge"
                          rules="numeric"
                          outlined
                          label="From"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="3">
                        <v-select
                          v-model="aRFromPeriod"
                          :items="agePeriods"
                          label="Age Period"
                          outlined
                          hide-details
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="3">
                        <b-text
                          v-model="aRToAge"
                          rules="numeric"
                          outlined
                          label="To"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="3">
                        <v-select
                          v-model="aRToPeriod"
                          :items="agePeriods"
                          label="Age Period"
                          outlined
                          hide-details
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" md="12" sm="12">
                        <v-card-subtitle class="pl-0 pr-0 pb-3">
                          <h4>Opening Days</h4>
                        </v-card-subtitle>
                        <v-divider />
                        <v-list class="horizontal">
                          <v-list-item
                            v-for="(openingDay, dayIndex) in getOpeningDays"
                            :key="openingDay + dayIndex"
                            class="horizontal-item pl-0"
                          >
                            <v-checkbox
                              v-model="daycare.opening_days"
                              :label="openingDay.label"
                              :value="openingDay.value"
                              hide-details
                            ></v-checkbox>
                          </v-list-item>
                        </v-list>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" md="12" sm="12">
                        <v-card-subtitle class="pa-0 py-0 pb-3">
                          <h4>Daycare Fees</h4>
                        </v-card-subtitle>
                        <v-divider />
                      </v-col>
                    </v-row>
                    <v-simple-table dense>
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-left">Frontend Label</th>
                            <th class="text-left">Fee Amount</th>
                            <th class="text-left">Period</th>
                            <th class="text-center" style="width: 165px">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(fee, k) in daycare.fees" :key="k">
                            <td>
                              <b-text
                                v-model="fee.fee_text"
                                class="pt-3 pb-3"
                                outlined
                                label="Label Text"
                                hide-details
                                dense
                              />
                            </td>
                            <td>
                              <b-text
                                v-model="fee.fee_amount"
                                class="pt-3 pb-3"
                                rules="decimal"
                                outlined
                                label="Amount"
                                hide-details
                                dense
                              />
                            </td>
                            <td>
                              <v-select
                                v-model="fee.fee_period"
                                class="pt-3 pb-3"
                                :items="periods"
                                label="Select Period"
                                outlined
                                hide-details
                                dense
                              ></v-select>
                            </td>
                            <td class>
                              <v-btn
                                class="decor"
                                color="blue"
                                @click.stop="addRow()"
                              >
                                <v-icon>mdi-plus</v-icon>
                              </v-btn>
                              <v-btn
                                class="decor"
                                color="red"
                                @click.stop="removeRow(k, fee)"
                              >
                                <v-icon>mdi-minus</v-icon>
                              </v-btn>
                            </td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-sheet>
                  <v-divider class="mb-5 pb-2 mt-5" />
                  <v-sheet elevation="0" tag="section" class="pa-2">
                    <b-text
                      v-model="daycare.meta_title"
                      rules="min:5|max:180"
                      outlined
                      label="Meta Title"
                      counter="180"
                    />
                    <b-text-area
                      v-model="daycare.meta_description"
                      rules="min:10"
                      outlined
                      label="Meta Description"
                      counter="300"
                    />
                    <b-text-area
                      v-model="daycare.meta_keyword"
                      rules="min:10"
                      outlined
                      label="Meta Keyword"
                      counter="300"
                    />
                  </v-sheet>
                  <v-sheet
                    v-if="daycare.features"
                    elevation="0"
                    tag="section"
                    class="pa-2 mb-4"
                  >
                    <v-row>
                      <v-col cols="12" md="12" sm="12">
                        <v-card-subtitle class="pa-0 py-0 pb-3">
                          <h4>Features</h4>
                        </v-card-subtitle>
                        <v-divider />
                      </v-col>
                      <v-list class="horizontal">
                        <v-list-item
                          v-for="feature in features"
                          :key="feature.id + feature.title"
                          class="horizontal-item"
                        >
                          <div class="d-flex flex-column">
                            <v-checkbox
                              v-model="selectedFeatures"
                              :label="feature.title"
                              color="indigo"
                              :value="feature.id"
                              hide-details
                              @change="changeSelectedFeature(feature.id)"
                            ></v-checkbox>
                            <v-switch
                              v-model="availableFeatures"
                              class="mt-1 ml-5"
                              color="primary"
                              label="Available"
                              :value="feature.id"
                              :disabled="enableFAvailable(feature.id)"
                            ></v-switch>
                          </div>
                        </v-list-item>
                      </v-list>
                    </v-row>
                  </v-sheet>
                  <v-divider class="mb-5 pb-2 mt-5" />
                  <v-sheet elevation="0" tag="section" class="pa-2 mb-4">
                    <v-row>
                      <v-col cols="12" sm="6">
                        <b-text
                          v-model="contactName"
                          outlined
                          label="Contact Name"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <b-text
                          v-model="contactEmail"
                          rules="email"
                          outlined
                          label="Email"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <b-text
                          v-model="contactWebsite"
                          outlined
                          label="Website"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <b-text
                          v-model="contactMobile"
                          outlined
                          label="Mobile Number"
                          counter="300"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="daycare.year"
                          outlined
                          label="Established Year"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="daycare.rooms"
                          rules="numeric"
                          outlined
                          label="Number of Rooms"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="daycare.care_givers"
                          rules="numeric"
                          outlined
                          label="Number of Care Givers"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="daycare.capacity"
                          rules="numeric"
                          outlined
                          label="Capacity"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="daycare.booked"
                          rules="numeric"
                          outlined
                          label="Booked"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="daycare.area"
                          outlined
                          label="Area in sq.ft"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <v-divider class="mb-5 mt-5" />
                      </v-col>
                    </v-row>
                    <v-row class="mb-3">
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="daycare.house"
                          rules="required"
                          outlined
                          label="Enter house"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="daycare.street"
                          outlined
                          label="Enter street"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <b-text
                          v-model="daycare.zip"
                          outlined
                          label="Enter zip code"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-select
                          v-model="daycare.division_id"
                          :items="divisions"
                          label="Select Division"
                          item-text="name"
                          item-value="id"
                          outlined
                          hide-details
                          @change="changeDivision()"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-select
                          v-model="daycare.district_id"
                          :items="districts"
                          label="Select District"
                          item-text="name"
                          item-value="id"
                          outlined
                          hide-details
                          @change="changeDistrict()"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-select
                          v-model="daycare.area_id"
                          :items="areas"
                          label="Select Area"
                          item-text="name"
                          item-value="id"
                          outlined
                          hide-details
                        ></v-select>
                      </v-col>
                    </v-row>
                    <b-text
                      v-model="daycare.hospital_address"
                      outlined
                      label="Enter Nearest Hospitals"
                      hide-details
                    />
                  </v-sheet>
                </v-card-text>
              </v-card>
            </v-col>
            <!-- End edit left section-->
            <!-- Start edit right section-->
            <v-col cols="12" sm="4">
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Publish</h4>
                  <v-spacer />
                  <b-language v-model="language" />
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <b-date-time
                    v-model="daycare.datetime"
                    rules="required"
                    outlined
                    prepend-icon="mdi-calendar"
                    label="daycare Publish Date"
                    hide-details
                  />

                  <v-row>
                    <v-col cols="12">
                      <v-checkbox
                        v-model="daycare.is_featured"
                        label="Is Featured?"
                        color="primary"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                  <v-card-actions class="justify-center">
                    <v-btn outlined @click="$router.back()"> Cancel </v-btn>
                    <v-btn
                      outlined
                      color="primary"
                      :disabled="invalid"
                      @click="handleSubmit(onSubmit('inactive'))"
                    >
                      Save
                    </v-btn>
                    <v-btn
                      id="publishBtn"
                      outlined
                      color="success"
                      :disabled="invalid"
                      @click="handleSubmit(onSubmit('active'))"
                    >
                      Publish
                    </v-btn>
                  </v-card-actions>
                </v-card-text>
              </v-card>

              <v-card class="mb-4 pb-3">
                <v-card-title>
                  <h4>Category</h4>
                </v-card-title>
                <v-divider />
                <v-sheet class="pa-4 primary lighten-2">
                  <v-text-field
                    v-model="category"
                    label="Search Category"
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
                    v-model="daycare.categories"
                    :items="categories"
                    :search="category"
                    rules="required"
                    selectable
                    return-object
                  ></v-treeview>
                </scrollbar>
              </v-card>
              <v-card class="mb-4">
                <v-card class="mb-4">
                  <v-card-title>
                    <h4>Social Links</h4>
                  </v-card-title>
                  <v-divider />
                  <v-card-text>
                    <v-row
                      v-for="(link, linkIndex) in socialLinks"
                      :key="linkIndex"
                      justify="center"
                    >
                      <v-col>
                        <b-text
                          v-model="link.link"
                          outlined
                          label="Social Link"
                        />
                        <mdi-svg-icon-selector v-model="link.icon" />
                        <v-dialog
                          ref="colorDialogRef"
                          v-model="colorDialog"
                          :return-value.sync="link.color"
                          persistent
                          width="300"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="link.color"
                              label="Color Code"
                              outlined
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-card>
                            <v-color-picker v-model="color" show-swatches />
                            <v-card-actions>
                              <v-spacer />
                              <v-btn text @click="colorDialog = false"
                                >Cancel</v-btn
                              >
                              <v-btn
                                text
                                color="primary"
                                @click="
                                  $refs.colorDialogRef[linkIndex].save(
                                    color && color.hex
                                  )
                                "
                                >OK</v-btn
                              >
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                        <template v-if="socialLinks.length > 1">
                          <v-divider />
                        </template>
                      </v-col>
                    </v-row>
                    <v-row justify="center">
                      <v-col cols="12" sm="12" class="text-center">
                        <v-btn
                          color="primary"
                          outlined
                          title="Social Link"
                          @click="addLink"
                        >
                          Social Link
                          <v-icon right>mdi-plus</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Images</h4>
                </v-card-title>
                <v-divider />
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-subheader>Featured Image</v-subheader>
                    <v-btn
                      v-if="daycare.image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="daycare.image !== null">
                      <v-img :src="daycare.image" />
                      <v-card-actions class="justify-center">
                        <v-btn
                          color="teal"
                          outlined
                          @click.stop="openDialog('image')"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          color="pink"
                          outlined
                          @click="removeImage('image')"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-card-actions>
                    </template>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-subheader>Lazy Image</v-subheader>
                    <v-btn
                      v-if="daycare.meta_image === null"
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('meta_image')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <template v-if="daycare.meta_image !== null">
                      <v-img :src="daycare.meta_image" />
                      <v-card-actions class="justify-center">
                        <v-btn
                          color="teal"
                          outlined
                          @click.stop="openDialog('meta_image')"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          color="pink"
                          outlined
                          @click="removeImage('meta_image')"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-card-actions>
                    </template>
                  </v-col>
                </v-row>
                <v-divider />
                <v-row>
                  <v-col>
                    <v-subheader>Aditional Image</v-subheader>
                    <v-btn
                      color="primary"
                      class="mx-4"
                      outlined
                      large
                      @click.stop="openDialog('images')"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col
                    v-for="(image, i) in daycare.images"
                    :key="i"
                    cols="12"
                    sm="4"
                  >
                    <v-img :src="image.src" />
                    <v-card-actions class="justify-center">
                      <v-btn
                        color="teal"
                        outlined
                        @click.stop="openDialog('images')"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        color="pink"
                        outlined
                        @click="removeImage('images')"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-col>
                </v-row>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Rating</h4>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-select
                    v-model="facilityRating"
                    :items="numbers"
                    label="Select Facility Rating"
                    outlined
                    @change="changeRating"
                  ></v-select>
                  <v-select
                    v-model="feeRating"
                    :items="numbers"
                    label="Select Fee Rating"
                    outlined
                    @change="changeRating"
                  ></v-select>
                  <v-select
                    v-model="securityRating"
                    :items="numbers"
                    label="Select Security Rating"
                    outlined
                    @change="changeRating"
                  ></v-select>
                  <v-select
                    v-model="hygieneRating"
                    :items="numbers"
                    label="Select Hygiene Rating"
                    outlined
                    @change="changeRating"
                  ></v-select>
                  <v-select
                    v-model="careGivingRating"
                    :items="numbers"
                    label="Select Care Giving Rating"
                    outlined
                    @change="changeRating"
                  ></v-select>
                  <v-row align-content="center" justify="center">
                    <h2>Rating</h2>
                  </v-row>
                  <v-row align-content="center" justify="center">
                    <h3>{{ daycare.tgmg_rating }}/5</h3>
                  </v-row>
                </v-card-text>
              </v-card>
              <v-card class="mb-4">
                <v-card-title>
                  <h4>Map</h4>
                </v-card-title>
                <v-divider />
                <v-card-text class="pb-0">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="daycare.latitude"
                        rules="required"
                        outlined
                        label="Enter Latitude"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <b-text
                        v-model="daycare.longitude"
                        rules="required"
                        outlined
                        label="Enter Longitude"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-text>
                  <Map
                    :latitude="daycare.latitude"
                    :longitude="daycare.longitude"
                    @location-changed="updateLocation"
                  />
                </v-card-text>
              </v-card>
            </v-col>
            <!-- End edit right section-->
          </v-row>
        </v-container>
      </v-form>
    </validation-observer>
    <!-- Start images upload dialog -->
    <v-dialog v-model="mediaDialog" scrollable max-width="90vw">
      <v-card id="mediaDialog">
        <v-card-title class="justify-space-between primary white--text">
          <span class="headline">Upload Files</span>
          <v-btn icon dark class="ma-0" @click.stop="mediaDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <media-library @use="useThisFile" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- End images upload dialog -->
  </div>
</template>

<script>
import Map from '~/components/Map';

export default {
  name: 'DaycareEdit',
  components: { Map },
  data() {
    const defaultForm = Object.freeze({
      name: '',
      categories: [],
      slug: '',
      description: '',
      content: '',
      datetime: null,
      code: '',
      tgmg_rating: 0,
      customer_rating: 0,
      special_start_date: null,
      hospital_address: '',
      special_end_date: null,
      meta_keyword: '',
      meta_title: '',
      meta_description: '',
      social: [],
      latitude: 23.81034,
      longitude: 90.41254,
      year: '',
      rooms: '',
      care_givers: '',
      capacity: '',
      booked: '',
      area: '',
      filters: [],
      tags: [],
      images: [],
      status: 0,
      image: null,
      meta_image: null,
      is_featured: false,
      opening_days: [],
    });

    return {
      language: 'en',
      daycare: Object.assign({}, defaultForm),
      dailog_type: 'image',
      mediaDialog: false,
      // Time range
      timeModal: false,
      tRFromTime: null,
      tRToTime: null,
      timeRangeToTimeModal: false,
      timeRangeFromTimeModal: false,
      // Age range
      aRToAge: '',
      aRFromAge: '',
      aRToPeriod: '',
      aRFromPeriod: '',
      // Contact
      contactName: '',
      contactEmail: '',
      contactMobile: '',
      contactWebsite: '',
      // Rating
      facilityRating: '5',
      feeRating: '5',
      securityRating: '5',
      hygieneRating: '5',
      careGivingRating: '5',
      divisions: [],
      districts: [],
      divisionId: '',
      districtId: '',
      areas: [],
      area_sqft: '',
      category: '',
      links: [],
      socialLinks: [],
      colorDialog: false,
      color: null,
      fees: [
        {
          fee_id: 0,
          fee_text: '',
          fee_amount: '',
          fee_period: '',
        },
      ],
      categories: [],
      filters: [],
      filter: null,
      tabs: [],
      features: [],
      selectedFeatures: [],
      availableFeatures: [],
      agePeriods: ['Days', 'Months', 'Years'],
      periods: ['One-Time', 'Monthly', 'Weekly', 'Per Day', 'Per Hour'],
      numbers: ['1', '2', '3', '4', '5'],
      images: [],
      loading: false,
      getOpeningDays: [
        { label: 'Saturday', value: 'saturday' },
        { label: 'Sunday', value: 'sunday' },
        { label: 'Monday', value: 'monday' },
        { label: 'Tuesday', value: 'tuesday' },
        { label: 'Wednesday', value: 'wednesday' },
        { label: 'Thursday', value: 'thursday' },
        { label: 'Friday', value: 'friday' },
      ],
    };
  },
  computed: {
    loggedIn() {
      return this.$auth.loggedIn;
    },
    user() {
      return this.$auth.user;
    },
  },
  watch: {
    language() {
      this.getDaycare();
    },
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    Promise.all([this.getCategories(), this.getFeatures()]).then(() => {
      this.getDaycare();
      this.getDivisions();
    });

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getFeatures();
      this.getCategories();
      this.getDaycare();
      this.getDivisions();
    });
  },
  methods: {
    // update latitude, longitude
    updateLocation(event) {
      this.daycare.latitude = event.latitude;
      this.daycare.longitude = event.longitude;
    },
    changeSelectedFeature(id) {
      this.availableFeatures = this.availableFeatures.filter(
        (item) => item !== id
      );
    },
    enableFAvailable(id) {
      return !this.selectedFeatures.includes(id);
    },
    changeRating() {
      const facility = parseInt(this.facilityRating)
        ? parseInt(this.facilityRating)
        : 0;
      const fee = parseInt(this.feeRating) ? parseInt(this.feeRating) : 0;
      const security = parseInt(this.securityRating)
        ? parseInt(this.securityRating)
        : 0;
      const hygiene = parseInt(this.hygieneRating)
        ? parseInt(this.hygieneRating)
        : 0;
      const careGiving = parseInt(this.careGivingRating)
        ? parseInt(this.careGivingRating)
        : 0;

      this.daycare.tgmg_rating =
        (facility + fee + security + hygiene + careGiving) / 5;
    },
    addRow() {
      let id;
      for (let i = 0; i < this.daycare.fees.length; i++) {
        id = i + 1;
      }
      this.daycare.fees.push({
        fee_id: id,
        fee_text: '',
        fee_amount: '',
        fee_period: '',
      });
    },
    removeRow(index, fee) {
      const idx = this.daycare.fees.indexOf(fee);
      if (idx > 0) {
        this.daycare.fees.splice(idx, 1);
      }
    },
    addLink() {
      this.socialLinks.push({ icon: null, color: null, link: null });
    },
    // add dynamic tab into daycare
    addTab() {
      this.tabs.push({ locale: this.language, title: null, content: null });
    },
    removeTab(i) {
      this.tabs.splice(i, 1);
    },
    // open image select dialog
    openDialog(type) {
      this.dailog_type = type;
      this.mediaDialog = true;
    },
    // remove selected image
    removeImage(type, index) {
      this.dailog_type = null;
      switch (type) {
        case 'image':
          this.daycare.image = null;
          break;
        case 'meta_image':
          this.daycare.meta_image = null;
          break;
        case 'images':
          this.daycare.images.splice(index, 1);
          break;
      }
    },
    // update daycare image property
    useThisFile(event) {
      switch (this.dailog_type) {
        case 'image':
          this.daycare.image = event.url;
          this.daycare.images.push({
            src: event.src,
            srcset: event.srcset,
            lazy: event.lazy,
            is_featured: true,
          });
          break;
        case 'meta_image':
          this.daycare.meta_image = event.url;
          break;
        case 'images':
          this.daycare.images.push({
            src: event.src,
            srcset: event.srcset,
            lazy: event.lazy,
            is_featured: false,
          });
          break;
      }

      this.mediaDialog = false;
    },
    // check slug
    async checkSlug() {
      try {
        const { slug } = await this.$axios.$get(
          `${this.language}/daycare/daycares/slug/${encodeURIComponent(
            this.daycare.name
          )}`
        );
        this.daycare.slug = slug;
      } catch (e) {
        this.daycare.slug = null;
      }
    },
    async getCategories() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/daycare/category-all`
        );
        this.categories = data;
      } catch (e) {}
    },

    onSubmit(status) {
      this.daycare.status = status;
      this.publishDaycare();
    },

    async publishDaycare() {
      const instance = this;
      instance.loading = true;
      try {
        const daycareData = instance.daycare;

        // Set time range
        if (instance.tRFromTime && instance.tRToTime) {
          daycareData.time_range = {
            from_time: timeConvert(instance.tRFromTime),
            to_time: timeConvert(instance.tRToTime),
          };
        }

        // Set age range
        daycareData.age_range = {
          from_age: instance.aRFromAge ? instance.aRFromAge : null,
          from_period: instance.aRFromPeriod ? instance.aRFromPeriod : null,
          to_age: instance.aRToAge ? instance.aRToAge : null,
          to_period: instance.aRToPeriod ? instance.aRToPeriod : null,
        };

        // Set contact
        daycareData.contact = {
          name: instance.contactName ? instance.contactName : '',
          email: instance.contactEmail ? instance.contactEmail : '',
          website: instance.contactWebsite ? instance.contactWebsite : '',
          mobile: instance.contactMobile ? instance.contactMobile : null,
        };

        // Set social links
        daycareData.social_links = instance.socialLinks;

        // Set location
        daycareData.location = {
          house: daycareData.house ? daycareData.house : '',
          street: daycareData.street ? daycareData.street : '',
          zip: daycareData.zip ? daycareData.zip : '',
          division: daycareData.division_id
            ? getDivisionName(instance.divisions, daycareData.division_id)
            : '',
          district:
            daycareData.district_id && daycareData.division_id
              ? getDistrictName(instance.districts, daycareData.district_id)
              : '',
          area:
            daycareData.area_id &&
            daycareData.district_id &&
            daycareData.division_id
              ? getAreaName(instance.areas, daycareData.area_id)
              : '',
        };

        // Set rating
        daycareData.ratings = {
          user_id: this.loggedIn && this.user.id,
          facility: instance.facilityRating,
          fee: instance.feeRating,
          security: instance.securityRating,
          hygiene: instance.hygieneRating,
          care_giving: instance.careGivingRating,
        };

        // Set feature
        const newFeatues = [];
        instance.selectedFeatures.forEach((featureId) => {
          if (featureId) {
            const getFeatureInfo = instance.features.find(
              (featureInfo) => featureInfo.id === featureId
            );
            const isAvailable = instance.availableFeatures.includes(featureId);
            newFeatues.push({ ...getFeatureInfo, active: isAvailable });
          }
        });
        daycareData.features = newFeatues;

        const { message } = await this.$axios.$patch(
          `${this.language}/daycare/daycares/${this.$route.params.id}`,
          daycareData
        );

        this.loading = false;
        this.$store.dispatch('crud_success', {
          message,
          path: '/daycare/daycares',
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
    // get payment_method for edit
    async getDaycare() {
      const instance = this;
      try {
        const { data } = await instance.$axios.$get(
          `${instance.language}/daycare/daycares/${instance.$route.params.id}/edit`
        );
        instance.daycare = Object.assign({}, data);

        // Get default fees when had no daycare fees
        const { fees } = instance.daycare;
        if ((fees && fees.length === 0) || fees === null) {
          instance.daycare.fees = instance.fees;
        }

        // Get time range when had no daycare time range
        const timeRange = instance.daycare && instance.daycare.time_range;
        if (timeRange && timeRange.from_time)
          instance.tRFromTime = timeConvert(timeRange.from_time);
        if (timeRange && timeRange.to_time)
          instance.tRToTime = timeConvert(timeRange.to_time);

        // Get time range when had no daycare time range
        const ageRange = instance.daycare && instance.daycare.age_range;
        if (ageRange && ageRange.from_age)
          instance.aRFromAge = ageRange.from_age;
        if (ageRange && ageRange.from_period)
          instance.aRFromPeriod = ageRange.from_period;
        if (ageRange && ageRange.to_age) instance.aRToAge = ageRange.to_age;
        if (ageRange && ageRange.to_period)
          instance.aRToPeriod = ageRange.to_period;

        // Get default contact when had no daycare contact
        const { contact } = instance.daycare;
        if (contact && contact.name) this.contactName = contact.name;
        if (contact && contact.email) this.contactEmail = contact.email;
        if (contact && contact.website) this.contactWebsite = contact.website;
        if (contact && contact.mobile) this.contactMobile = contact.mobile;

        // Get default location when had no daycare location
        if (instance.daycare.division_id) this.getDistricts();
        if (instance.daycare.district_id) this.getAreas();

        // Get ratings
        const { ratings } = instance.daycare;
        if (ratings && ratings.facility) {
          this.facilityRating = '' + ratings.facility;
        }
        if (ratings && ratings.fee) {
          this.feeRating = '' + ratings.fee;
        }
        if (ratings && ratings.security) {
          this.securityRating = '' + ratings.security;
        }
        if (ratings && ratings.hygiene) {
          this.hygieneRating = '' + ratings.hygiene;
        }
        if (ratings && ratings.care_giving) {
          this.careGivingRating = '' + ratings.care_giving;
        }

        // Get features
        const { features } = instance.daycare;
        features.forEach((featureInfo) => {
          if (featureInfo) {
            instance.selectedFeatures.push(featureInfo.id);
            if (
              featureInfo &&
              featureInfo.pivot &&
              featureInfo.pivot.active &&
              featureInfo.pivot.active === 1
            )
              instance.availableFeatures.push(featureInfo.id);
          }
        });

        // Get social links
        const links = instance.daycare && instance.daycare.social_links;
        instance.socialLinks = links || [];

        this.changeRating();
      } catch (e) {
        instance.$router.replace('/daycare/daycares');
      }
    },
    async getFeatures() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/daycare/feature-all`
        );
        this.features = data;
      } catch (e) {}
    },
    async getDivisions() {
      try {
        const { data } = await this.$axios.$get(`shipping/division-all`);
        this.divisions = data;
      } catch (e) {}
    },

    changeDivision() {
      this.getDistricts();
      this.areas = [];
    },
    changeDistrict() {
      this.getAreas();
    },
    async getDistricts() {
      try {
        if (this.daycare.division_id) {
          const { data } = await this.$axios.$get(
            `shipping/district-by-division/${this.daycare.division_id}`
          );
          this.districts = data;
        }
      } catch (e) {}
    },

    async getAreas() {
      try {
        if (this.daycare.district_id) {
          const { data } = await this.$axios.$get(
            `shipping/area-by-district/${this.daycare.district_id}`
          );
          this.areas = data;
        }
      } catch (e) {}
    },
  },
};

const timeConvert = (time) => {
  let result = '';
  if (time.includes('PM') || time.includes('AM')) {
    if (time.endsWith('PM'))
      time = time.substring(0, time.indexOf('PM')) + ' PM';
    if (time.endsWith('AM'))
      time = time.substring(0, time.indexOf('AM')) + ' AM';

    const d = new Date('2000-01-01 ' + time);

    if (time.endsWith('PM') && d.getHours() < 12) d.setHours(12);
    if (time.endsWith('AM') && d.getHours() === 12)
      d.setHours(d.getHours() - 12);

    result =
      (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) +
      ':' +
      (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
  } else {
    let hour = time.split(':')[0];
    let min = time.split(':')[1];
    const part = hour > 12 ? 'PM' : 'AM';

    min = (min + '').length === 1 ? `0${min}` : min;
    hour = hour > 12 ? hour - 12 : hour;
    hour = (hour + '').length === 1 ? `0${hour}` : hour;

    result = `${hour}:${min} ${part}`;
  }

  return result;
};

const getDivisionName = (divisionList, id) => {
  if (id && divisionList && divisionList.length > 0) {
    const info = divisionList.find((item) => item.id === id);
    return info && info.name ? info.name : '';
  } else return '';
};

const getDistrictName = (districtList, id) => {
  if (id && districtList && districtList.length > 0) {
    const info = districtList.find((item) => item.id === id);
    return info && info.name ? info.name : '';
  } else return '';
};

const getAreaName = (areasList, id) => {
  if (id && areasList && areasList.length > 0) {
    const info = areasList.find((item) => item.id === id);
    return info && info.name ? info.name : '';
  } else return '';
};
</script>
