<template>
  <div id="customerSingle">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <v-card v-if="customer">
            <v-card-title>
              <h4>Single Customer - &nbsp;</h4>
              <v-chip v-if="customer.status === 'active'" label class="success">
                Active
              </v-chip>
              <v-chip v-else class="info" label>Inactive</v-chip>
              <v-spacer />
              <v-btn
                v-can="`update customer`"
                :to="`/customers/${customer.id}/edit`"
                color="teal"
                outlined
              >
                <v-icon left>mdi-pencil</v-icon> Edit
              </v-btn>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="customer">
        <v-col cols="12">
          <v-row>
            <v-col cols="12" xs="12" sm="6" md="6" lg="6">
              <v-card elevation="1" class="py-4">
                <div class="text-center mb-5">
                  <v-avatar
                    size="128"
                    :class="
                      customer.employee && customer.employee.is_registered
                        ? 'overflow-initial'
                        : ''
                    "
                  >
                    <img :src="customer.avatar" :alt="customer.name" />
                    <template
                      v-if="
                        customer.employee && customer.employee.is_registered
                      "
                    >
                      <img
                        class="avatar-badge"
                        :src="
                          customer.employee.company &&
                          customer.employee.company.badge
                        "
                        :title="customer.employee.company.name"
                      />
                    </template>
                  </v-avatar>
                  <!-- customer.employee && customer.employee.is_registered -->
                </div>
                <v-card-text class="pa-0">
                  <v-simple-table>
                    <tbody>
                      <tr>
                        <th>Name:</th>
                        <td>{{ customer.name }}</td>
                      </tr>
                      <tr>
                        <th>Mobile:</th>
                        <td>{{ customer.mobile }}</td>
                      </tr>
                      <tr>
                        <th>Email:</th>
                        <td>{{ customer.email }}</td>
                      </tr>
                      <tr>
                        <th>Date of birth:</th>
                        <td>
                          {{ getFormatDate(customer.date_of_birth)
                          }}<span
                            v-if="customer.date_of_birth"
                            class="grey--text text--lighten-1"
                            >({{ getAge(customer.date_of_birth) }})</span
                          >
                        </td>
                      </tr>
                      <tr>
                        <th>Gender:</th>
                        <td>
                          <span class="text-capitalize">
                            {{ customer.gender }}</span
                          >
                        </td>
                      </tr>
                      <tr>
                        <th>Primary Language:</th>
                        <td>
                          {{ customer.primary_language }}
                        </td>
                      </tr>
                      <tr>
                        <th>Religion:</th>
                        <td>{{ customer.religion || '-' }}</td>
                      </tr>
                      <tr>
                        <th>Profession:</th>
                        <td>{{ customer.profession || '-' }}</td>
                      </tr>
                      <tr>
                        <th>Company:</th>
                        <td>{{ customer.company && customer.company.name }}</td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" xs="12" sm="6" md="6" lg="6">
              <v-card class="mx-auto">
                <v-list three-line>
                  <template>
                    <v-subheader>Children</v-subheader>
                    <scrollbar style="max-height: 360px">
                      <div v-for="(child, index) in children" :key="child.id">
                        <v-list-item :key="child.id">
                          <v-list-item-avatar>
                            <v-img :src="child.avatar"></v-img>
                          </v-list-item-avatar>

                          <v-list-item-content>
                            <!-- eslint-disable vue/no-v-html -->
                            <v-list-item-title
                              v-html="getChildName(child)"
                            ></v-list-item-title>
                            <v-list-item-subtitle
                              v-html="getChildDetails(child)"
                            ></v-list-item-subtitle>
                            <!--eslint-enable-->
                          </v-list-item-content>
                        </v-list-item>
                        <v-divider
                          v-if="children.length - 1 !== index"
                        ></v-divider>
                      </div>
                    </scrollbar>
                  </template>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12">
          Orders:
          <template>
            <div>
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="(order, index) in orders"
                  :key="index"
                >
                  <template v-if="order">
                    <v-expansion-panel-header disable-icon-rotate>
                      {{ order.order_no }}
                      <template v-slot:actions>
                        <a
                          :href="`/order/orders/${order.id}`"
                          target="_blank"
                          title="Details"
                          class="mr-3 text-decoration-none"
                        >
                          <v-icon color="primary"> mdi-eye </v-icon>
                        </a>
                        <v-icon
                          v-if="order.order_status.code === 'completed'"
                          :color="order.order_status.color"
                          :title="order.order_status.name"
                        >
                          mdi-check
                        </v-icon>
                        <v-icon
                          v-else
                          :color="order.order_status.color"
                          :title="order.order_status.name"
                        >
                          mdi-alert-circle
                        </v-icon>
                      </template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content
                      style="border-top: 1px solid #ccc"
                    >
                      <v-card elevation="0">
                        <v-card-title> General Information </v-card-title>
                        <v-divider />
                        <v-card-text class="pa-0">
                          <v-simple-table dense>
                            <tbody>
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
                                <td>
                                  {{ getPaymentMethod(order.payment_method) }}
                                </td>
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
                              <tr>
                                <th>Order Status:</th>
                                <td class="pt-2 pb-2">
                                  <template v-if="order.order_status">
                                    <v-chip
                                      class="white--text"
                                      :color="order.order_status.color"
                                    >
                                      {{ order.order_status.name }}
                                    </v-chip>
                                  </template>
                                </td>
                              </tr>
                              <tr>
                                <th>Payment Status:</th>
                                <td class="pt-2 pb-2">
                                  <template v-if="order.payment_status">
                                    <v-chip
                                      class="white--text"
                                      :color="order.payment_status.color"
                                    >
                                      {{
                                        order.payment_status &&
                                        order.payment_status.name
                                      }}
                                    </v-chip>
                                  </template>
                                </td>
                              </tr>
                              <tr>
                                <th>Shipping provider:</th>
                                <td>
                                  <template v-if="order.shipping_method">
                                    {{
                                      getShippingProviderName(
                                        order.shipping_method
                                      )
                                    }}
                                  </template>
                                </td>
                              </tr>
                              <tr>
                                <th>Created At:</th>
                                <td>
                                  {{ getFormatDate(order.created_at) }}
                                </td>
                              </tr>
                            </tbody>
                          </v-simple-table>
                        </v-card-text>
                      </v-card>
                      <v-card elevation="0" class="mt-4">
                        <v-card-title> Order note </v-card-title>
                        <v-divider />
                        <v-card-text class="pa-0">
                          <v-simple-table dense>
                            <tbody>
                              <tr>
                                <th>Note:</th>
                                <td>
                                  {{ order.comment ? order.comment : '-' }}
                                </td>
                              </tr>
                              <tr>
                                <th>Send As Gift:</th>
                                <td class="text-capitalize">
                                  {{ order.send_as_gift }}
                                </td>
                              </tr>
                            </tbody>
                          </v-simple-table>
                        </v-card-text>
                      </v-card>
                    </v-expansion-panel-content>
                  </template>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </template>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { format } from 'date-fns';

