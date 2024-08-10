<template>
  <div id="orderSingle">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col cols="12" md="8">
          <div style="display: flex">
            <h3>Order Invoice</h3>
            <v-spacer />
            <v-btn class="primary" @click.stop="printDialog = true">
              <v-icon left>mdi-printer</v-icon> Print
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row v-if="order">
        <!-- Start invoice table design -->
        <v-col cols="12" md="8" style="background-color: #f3f3f3">
          <div id="invoiceSheetEl">
            <div
              style="
                margin: 0px;
                display: flex;
                align-items: flex-end;
                padding: 20px 0px;
              "
            >
              <div style="padding: 15px 15px 0 0; flex-basis: 65%">
                <img
                  alt="Invoice logo"
                  width="200"
                  src="~assets/images/invoice-logo.png"
                />
              </div>
              <div style="flex-basis: 35%">
                <strong> ToguMogu Pvt. Limited </strong> <br />
                Rezina Garden, House 67/A, Road 9/A, <br />
                Dhanmondi, Dhaka, Bangladesh <br />
                +88-0194-4665577
              </div>
            </div>

            <div
              style="
                margin: 0px;
                display: flex;
                align-items: flex-end;
                padding: 20px 0px;
              "
            >
              <div style="padding: 15px 15px 0 0; flex-basis: 65%">
                <h1 style="margin-bottom: 10px">Invoice</h1>
                <strong> {{ getShippingAddress().name }}</strong> <br />
                Contact Number:
                <strong> {{ getShippingAddress().mobile }}</strong> <br />
                Address:
                <strong>
                  {{ getShippingAddress().address_line }}
                  {{ getShippingAddress().area }},
                  {{ getShippingAddress().district }}
                  {{ getShippingAddress().division }}
                  {{
                    getShippingAddress().zip ? -getShippingAddress().zip : ''
                  }}</strong
                ><br />
                Payment Status:
                <strong> {{ order.payment_status.name }}</strong> <br />
                Special note:
                <strong> {{ order.comment ? order.comment : '-' }}</strong>
                <br />
              </div>
              <div style="flex-basis: 35%">
                Order Date: {{ getOrderDate(order.created_at) }} <br />
                Order Number : {{ order.order_no }} <br />
                Invoice Number : {{ order.invoice_no }} <br />
                Payment Method : {{ getPaymentMethod(order.payment_method) }}
                <br />
                Platform : {{ order.platform }} <br />
                Total quantity : {{ order.total_quantity }}
              </div>
            </div>

            <table CELLSPACING="0" style="margin-bottom: 20px; width: 100%">
              <thead>
                <tr>
                  <th
                    style="text-align: left; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    #
                  </th>
                  <th
                    style="text-align: left; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    Product
                  </th>
                  <th
                    style="text-align: right; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    Quantity
                  </th>
                  <th
                    style="text-align: right; height: 40px; width: 110px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    Unit Price
                  </th>
                  <th
                    style="text-align: right; height: 40px; width: 110px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in order.products" :key="i">
                  <td
                    style="height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    {{ i + 1 }}
                  </td>
                  <td
                    style="height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    <template v-if="item.product">
                      {{ item.product.name }}
                    </template>
                  </td>
                  <td
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    {{ item.quantity }}
                  </td>
                  <td
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    ৳{{ item.selling_unit_price }}
                    <small
                      v-if="item.selling_unit_price !== item.regular_unit_price"
                    >
                      <del style="opacity: 0.5">{{
                        item.regular_unit_price
                      }}</del>
                    </small>
                  </td>
                  <td
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    ৳{{ item.quantity * item.selling_unit_price }}
                  </td>
                </tr>
                <tr>
                  <th
                    colspan="4"
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    Sub-Total
                  </th>
                  <td
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    ৳ {{ subTotalAmount }}
                  </td>
                </tr>
                <tr>
                  <td
                    colspan="4"
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    Discount
                  </td>
                  <td
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    -৳ {{ order.coupon_discount }}
                  </td>
                </tr>
                <tr>
                  <td
                    colspan="4"
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    Delivery cost
                  </td>
                  <td
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    ৳ {{ order.shipping_cost }}
                  </td>
                </tr>
                <tr>
                  <th
                    colspan="4"
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    Total
                  </th>
                  <td
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    ৳ {{ order.total_amount }}
                  </td>
                </tr>
                <tr v-if="order.coupon_discount || order.special_discount">
                  <td
                    colspan="4"
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    Total save
                  </td>
                  <td
                    style="text-align: right; height: 40px; border-bottom: thin solid rgba(0, 0, 0, 0.12; background: #FFFFFF; padding: 0 16px;"
                  >
                    ৳ {{ order.coupon_discount + order.special_discount }}
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              style="
                margin: 0px;
                display: flex;
                text-align: center;
                align-items: center;
                padding: 20px 0;
              "
            >
              <div style="padding: 15px">
                <h3 style="margin-bottom: 10px">
                  Thank you for shopping with us.
                </h3>
                <p>
                  We have launched ToguMogu parenting app for you. Please scan
                  and download our app for all parenting services.
                </p>
              </div>
              <div>
                <h3 style="margin-bottom: 10px">Scan Now</h3>
                <img alt="qr-code" src="~assets/images/qr_code.png" />
                <img
                  alt="Togumogu logo"
                  width="250"
                  height="65"
                  src="~assets/images/logo.png"
                />
              </div>
            </div>
          </div>
        </v-col>
        <!-- End invoice table design -->

        <!-- <v-col class="mt-5 pt-5" cols="12" md="8">
          <v-card>
            <v-card-title> Product Information </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in order.products" :key="i">
                    <td>
                      <template v-if="item.product">
                        {{ item.product.name }}
                      </template>
                    </td>
                    <td>
                      {{ item.quantity }}
                    </td>
                    <td>৳{{ item.quantity * item.price }}</td>
                  </tr>
                  <template v-if="order.emi_info">
                    <tr v-if="order.emi_info.includeReg">
                      <th colspan="2">Registration & Insurance</th>
                      <td>৳{{ order.emi_info.regInsuranceCharge }}</td>
                    </tr>
                    <tr>
                      <th colspan="2">Total Installment</th>
                      <td>{{ order.emi_info.month }}</td>
                    </tr>
                    <tr>
                      <th colspan="2">Installment Percentage</th>
                      <td>{{ order.emi_info.interest }}%</td>
                    </tr>
                    <tr>
                      <th colspan="2">Monthly Installment</th>
                      <td>৳{{ order.emi_info.payable }}</td>
                    </tr>
                    <tr>
                      <th colspan="2">Down Payment</th>
                      <td>৳{{ order.emi_info.downPayment }}</td>
                    </tr>
                  </template>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
          <v-row>
            <v-col cols="12" md="6">
              <AddressCard
                v-if="order.static_address"
                :address="order.static_address.billing"
                label="Billing Address"
              />
            </v-col>
            <v-col cols="12" md="6">
              <AddressCard
                v-if="order.static_address"
                :address="order.static_address.shipping"
                label="Shipping Address"
              />
            </v-col>
          </v-row>
        </v-col> -->
        <v-col cols="12" md="4" class="pt-0">
          <v-card>
            <v-card-title> General Information </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <tbody>
                  <tr>
                    <th>Order Date:</th>
                    <td>{{ getOrderDate(order.created_at) }} <br /></td>
                  </tr>
                  <tr>
                    <th>Order No:</th>
                    <td>{{ order.order_no }}</td>
                  </tr>
                  <tr>
                    <th>Invoice No:</th>
                    <td>{{ order.invoice_no }}</td>
                  </tr>
                  <tr>
                    <th>Payment Method:</th>
                    <td>{{ getPaymentMethod(order.payment_method) }}</td>
                  </tr>
                  <tr>
                    <th>Platform:</th>
                    <td>{{ order.platform }}</td>
                  </tr>
                  <tr>
                    <th>Total Quantity:</th>
                    <td>{{ order.total_quantity }}</td>
                  </tr>
                  <tr>
                    <th>Total Amount:</th>
                    <td>৳{{ order.total_amount }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
          <v-card v-if="order.customer" class="mt-4">
            <v-card-title> Customer Information </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <tbody>
                  <tr>
                    <th>Name:</th>
                    <td>{{ order.customer.name }}</td>
                  </tr>
                  <tr>
                    <th>Mobile:</th>
                    <td>
                      {{ order.customer.mobile ? order.customer.mobile : '-' }}
                    </td>
                  </tr>
                  <tr>
                    <th>Email:</th>
                    <td>
                      {{ order.customer.email ? order.customer.email : '-' }}
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
          <v-card v-if="order.showroom" class="mt-4">
            <v-card-title> Showroom Information </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-simple-table dense>
                <tbody>
                  <tr>
                    <th>Name:</th>
                    <td>{{ order.showroom.name }}</td>
                  </tr>
                  <tr v-if="order.showroom.contacts">
                    <th>Mobile:</th>
                    <td>
                      <span
                        v-for="(showroom, idx) in order.showroom.contacts"
                        :key="idx"
                      >
                        {{ showroom.mobile }}&nbsp;&nbsp;
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Email:</th>
                    <td>{{ order.showroom.email }}</td>
                  </tr>
                  <tr>
                    <th>Address:</th>
                    <td>{{ order.showroom.address }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Print page options dialog -->
    <v-dialog v-model="printDialog" max-width="450">
      <v-card>
        <v-card-title class="justify-space-between primary white--text">
          <span class="sub-headline">Please choose printable options</span>
          <v-btn icon dark class="ma-0" @click.stop="printDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-radio-group v-model="printable.mode" row class="justify-center">
            <v-radio value="portrait" label="Portrait" />
            <v-radio value="landscape" label="Landscape" />
          </v-radio-group>
          <v-radio-group
            v-model="printable.paper"
            row
            class="justify-center mt-0"
          >
            <v-radio
              v-for="paper in papers"
              :key="paper"
              :value="paper"
              :label="paper"
            />
          </v-radio-group>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn class="primary" :loading="generating" @click="printInvoice">
            Generate Page
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { format } from 'date-fns';

export default {
  name: 'OrderInvoice',
  data() {
    return {
      language: 'en',
      dialog: false,
      printDialog: false,
      loading: false,
      order: null,
      subTotalAmount: 0,
      getShippingAddress() {
        return this.order.static_address.shipping;
      },
      generating: false,
      printable: {
        title: '',
        mode: 'portrait',
        paper: 'A4',
      },
      papers: ['A3', 'A4', 'A5', 'letter', 'legal'],
      paymentMethods: [],
      getPaymentMethod(code) {
        if (code) {
          const payment = this.paymentMethods.find(
            (payment) => payment.code === code
          );
          return (payment && payment.name) || '';
        }
        return '';
      },
      getOrderDate(createdAt) {
        if (createdAt) return format(new Date(createdAt), 'dd LLLL yyyy');
        else return '';
      },
    };
  },
  async mounted() {
    await this.getOrder();
    await this.getPaymentMethods();
    window.getApp.$on('REFRESH_PAGE_CONTENT', async () => {
      await this.getOrder();
      await this.getPaymentMethods();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    // get order
    async getOrder() {
      try {
        const { data } = await this.$axios.$get(
          `order/order/${this.$route.params.id}`
        );

        this.order = data;
        if (Object.keys(data || {}).length > 0) {
          const { products } = data;
          if (products?.length > 0) {
            const instance = this;
            products.forEach((product) => {
              instance.subTotalAmount +=
                product.quantity * product.selling_unit_price;
            });
          }
        }
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
    },
    printInvoice() {
      this.generating = true;
      this.order = Object.assign({}, { ...this.order, image: this.image });
      this.$store.commit('print/UPDATED_PAGE_MODE', this.printable.mode);
      this.$store.commit('print/UPDATED_PAGE_SIZE', this.printable.paper);
      this.$store.commit('print/UPDATED_ORDER', this.order);

      setTimeout(() => {
        this.generating = false;
        this.$router.push('/print-single');
      }, 1000);
    },
    // get payment_methods
    async getPaymentMethods() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/payment/payment-method`
        );

        this.paymentMethods = data;
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
