<template>
  <div id="order">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <v-card>
            <v-card-text class="pa-0">
              <v-stepper v-model="stepperStage">
                <v-stepper-header>
                  <v-stepper-step :complete="stepperStage > 1" step="P">
                    Select products
                  </v-stepper-step>
                  <v-divider></v-divider>
                  <v-stepper-step :complete="stepperStage > 2" step="C">
                    Customer informations
                  </v-stepper-step>
                  <v-divider></v-divider>
                  <v-stepper-step step="O"> Order confirmation </v-stepper-step>
                </v-stepper-header>
                <v-stepper-items>
                  <!-- Start products list form stepper -->
                  <v-stepper-content step="1">
                    <v-card elevation="0">
                      <validation-observer
                        v-slot="{ handleSubmit, invalid, reset }"
                      >
                        <v-form @reset.prevent="reset">
                          <v-row>
                            <v-col cols="10" md="10" sm="12">
                              <v-autocomplete
                                v-model="selectedProduct"
                                :items="products"
                                filled
                                outlined
                                label="Search product by name | sku"
                                :item-text="productName"
                                item-value="name"
                                class="mt-3"
                                return-object
                                hide-details
                                :search-input.sync="productSearch"
                                no-data-text="Type for product search.."
                              >
                                <template v-slot:selection="data">
                                  <v-avatar size="32" left class="mr-2">
                                    <v-img :src="data.item.image"></v-img>
                                  </v-avatar>
                                  {{ data.item && data.item.name }}
                                </template>
                                <template v-slot:item="data">
                                  <template v-if="!checkIfObject(data.item)">
                                    <v-list-item-content
                                      v-text="data.item"
                                    ></v-list-item-content>
                                  </template>
                                  <template v-else>
                                    <v-list-item-avatar size="32">
                                      <img :src="data.item.image" />
                                    </v-list-item-avatar>
                                    <v-list-item-content>
                                      <v-list-item-title
                                        v-if="data.item && data.item.name"
                                        >{{ data.item.name }}</v-list-item-title
                                      >
                                      <v-list-item-subtitle
                                        v-if="data.item && data.item.sku"
                                      >
                                        sku:
                                        {{
                                          data.item.sku
                                        }}</v-list-item-subtitle
                                      >
                                    </v-list-item-content>
                                  </template>
                                </template>
                              </v-autocomplete>
                            </v-col>
                            <v-col md="2" cols="2" sm="12" class="mt-3">
                              <b-text
                                v-model="selectedProductQty"
                                rules="required|numeric|min:1"
                                label="Quantity"
                                outlined
                                hide-details
                              />
                              <div
                                v-if="isShowQtyErrorMsg"
                                class="error--text mt-2"
                                role="alert"
                              >
                                <div class="v-messages__wrapper">
                                  <div class="v-messages__message">
                                    Quantity is not sufficient!
                                  </div>
                                </div>
                              </div>
                            </v-col>
                          </v-row>
                          <v-row class="mb-3">
                            <v-col cols="12">
                              <v-btn
                                class="float-right"
                                color="teal"
                                :disabled="isEnableAddProductBtn"
                                @click="handleSubmit(addProductToCart)"
                                >Add product</v-btn
                              >
                            </v-col>
                          </v-row>
                        </v-form>
                      </validation-observer>
                      <!-- Start show added products table -->
                      <template v-if="selectedProductsList.length > 0">
                        <v-simple-table fixed-header height="300px">
                          <template v-slot:default>
                            <thead>
                              <tr>
                                <th class="text-left">#</th>
                                <th class="text-left">Product</th>
                                <th class="text-left">Quantity</th>
                                <th class="text-left">Unit Price</th>
                                <th class="text-left">Total</th>
                                <th class="text-left">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(item, index) in selectedProductsList"
                                :key="item.name"
                              >
                                <td>{{ index + 1 }}</td>
                                <td class="pt-3 pb-3">
                                  {{ item.name }} <br />
                                  <small style="opacity: 0.8">
                                    SKU: {{ item.sku }}
                                  </small>
                                </td>
                                <td>{{ item.qty }}</td>
                                <td>
                                  <div>
                                    {{ currencySymbol
                                    }}{{ getProductPrice(item) }}
                                  </div>
                                  <div v-if="hasSpecialPrice(item)">
                                    <del style="opacity: 0.5"
                                      >{{ currencySymbol
                                      }}{{ getProductRegularPrice(item) }}</del
                                    >
                                  </div>
                                </td>
                                <td>
                                  {{ currencySymbol }}{{ item.totalPrice }}
                                </td>
                                <td>
                                  <v-btn
                                    depressed
                                    outlined
                                    icon
                                    fab
                                    dark
                                    color="pink"
                                    class="mr-0"
                                    small
                                    title="Delete"
                                    @click="deleteProductItem(item.id)"
                                  >
                                    <v-icon>mdi-delete</v-icon>
                                  </v-btn>
                                </td>
                              </tr>
                              <tr>
                                <td colspan="2" class="text-right">
                                  Total quantity =
                                </td>
                                <td class="font-weight-bold">
                                  {{ getTotalProductQty() }}
                                </td>
                                <td class="text-right">Total amount =</td>
                                <td colspan="2" class="font-weight-bold">
                                  {{ currencySymbol
                                  }}{{ getTotalProductAmount() }}
                                </td>
                              </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                      </template>
                      <!-- End show added products table -->
                    </v-card>
                    <v-divider class="mb-3" />
                    <v-btn
                      color="primary"
                      class="float-right pr-2"
                      :disabled="!(selectedProductsList.length > 0)"
                      @click="onSubmit('product')"
                    >
                      Continue
                      <v-icon class="ml-1"> mdi-arrow-right </v-icon>
                    </v-btn>
                  </v-stepper-content>
                  <!-- End products list form stepper -->
                  <!-- Start customer information form stepper -->
                  <v-stepper-content step="2">
                    <v-card elevation="0">
                      <v-row>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="selectedCustomer"
                            :items="customers"
                            filled
                            outlined
                            label="Search customer by name | email | number"
                            :item-text="customerSearchContent"
                            item-value="name"
                            class="mt-3 mb-4"
                            return-object
                            hide-details
                            :search-input.sync="customerSearch"
                            :no-data-text="
                              newCustomerName
                                ? `Press enter for new create..`
                                : `Type for customer search..`
                            "
                            @keyup="keyupEventOfCustomerSearch"
                          >
                            <template v-slot:selection="data">
                              <v-avatar size="32" left class="mr-2">
                                <v-img :src="data.item.avatar"></v-img>
                              </v-avatar>
                              <template v-if="data.item && data.item.name">
                                {{ data.item.name }}
                              </template>
                            </template>
                            <template v-slot:item="data">
                              <template v-if="!checkIfObject(data.item)">
                                <v-list-item-content
                                  v-text="data.item"
                                ></v-list-item-content>
                              </template>
                              <template v-else>
                                <v-list-item-avatar size="32">
                                  <img :src="data.item.avatar" />
                                </v-list-item-avatar>
                                <v-list-item-content>
                                  <v-list-item-title
                                    v-if="data.item && data.item.name"
                                    >{{ data.item.name }}</v-list-item-title
                                  >
                                  <v-list-item-subtitle>
                                    <template
                                      v-if="
                                        data && data.item && data.item.email
                                      "
                                    >
                                      email:
                                      {{ data.item.email }}
                                    </template>
                                    <template
                                      v-if="
                                        data && data.item && data.item.mobile
                                      "
                                    >
                                      , number:
                                      {{ data.item.mobile }}
                                    </template>
                                  </v-list-item-subtitle>
                                </v-list-item-content>
                              </template>
                            </template>
                          </v-autocomplete>
                        </v-col>
                      </v-row>
                      <template v-if="isShowCustomerAddressList()">
                        <v-row class="mb-3">
                          <v-col cols="12" sm="4">
                            <b-text
                              id="js-name"
                              v-model="selectedCustomer.name"
                              rules="required"
                              outlined
                              label="Name"
                              hide-details
                              :disabled="
                                !!(selectedCustomer && selectedCustomer.name) &&
                                !newCustomerName
                              "
                              @change="onChangeFieldValue('name')"
                            />
                          </v-col>
                          <v-col cols="12" sm="4">
                            <b-text
                              id="js-email"
                              v-model="selectedCustomer.email"
                              rules="email"
                              outlined
                              label="Email"
                              hide-details
                              :disabled="isDisabledEmailField"
                              @change="onChangeFieldValue('email')"
                            />

                            <small
                              v-if="!isAvailableEmail"
                              class="v-application mt-1"
                              ><span class="error--text">
                                The
                                <strong>{{ selectedCustomer.email }}</strong>
                                already exist!</span
                              >
                            </small>
                          </v-col>
                          <v-col cols="12" sm="4">
                            <b-text
                              id="js-mobile"
                              v-model="selectedCustomer.mobile"
                              rules="required|min:11"
                              outlined
                              label="Mobile"
                              hide-details
                              :disabled="isDisabledMobileField"
                              @change="onChangeFieldValue('mobile')"
                            />

                            <small
                              v-if="!isAvailableMobile"
                              class="v-application mt-1"
                            >
                              <span class="error--text">
                                The
                                <strong>{{ selectedCustomer.mobile }}</strong>
                                already exist!</span
                              >
                            </small>
                          </v-col>
                        </v-row>
                        <div class="text-right">
                          <v-dialog v-model="addressDialog" max-width="480px">
                            <template v-slot:activator="{ on }">
                              <v-btn
                                color="secondary"
                                elevation="1"
                                small
                                v-on="on"
                                @click="openAddressDialog"
                              >
                                Add new address
                              </v-btn>
                            </template>
                            <v-card>
                              <v-card-title
                                class="justify-space-between primary white--text"
                              >
                                <span class="headline">Add New Address</span>
                                <v-btn
                                  icon
                                  dark
                                  class="ma-0"
                                  @click.stop="dialogClose"
                                >
                                  <v-icon>mdi-close</v-icon>
                                </v-btn>
                              </v-card-title>
                              <v-divider></v-divider>
                              <validation-observer
                                v-slot="{ handleSubmit, invalid, reset }"
                              >
                                <template v-if="isFormLoaded">
                                  <v-form
                                    @submit.prevent="
                                      handleSubmit(addAddressFormSubmit)
                                    "
                                    @reset.prevent="reset"
                                  >
                                    <v-card-text class="pb-0">
                                      <v-row class="mb-3">
                                        <v-col cols="12">
                                          <p>Address type</p>
                                          <v-radio-group
                                            v-model="newAddressForCustomer.type"
                                            row
                                          >
                                            <v-radio
                                              v-for="aType in newCustomerAddressTypes"
                                              :key="aType.value"
                                              :label="aType.text"
                                              :value="aType.value"
                                            ></v-radio>
                                          </v-radio-group>
                                        </v-col>
                                      </v-row>
                                      <v-row class="mb-3">
                                        <v-col cols="12" sm="6">
                                          <b-text
                                            v-model="newAddressForCustomer.name"
                                            rules="required"
                                            outlined
                                            label="Contact person name"
                                            hide-details
                                          />
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                          <b-text
                                            v-model="
                                              newAddressForCustomer.mobile
                                            "
                                            rules="required|numeric|min:11"
                                            outlined
                                            label="Contact mobile"
                                            hide-details
                                          />
                                        </v-col>
                                      </v-row>

                                      <v-row class="mb-3">
                                        <v-col cols="12" sm="6">
                                          <v-select
                                            v-model="
                                              newAddressForCustomer.divisionId
                                            "
                                            :items="divisions"
                                            label="Select Division"
                                            item-text="name"
                                            item-value="id"
                                            outlined
                                            hide-details
                                            @change="changeDivision()"
                                          ></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                          <v-select
                                            v-model="
                                              newAddressForCustomer.districtId
                                            "
                                            :items="districts"
                                            label="Select District"
                                            item-text="name"
                                            item-value="id"
                                            outlined
                                            hide-details
                                            @change="changeDistrict()"
                                          ></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                          <v-select
                                            v-model="
                                              newAddressForCustomer.areaId
                                            "
                                            :items="areas"
                                            label="Select Area"
                                            item-text="name"
                                            item-value="id"
                                            outlined
                                            hide-details
                                          ></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                          <b-text
                                            v-model="newAddressForCustomer.zip"
                                            outlined
                                            label="Post code"
                                            hide-details
                                          />
                                        </v-col>
                                      </v-row>
                                      <v-row class="mb-3">
                                        <v-col cols="12" md="12">
                                          <v-textarea
                                            v-model="
                                              newAddressForCustomer.addressLine
                                            "
                                            outlined
                                            name="addressLine"
                                            label="Address line"
                                            rows="3"
                                            hint="example: House #01, Street #03, E-block"
                                          ></v-textarea>
                                        </v-col>
                                      </v-row>
                                    </v-card-text>
                                    <v-divider></v-divider>
                                    <action-button-dialog
                                      :loading="dialogLoading"
                                      :error="
                                        invalid ||
                                        !newAddressForCustomer.addressLine
                                      "
                                      @close="dialogClose"
                                    />
                                  </v-form>
                                </template>
                              </validation-observer>
                            </v-card>
                          </v-dialog>
                        </div>
                        <v-row class="mb-3">
                          <v-col cols="12" class="pt-0">
                            Shipping Address:
                            <div class="my-3 pl-5 pb-5">
                              <template v-if="hasCustomerAddress('shipping')">
                                <v-radio-group
                                  v-model="customerShippingAddress"
                                >
                                  <v-radio
                                    v-for="sa in getCustomerAddresses(
                                      customerAddresses,
                                      'shipping'
                                    )"
                                    :key="sa.id"
                                    :label="`${getFullAddress(sa)}`"
                                    :value="sa.id"
                                  ></v-radio>
                                </v-radio-group>
                              </template>
                              <v-card-subtitle v-else class="pt-0 pl-0">
                                We didn't find any shipping address!
                              </v-card-subtitle>
                            </div>
                            Billing Address:
                            <div class="my-3 pl-5">
                              <template v-if="hasCustomerAddress('billing')">
                                <v-radio-group v-model="customerBillingAddress">
                                  <v-radio
                                    v-for="ba in getCustomerAddresses(
                                      customerAddresses,
                                      'billing'
                                    )"
                                    :key="ba.id"
                                    :label="`${getFullAddress(ba)}`"
                                    :value="ba.id"
                                  ></v-radio>
                                </v-radio-group>
                              </template>
                              <v-card-subtitle v-else class="pt-0 pl-0">
                                We didn't find any billing address!
                              </v-card-subtitle>
                            </div>
                          </v-col>
                        </v-row>
                      </template>
                    </v-card>
                    <v-divider class="mb-3" />
                    <v-btn @click="onBack()"> Back </v-btn>
                    <v-btn
                      color="primary"
                      :disabled="isEnableAddCustomer"
                      class="float-right pr-2"
                      @click="onSubmit('customer')"
                    >
                      Continue
                      <v-icon class="ml-1"> mdi-arrow-right </v-icon>
                    </v-btn>
                  </v-stepper-content>
                  <!-- End customer information form stepper -->
                  <!-- Start Order confirmation form stepper -->
                  <v-stepper-content step="3">
                    <v-card elevation="0" min-height="200px">
                      <v-row>
                        <v-col cols="12" md="4" sm="4">
                          <AddressCard
                            v-if="
                              Object.keys(
                                getOrderAddress(customerBillingAddress) || {}
                              ).length > 0
                            "
                            :address="getOrderAddress(customerBillingAddress)"
                            label="Shipping address"
                          />
                        </v-col>
                        <v-col cols="12" md="4" sm="4">
                          <AddressCard
                            v-if="
                              Object.keys(
                                getOrderAddress(customerShippingAddress) || {}
                              ).length > 0
                            "
                            :address="getOrderAddress(customerShippingAddress)"
                            label="Billing address"
                          />
                        </v-col>
                        <v-col cols="12" md="4" sm="4">
                          <v-card>
                            <v-card-title>Summary</v-card-title>
                            <v-divider />
                            <div class="px-5 py-5 line-height-2">
                              <div class="d-flex justify-space-between">
                                <strong>Price:</strong>
                                <span>
                                  {{ currencySymbol
                                  }}{{ getTotalProductAmount() }}</span
                                >
                              </div>
                              <div class="d-flex justify-space-between">
                                <strong>Promo discount:</strong>
                                <span
                                  >-{{ currencySymbol
                                  }}{{ couponDiscount || 0 }}</span
                                >
                              </div>
                              <div
                                v-if="shippingCost"
                                class="d-flex justify-space-between"
                              >
                                <strong>Delivery cost: </strong>
                                <span
                                  >{{ currencySymbol }}{{ shippingCost }}</span
                                >
                              </div>
                              <v-divider />
                              <div class="d-flex justify-space-between">
                                <strong>Total Amount: </strong>
                                <span
                                  >{{ currencySymbol }}
                                  {{
                                    getTotalCartAmount(getTotalProductAmount())
                                  }}</span
                                >
                              </div>
                            </div>
                          </v-card>
                        </v-col>
                      </v-row>
                      <v-card-title class="px-0"> Order details </v-card-title>
                      <v-divider />
                      <v-row>
                        <v-col cols="12" md="6" sm="6">
                          <v-select
                            v-model="selectedPaymentMethod"
                            :items="paymentMethods"
                            label="Select payment method"
                            class="pt-5"
                            item-text="name"
                            item-value="code"
                            outlined
                            hide-details
                          ></v-select>
                        </v-col>
                        <v-col cols="12" md="6" sm="6">
                          <v-row class="pt-5">
                            <v-col cols="9">
                              <b-text
                                v-model="selectedCoupon"
                                label="Coupon"
                                outlined
                                hide-details
                              />
                              <div
                                v-if="
                                  corporateCustomer &&
                                  corporateCustomer.is_registered
                                "
                              >
                                <strong class="red--text text--lighten-1">{{
                                  getCorporateCoupon().code
                                }}</strong>
                                coupon code already applied and the customer got
                                {{
                                  `${getCorporateCoupon().discount * 1}${
                                    getCorporateCoupon().type === 'percentage'
                                      ? '%'
                                      : ''
                                  }`
                                }}
                                discount. <strong>Undo this coupon</strong>.
                              </div>
                            </v-col>
                            <v-col cols="3" class="pl-0">
                              <v-btn
                                color="secondary"
                                :disabled="!selectedCoupon"
                                style="width: 100%; height: 52px"
                                @click="applyCoupon"
                              >
                                Apply
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="orderComment"
                            outlined
                            name="orderComment"
                            label="Comment"
                            rows="3"
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-card>
                    <v-divider class="mb-3" />
                    <v-btn @click="onBack(3)"> Back </v-btn>
                    <v-btn
                      color="primary"
                      class="float-right"
                      :loading="confirmLoading"
                      @click="onSubmit('confirm')"
                    >
                      Confirm
                    </v-btn>
                  </v-stepper-content>
                  <!-- End Order confirmation form stepper -->
                </v-stepper-items>
              </v-stepper>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="isShowCorporateCouponDialog" max-width="410px">
      <v-card>
        <v-card-text class="text-center pt-5 pb-5">
          <h3 class="mb-2 mt-5">
            <strong>Already applied the heighest coupon for discount</strong>
          </h3>
          <v-btn
            color="primary"
            elevation="2"
            class="mb-4"
            small
            @click="isShowCorporateCouponDialog = false"
          >
            Ok
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { confirmationAlert, errorMessage } from '@/plugins/sweetalert';
import { isValidMobile, isValidEmail } from '@/util';