export default {
  name: 'CustomerSingle',
  data() {
    return {
      language: 'en',
      customer: {
        name: '',
        status: 'active',
      },
      orders: [],
      children: [],
      getChildName(child) {
        const childName =
          !child.name && child.parent_status === 'expecting'
            ? 'Expecting'
            : child.name;
        return `${childName}<span class='grey--text text--lighten-1'>(${
          child.age ? child.age : 'Due ' + child.pregnancy_due_week
        })</span>`;
      },
      getChildDetails(child) {
        let details = '';
        if (child && child.gender) {
          details += `Gender: <span class='grey--text text--lighten-1 text-capitalize'>${child.gender}</span> `;
        }
        if (child && child.blood_group) {
          details += `Blood Group: <span class='grey--text text--lighten-1 text-capitalize'>${child.blood_group}</span> `;
        }

        if (child && child.school) {
          details += `<br/>School: <span class='grey--text text--lighten-1 text-capitalize'>${child.school.name}</span> `;
        }
        return details;
      },
      getFormatDate(date) {
        if (date) return format(new Date(date), 'LL-MMM-yyyy');
        else return '-';
      },
      getAge(date) {
        if (date) {
          const age = calculateAge(date);
          return `${age}${age > 1 ? 'years' : 'year'}`;
        } else return '-';
      },
      getShippingProviderName(providerCode) {
        const providers = this.shippingProviders;
        let name = '-';

        if (providers.length > 0) {
          const providerInfo = providers.find(
            (item) => item.code === providerCode
          );
          if (providerInfo && providerInfo.name) name = providerInfo.name;
        }
        return name;
      },
      paymentMethods: [],
      shippingProviders: [],
      getPaymentMethod(code) {
        if (code) {
          const payment = this.paymentMethods.find(
            (payment) => payment.code === code
          );
          return (payment && payment.name) || '';
        }
        return '';
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getCustomer();
    },
  },
  async mounted() {
    await this.getCustomer();
    await this.getShippingProviders();
    await this.getPaymentMethods();

    setTimeout(async () => {
      await this.getCustomerOrders();
    }, 1000);

    window.getApp.$on('REFRESH_PAGE_CONTENT', async () => {
      await this.getCustomer();
      await this.getCustomerOrders();
      await this.getShippingProviders();
      await this.getPaymentMethods();
    });
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getCustomer() {
      try {
        const { data } = await this.$axios.$get(
          `${process.env.API_URL}/customer/${this.$route.params.id}`
        );
        this.customer = data;
        const childrens = (data && data.childrens) || [];

        if (childrens.length > 0) {
          this.children = [...this.children, ...childrens];
        }
      } catch (e) {
        this.$router.replace('/customers');
      }
    },
    async getCustomerOrders() {
      try {
        const { data } = await this.$axios.$get(
          `${process.env.API_URL}/order/order-all?customerId=${this.customer.id}`
        );
        this.orders = data;
      } catch (e) {}
    },
    // get shipping providers
    async getShippingProviders() {
      try {
        const { data } = await this.$axios.$get(
          `${this.language}/shipping/provider-all`
        );
        this.shippingProviders = data;
      } catch (e) {
        this.$store.commit(
          'APP_NETWORK_ERROR',
          e.response && e.response.data.message
        );
      }
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

const calculateAge = (dob, type) => {
  dob = new Date(dob);
  const diffDate = Date.now() - dob.getTime();
  const ageDT = new Date(diffDate);

  return Math.abs(ageDT.getUTCFullYear() - 1970);
};
</script>
