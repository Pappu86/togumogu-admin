<template>
  <div>
    <div :class="`${paper} ${mode}`">
      <div v-if="order" class="buttons">
        <n-link :to="`/order/orders/${order.id}/invoice`" class="btn warning">
          Go Back
        </n-link>
        <button class="btn success" @click.stop="printPage">Print</button>
      </div>
    </div>
    <div v-if="order" class="sheet padding-5mm">
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
            <strong> {{ order.comment ? order.comment : '-' }}</strong> <br />
          </div>
          <div style="flex-basis: 35%">
            Order Date: {{ getOrderDate(order.created_at) }} <br />
            Invoice Number : {{ order.invoice_no }} <br />
            Order Number : {{ order.order_no }} <br />
            Payment Method : {{ getPaymentMethod(order.payment_method) }} <br />
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
                  <del style="opacity: 0.5">{{ item.regular_unit_price }}</del>
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
                ৳ {{ getSubTotalAmount() }}
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
            <h3 style="margin-bottom: 10px">Thank you for shopping with us.</h3>
            <p>
              We have launched ToguMogu parenting app for you. Please scan and
              download our app for all parenting services.
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
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { format } from 'date-fns';

export default {
  name: 'PrintSingle',
  layout: 'print',
  data() {
    return {
      language: 'en',
      dialog: false,
      loading: false,
      getSubTotalAmount() {
        const { products } = this.order;
        let subTotal = 0;
        if (products?.length > 0) {
          products.forEach((product) => {
            subTotal += product.quantity * product.selling_unit_price;
          });
        }
        return subTotal;
      },
      getShippingAddress() {
        return this.order.static_address.shipping;
      },
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
  head() {
    return {
      style: [
        {
          cssText: `@page { size: ${this.paper} ${this.mode} }`,
          type: 'text/css',
        },
      ],
    };
  },
  // eslint-disable-next-line vue/order-in-components
  computed: {
    ...mapState('print', ['order', 'mode', 'paper', 'title']),
  },
  // eslint-disable-next-line vue/order-in-components
  mounted() {
    document
      .querySelector('body')
      .setAttribute('class', `${this.paper} ${this.mode}`);

    this.getPaymentMethods();
  },
  // eslint-disable-next-line vue/order-in-components
  methods: {
    printPage() {
      window.print();
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