const checkStepTwoValidation = (customer) => {
  let isValid = false;
  if (
    customer &&
    customer.name &&
    isValidMobile(customer.mobile) &&
    customer.shippingAddressId &&
    customer.billingAddressId
  ) {
    isValid = true;
  }
  return isValid;
};

const getTotalItems = (itemsList, itemType) => {
  let totalCount = 0;
  if (itemsList.length > 0) {
    itemsList.forEach((item) => {
      totalCount += item[itemType];
    });
  }
  return totalCount;
};

const saveAddress = async (instance, addressObj, isNewCustomer) => {
  const data = await instance.$axios.$post(`customer/address`, addressObj);

  if (data && data.id && !isNewCustomer) {
    instance.getCustomerAddress(addressObj.customer_id);
    instance.dialogClose();
  }
};

const getItemName = (instance, targetId, itemType) => {
  let context = '';

  if (targetId && itemType === 'area') {
    const areaInfo =
      instance.areas && instance.areas.find((area) => area.id === targetId);
    context = areaInfo && areaInfo.name;
  } else if (targetId && itemType === 'division') {
    const divisionInfo =
      instance.divisions &&
      instance.divisions.find((division) => division.id === targetId);
    context = divisionInfo && divisionInfo.name;
  } else if (targetId && itemType === 'district') {
    const districtInfo =
      instance.districts &&
      instance.districts.find((district) => district.id === targetId);
    context = districtInfo && districtInfo.name;
  }

  return context;
};

// Calculate product price with special price
const getActualPrice = (product) => {
  let price = product && product.price ? product.price : null;

  if (checkSpecialPriceRange(product)) {
    price = product && product.special_price ? product.special_price : null;
  }
  return price;
};

const checkSpecialPriceRange = (product) => {
  const sProductInfo = product;
  const specialStartDate =
    sProductInfo && sProductInfo.special_start_date
      ? sProductInfo.special_start_date
      : null;
  const specialEndDate =
    sProductInfo && sProductInfo.special_end_date
      ? sProductInfo.special_end_date
      : null;

  return (
    new Date(specialStartDate) < new Date() &&
    new Date() < new Date(specialEndDate)
  );
};

const isUniqueEmail = (instance, value) => {
  return instance.$axios
    .$get(`${process.env.API_URL}/customer/check?email=${value}`)
    .then((response) => {
      return {
        valid: response.valid,
        data: {
          message: response.message,
        },
      };
    });
};

const isUniqueMobile = (instance, value) => {
  return instance.$axios
    .$get(`${process.env.API_URL}/customer/check?mobile=${value}`)
    .then((response) => {
      return {
        valid: response.valid,
        data: {
          message: response.message,
        },
      };
    });
};

const setAddressForNewCustomer = (instance, addressObj) => {
  if (addressObj && addressObj.type === 'both') {
    instance.customerAddresses.push({
      ...addressObj,
      id: instance.customerAddresses.length + 1,
      type: 'shipping',
    });

    instance.customerAddresses.push({
      ...addressObj,
      id: instance.customerAddresses.length + 1,
      type: 'billing',
    });
  } else {
    instance.customerAddresses.push({
      ...addressObj,
      id: instance.customerAddresses.length + 1,
    });
  }

  // close dialog
  instance.dialogClose();
};

const getInstantAddress = (instance, addressId, isAddressLine, type) => {
  const addressess = instance.customerAddresses;
  if (addressess.length > 0 && addressId) {
    if (isAddressLine) {
      const result = addressess.find((data) => data && data.id === addressId);
      return result && result.address_line;
    } else {
      const result = addressess.find(
        (data) => data && data.address_line === addressId && data.type === type
      );
      return result && result.id;
    }
  }
};

const getStaticAdress = (addressInfo) => {
  return {
    id: addressInfo && addressInfo.id ? addressInfo.id : null,
    zip: addressInfo && addressInfo.zip ? addressInfo.zip : '',
    area: addressInfo && addressInfo.area ? addressInfo.area : '',
    name: addressInfo && addressInfo.name ? addressInfo.name : '',
    type: addressInfo && addressInfo.type ? addressInfo.type : '',
    email: addressInfo && addressInfo.email ? addressInfo.email : '',
    address_line:
      addressInfo && addressInfo.address_line ? addressInfo.address_line : '',
    mobile: addressInfo && addressInfo.mobile ? addressInfo.mobile : '',
    area_id: addressInfo && addressInfo.area_id ? addressInfo.area_id : null,
    country: addressInfo && addressInfo.country ? addressInfo.country : '',
    default: addressInfo && addressInfo.default ? addressInfo.default : false,
    status: addressInfo && addressInfo.status ? addressInfo.status : '',
    district: addressInfo && addressInfo.district ? addressInfo.district : '',
    division: addressInfo && addressInfo.division ? addressInfo.division : null,
    district_id:
      addressInfo && addressInfo.district_id ? addressInfo.district_id : null,
    division_id:
      addressInfo && addressInfo.division_id ? addressInfo.division_id : null,
  };
};

export default {
  name: 'Order',
  data() {
    return {
      language: 'en',
      currencySymbol: '৳',
      stepperStage: 1,
      // Start products tab
      products: [],
      productSearch: null,
      selectedProduct: null,
      selectedProductQty: 1,
      selectedProductsList: [],
      isShowQtyErrorMsg: false,
      isEnableAddProductBtn: true,
      getProductPrice(productInfo) {
        return getActualPrice(productInfo);
      },
      getProductRegularPrice(productInfo) {
        return productInfo && productInfo.price;
      },
      getTotalProductQty() {
        return getTotalItems(this.selectedProductsList, 'qty');
      },
      getTotalProductAmount() {
        return getTotalItems(this.selectedProductsList, 'totalPrice');
      },
      hasSpecialPrice(productInfo) {
        return !!checkSpecialPriceRange(productInfo);
      },
      // End products tab
      // Start customers tab
      addressDialog: false,
      isFormLoaded: true,
      customers: [],
      customerSearch: null,
      selectedCustomer: {},
      newCustomerName: '',
      corporateCustomer: {},
      corporateCouponDiscount: 0,
      isShowCorporateCouponDialog: false,
      customerAddresses: [],
      customerShippingAddress: null,
      customerBillingAddress: null,
      newAddressForCustomer: {
        type: 'both',
      },
      newCustomerAddressTypes: [
        { text: 'Shipping address', value: 'shipping' },
        { text: 'Billing address', value: 'billing' },
        { text: 'Both', value: 'both' },
      ],
      dialogLoading: false,
      divisions: [],
      districts: [],
      areas: [],
      divisionId: '',
      districtId: '',
      isEnableAddCustomer: true,
      isDisabledMobileField: false,
      isDisabledEmailField: false,
      isAvailableMobile: true,
      isAvailableEmail: true,
      getCorporateCoupon() {
        if (this.corporateCustomer && this.corporateCustomer.is_registered) {
          const { partnership } = this.corporateCustomer;
          return partnership && partnership.coupon;
        } else return {};
      },
      getCustomerAddresses(addresses, type) {
        if (addresses && addresses.length > 0) {
          return (
            addresses.filter((address) => address && address.type === type) ||
            []
          );
        }
      },
      isShowCustomerAddressList() {
        return (
          !!(Object.keys(this.selectedCustomer || {}).length > 0) ||
          !!this.newCustomerName
        );
      },
      hasCustomerAddress(type) {
        const addresses = this.customerAddresses;
        return !!addresses.find((address) => address && address.type === type);
      },
      getFullAddress(address) {
        const addressLine =
          address && address.address_line ? address.address_line + ', ' : '';
        const house = address && address.house ? address.house + ', ' : '';
        const street = address && address.street ? address.street + ', ' : '';
        const houseStreet = house + street;
        return `${addressLine || houseStreet}${
          address.area ? address.area + ', ' : ''
        }${address.district ? address.district + ', ' : ''}${
          address.division ? address.division : ''
        }`;
      },
      // End customers tab
      // Start order confirm tab
      paymentMethods: [
        { code: 'cod', name: 'Cash on delivery' },
        { code: 'bkash', name: 'Bkash' },
      ],
      selectedPaymentMethod: 'cod',
      orderComment: '',
      selectedCoupon: null,
      couponDiscount: null,
      shippingCost: null,
      getTotalCartAmount(totalAmount) {
        const cDiscount = this.couponDiscount || 0;
        const sCost = this.shippingCost || 0;
        const totalDeductAmount = cDiscount;
        return totalAmount + sCost - totalDeductAmount;
      },
      getOrderAddress(addressId) {
        if (addressId && this.customerAddresses.length > 0) {
          return this.customerAddresses.find(
            (address) => address.id === addressId
          );
        } else return {};
      },
      confirmLoading: false,
      // End order confirm tab
    };
  },
  computed: {
    user() {
      return this.$auth.user;
    },
  },
  watch: {
    // Start products tab
    productSearch(val) {
      if (val) this.fetchProductSearchDebounced(val);
    },
    selectedProductQty(newVal, oldVal) {
      const selProduct = this.selectedProduct;
      if (!!selProduct && newVal <= (selProduct && selProduct.quantity)) {
        this.isShowQtyErrorMsg = false;
      } else if (selProduct && Number.isInteger(newVal * 1)) {
        this.isShowQtyErrorMsg = true;
      }

      if (
        newVal * 1 &&
        Object.keys(selProduct || {}).length > 0 &&
        newVal <= selProduct.quantity
      ) {
        this.isEnableAddProductBtn = false;
      } else this.isEnableAddProductBtn = true;
    },
    selectedProduct(newVal, oldVal) {
      const productObj = Object.keys(newVal || {});
      if (
        this.selectedProductQty * 1 > 0 &&
        productObj &&
        productObj.length > 0
      ) {
        this.isEnableAddProductBtn = false;
      } else this.isEnableAddProductBtn = true;
    },
    // End products tab
    // Start customer tab
    customerSearch(val) {
      if (val) this.fetchCustomerSearchDebounced(val);
    },
    selectedCustomer(newVal, oldVal) {
      if (newVal && !!newVal.id) {
        this.getCustomerAddress(newVal.id);
        this.isDisabledMobileField = isValidMobile(newVal.mobile);
        this.isDisabledEmailField = isValidEmail(newVal.email);
        this.isEnableAddCustomer = !checkStepTwoValidation(newVal);
      }
    },
    addressDialog(newVal, oldVal) {
      if (!this.addressDialog) {
        this.isFormLoaded = false;
        setTimeout(() => {
          this.isFormLoaded = true;
        }, 100);
      }

      if (!newVal) {
        this.newAddressForCustomer = {};
      }
    },
    customerShippingAddress(newVal, oldVal) {
      if (newVal) {
        this.selectedCustomer.shippingAddressId = newVal;
        this.isEnableAddCustomer = !checkStepTwoValidation(
          this.selectedCustomer
        );
      }
    },
    customerBillingAddress(newVal, oldVal) {
      if (newVal) {
        this.selectedCustomer.billingAddressId = newVal;
        this.isEnableAddCustomer = !checkStepTwoValidation(
          this.selectedCustomer
        );
      }
    },
    // End customer tab
  },
  created() {
    if (this.$route.query.lang) {
      this.language = this.$route.query.lang;
    }
  },
  mounted() {
    window.getApp.$on('REFRESH_PAGE_CONTENT', async () => {
      // await this.getShippingProviders();
    });
    this.getDivisions();

    window.getApp.$on('REFRESH_PAGE_CONTENT', () => {
      this.getDivisions();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // check if object
    checkIfObject(item) {
      return typeof item === 'object';
    },
    // Start products tab methods
    productName: (item) => item.name + ' — ' + item.sku,
    addProductToCart() {
      const productActualPrice = getActualPrice(this.selectedProduct);

      // Check quantity
      if (
        this.selectedProduct &&
        this.selectedProduct.quantity < this.selectedProductQty
      ) {
        errorMessage('Product quantity is not sufficiant!');
        return;
      }

      // Check duplicate product
      if (
        this.selectedProduct &&
        !!this.selectedProductsList.find(
          (item) => item && item.id === this.selectedProduct.id
        )
      ) {
        errorMessage('The product already added!');
        return;
      }

      this.selectedProduct.totalPrice =
        productActualPrice * this.selectedProductQty;
      this.selectedProduct.qty = this.selectedProductQty * 1;
      this.selectedProductsList.push(this.selectedProduct);

      this.products = [];
      this.selectedProduct = '';
      this.selectedProductQty = 1;
    },
    deleteProductItem(productId) {
      const instance = this;
      const sProductList = instance.selectedProductsList;
      confirmationAlert().then((res) => {
        if (res.value && sProductList.length > 0) {
          instance.selectedProductsList = sProductList.filter(
            (product) => product && product.id !== productId
          );
        }
        return false;
      });
    },
    fetchProductSearchDebounced(searchText) {
      const instance = this;
      clearTimeout(this._searchTimerId);
      this._searchTimerId = setTimeout(() => {
        if (searchText) instance.getProducts(searchText);
        else instance.products = [];
      }, 500);
    },
    async getProducts(searchText) {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/product/get-products?query=${searchText}`
        );
        this.products = data;
      } catch (e) {}
    },
    // End products tab methods
    // Start customer tab methods
    customerSearchContent: (item) =>
      item.name + ' — ' + item.email + '-' + item.mobile,
    fetchCustomerSearchDebounced(searchText) {
      const instance = this;
      clearTimeout(this._searchCustomerTimer);
      this._searchCustomerTimer = setTimeout(() => {
        if (searchText.length > 1) instance.getCustomers(searchText);
        else instance.customers = [];
      }, 500);
    },
    async getCustomers(searchText) {
      try {
        const { data } = await this.$axios.$get(
          `get-customers?query=${searchText}`
        );
        this.customers = data;
        if (data && !(data.length > 0)) {
          this.newCustomerName = searchText;
        } else {
          this.newCustomerName = '';
        }
      } catch (e) {}
    },
    async getCustomerAddress(customerId) {
      if (customerId) {
        try {
          const { data } = await this.$axios.$get(
            `customer/address?customer_id=${customerId}`
          );

          this.customerAddresses = data || [];
        } catch (e) {}
      }
    },
    keyupEventOfCustomerSearch(e) {
      if (e.keyCode === 13 && !(this.customers.length > 0)) {
        // Reset customer info before new customer data
        this.selectedCustomer = {};
        // Set data in search text
        if (isValidEmail(this.newCustomerName)) {
          this.selectedCustomer.email = this.newCustomerName;
          document.getElementById('js-email').click();
        } else if (isValidMobile(this.newCustomerName)) {
          this.selectedCustomer.mobile = this.newCustomerName;
          document.getElementById('js-mobile').click();
        } else if (this.newCustomerName) {
          this.selectedCustomer.name = this.newCustomerName;
          document.getElementById('js-name').click();
        }

        this.isDisabledMobileField = false;
        this.isDisabledEmailField = false;

        this.customerAddresses = [];
        this.customerBillingAddress = null;
        this.customerShippingAddress = null;
      }
    },
    openAddressDialog() {
      const instance = this;
      instance.newAddressForCustomer.type = 'both';

      if (instance.selectedCustomer && instance.selectedCustomer.mobile) {
        instance.newAddressForCustomer.mobile =
          instance.selectedCustomer.mobile;
      }

      if (instance.selectedCustomer && instance.selectedCustomer.name) {
        instance.newAddressForCustomer.name = instance.selectedCustomer.name;
      }

      setTimeout(() => {
        instance.addressDialog = true;
        instance.getDivisions();
      }, 200);
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
        if (this.newAddressForCustomer.divisionId) {
          const { data } = await this.$axios.$get(
            `shipping/district-by-division/${this.newAddressForCustomer.divisionId}`
          );
          this.districts = data;
        }
      } catch (e) {}
    },
    async getAreas() {
      try {
        if (this.newAddressForCustomer.districtId) {
          const { data } = await this.$axios.$get(
            `shipping/area-by-district/${this.newAddressForCustomer.districtId}`
          );
          this.areas = data;
        }
      } catch (e) {}
    },
    async getShippingCost() {
      try {
        const shippingAddress = this.getOrderAddress(
          this.customerShippingAddress
        );

        const totalCartAmount =
          this.getTotalProductAmount() - this.couponDiscount;

        const { data } = await this.$axios.$get(
          `shipping/cost/${shippingAddress.area_id}?total_amount=${totalCartAmount}&customerId=${this.selectedCustomer.id}`
        );
        this.shippingCost = data;
      } catch (e) {}
    },
    async getCorporateCustomer() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/corporate/single-employee/${this.selectedCustomer.employee_id}`
        );
        this.corporateCustomer = data;
      } catch (e) {}
    },
    async addAddressFormSubmit() {
      try {
        const {
          divisionId,
          districtId,
          areaId,
          type,
        } = this.newAddressForCustomer;
        const newAddressObj = {
          customer_id: this.selectedCustomer.id,
          status: 'active',
          type: this.newAddressForCustomer.type || 'both',
          default: 0,
          name: this.newAddressForCustomer.name,
          email: this.selectedCustomer.email,
          mobile: this.newAddressForCustomer.mobile,
          address_line: this.newAddressForCustomer.addressLine || '',
          zip: this.newAddressForCustomer.zip || '',
          area: getItemName(this, areaId, 'area') || '',
          district: getItemName(this, districtId, 'district') || '',
          division: getItemName(this, divisionId, 'division') || '',
          country: this.newAddressForCustomer.country || 'Bangladesh',
          area_id: areaId || '',
          district_id: divisionId || '',
          division_id: divisionId || '',
          content: this.newAddressForCustomer.content || '',
        };

        // It's for new address
        if (this.newCustomerName) {
          // set address for new customer user
          setAddressForNewCustomer(this, newAddressObj);
        } else if (type === 'both') {
          await saveAddress(this, {
            ...newAddressObj,
            type: 'shipping',
          });
          await saveAddress(this, {
            ...newAddressObj,
            type: 'billing',
          });
        } else {
          await saveAddress(this, newAddressObj);
        }
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // close dialog
    dialogClose() {
      this.addressDialog = false;
    },
    // End customer tab methods
    // Start order confirmation tab methods
    applyCoupon() {
      this.getCouponDiscountAmount(this.selectedCoupon);
    },
    async getCouponDiscountAmount(couponCode, isCorporate) {
      try {
        let url = `marketing/coupon?platform=manual`;

        if (couponCode) {
          url += `&coupon=${couponCode}`;
        }

        if (this.customerShippingAddress) {
          url += `&areaId=${this.customerShippingAddress}`;
        }

        if (this.getTotalProductAmount()) {
          url += `&cartAmount=${this.getTotalProductAmount()}`;
        }

        if (this.selectedCustomer && this.selectedCustomer.id) {
          url += `&cutomerId=${this.selectedCustomer.id}`;
        }

        const { discount } = await this.$axios.$get(url);
        this.couponDiscount = discount;

        if (isCorporate) {
          this.corporateCouponDiscount = discount;
        }

        if (
          this.corporateCustomer &&
          this.corporateCustomer.is_registered &&
          this.corporateCouponDiscount > discount
        ) {
          this.couponDiscount = this.corporateCouponDiscount;
          this.isShowCorporateCouponDialog = true;
        }

        if (discount) {
          this.getShippingCost();
        }
      } catch (err) {
        if (err.response.status === 406 || err.response.status === 404) {
          const { message } = err.response.data;
          this.$toasted.global.form_error(message);
        }
      }
    },
    async onChangeFieldValue(fieldType) {
      this.isEnableAddCustomer = !checkStepTwoValidation(this.selectedCustomer);

      if (fieldType === 'mobile' && this.selectedCustomer.mobile) {
        const { valid } = await isUniqueMobile(
          this,
          this.selectedCustomer.mobile
        );
        this.isAvailableMobile = valid;
      } else if (fieldType === 'email' && this.selectedCustomer.email) {
        const { valid } = await isUniqueEmail(
          this,
          this.selectedCustomer.email
        );
        this.isAvailableEmail = valid;
      }
    },
    // End order confirmation tab methods
    onBack(step) {
      if (step === 3) {
        this.selectedCustomer.shippingAddressId = this.customerShippingAddress;
        this.selectedCustomer.billingAddressId = this.customerBillingAddress;
        this.isEnableAddCustomer = !checkStepTwoValidation(
          this.selectedCustomer
        );
      }
      this.stepperStage -= 1;
    },
    async onSubmit(type) {
      const productsArray = this.selectedProductsList;

      if (
        type === 'product' &&
        productsArray.length > 0 &&
        this.isEnableAddProductBtn
      )
        this.stepperStage = 2;
      else if (type === 'customer' && !this.isEnableAddCustomer) {
        await this.getShippingCost();
        // Reset corporate customer and again call this
        this.corporateCustomer = {};
        if (this.selectedCustomer && this.selectedCustomer.employee_id) {
          await this.getCorporateCustomer();
          await this.getCouponDiscountAmount(
            this.getCorporateCoupon().code,
            true
          );
        }

        // It's for new address
        if (this.newCustomerName) {
          // Set shipping/biling address for back
          window.shippingId = getInstantAddress(
            this,
            this.customerShippingAddress,
            true
          );
          window.billingId = getInstantAddress(
            this,
            this.customerBillingAddress,
            true
          );

          // Create new customer method
          await this.createNewCustomer();

          const instance = this;
          setTimeout(() => {
            instance.customerShippingAddress = getInstantAddress(
              instance,
              window.shippingId,
              false,
              'shipping'
            );
            instance.customerBillingAddress = getInstantAddress(
              instance,
              window.billingId,
              false,
              'billing'
            );

            delete window.shippingId;
            delete window.billingId;
            instance.newCustomerName = null;
          }, 2000);
        } else {
          // Update existing customer
          this.updateCustomerProfile();
        }

        this.stepperStage = 3;
      } else if (type === 'confirm') {
        try {
          this.confirmLoading = true;

          const orderData = {};
          if (
            this.selectedProductsList &&
            this.selectedProductsList.length > 0
          ) {
            const items = [];
            this.selectedProductsList.forEach((product) => {
              items.push({ productId: product.id, quantity: product.qty });
            });

            orderData.items = items;
          }

          orderData.customerId =
            (this.selectedCustomer && this.selectedCustomer.id) || '';
          orderData.comment = this.orderComment || '';
          orderData.coupon = this.selectedCoupon || null;
          orderData.platform = 'manual';
          orderData.payment_method = this.selectedPaymentMethod || 'cod';

          if (this.customerShippingAddress || this.customerBillingAddress) {
            orderData.static_address = {
              shipping: getStaticAdress(
                this.getOrderAddress(this.customerShippingAddress)
              ),
              billing: getStaticAdress(
                this.getOrderAddress(this.customerBillingAddress)
              ),
            };
          }

          if (
            this.customerShippingAddress &&
            this.getOrderAddress(this.customerShippingAddress)
          ) {
            orderData.areaId = this.getOrderAddress(
              this.customerShippingAddress
            ).area_id;
          }
          const { orderId } = await this.$axios.$post(`order/store`, orderData);
          this.$router.push(`/order/orders/${orderId}`);
        } catch (e) {
          this.confirmLoading = false;
          this.$store.commit(
            'APP_NETWORK_ERROR',
            e.response && e.response.data.message
          );
        }
      }
    },
    // create new customer
    async createNewCustomer() {
      try {
        this.selectedCustomer.status = 'active';
        const data = await this.$axios.$post(
          `/customer`,
          this.selectedCustomer
        );

        // Add address by new customer
        if (data && data.id) {
          this.selectedCustomer = data;
          this.customerAddresses.forEach(async (addressInfo) => {
            await saveAddress(
              this,
              {
                ...addressInfo,
                customer_id: data.id,
              },
              true
            );
          });
        }
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    // Update exist customer
    async updateCustomerProfile() {
      try {
        const data = await this.$axios.$patch(
          `/customer/update-profile/${this.selectedCustomer.id}`,
          this.selectedCustomer
        );
        this.selectedCustomer = data;
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
