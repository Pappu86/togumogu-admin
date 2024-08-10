<template>
  <div id="productSingle">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col>
          <v-card v-if="product">
            <v-card-title>
              <h4>Single Product - &nbsp;</h4>
              <v-chip v-if="product.status" label class="success">
                Published
              </v-chip>
              <v-chip v-else class="info" label>Saved</v-chip>
              <v-spacer />
              <b-language v-model="language" />
              <v-btn
                v-can="`update product`"
                :to="`/product/products/${product.id}/edit`"
                color="teal"
                outlined
              >
                <v-icon left>mdi-pencil</v-icon> Edit
              </v-btn>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="product">
        <v-col>
          <v-card>
            <v-img v-if="product.image" contain :src="product.image"></v-img>

            <v-row>
              <v-col cols="12" sm="8">
                <v-simple-table>
                  <template v-slot:default>
                    <tbody>
                      <tr>
                        <td><strong>Name:</strong></td>
                        <td>{{ product.name }}</td>
                      </tr>
                      <tr>
                        <td><strong>Date:</strong></td>
                        <td>{{ product.datetime | toDayDateTimeString }}</td>
                      </tr>
                      <tr>
                        <td><strong>SKU:</strong></td>
                        <td>{{ product.sku }}</td>
                      </tr>
                      <tr>
                        <td><strong>Quantity:</strong></td>
                        <td>{{ product.quantity }}</td>
                      </tr>
                      <tr>
                        <td><strong>Purchased Price:</strong></td>
                        <td>{{ product.purchased_price }}</td>
                      </tr>
                      <tr>
                        <td><strong>Selling Price:</strong></td>
                        <td>{{ product.price }}</td>
                      </tr>
                      <tr>
                        <td><strong>Special Price:</strong></td>
                        <td>{{ product.special_price }}</td>
                      </tr>
                      <tr>
                        <td><strong>Special Start Date:</strong></td>
                        <td>
                          {{ product.special_start_date | toDayDateTimeString }}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Special End Date:</strong></td>
                        <td>
                          {{ product.special_end_date | toDayDateTimeString }}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Excerpt:</strong></td>
                        <td>{{ product.excerpt }}</td>
                      </tr>
                      <tr>
                        <td><strong>Minimum Buying Limit:</strong></td>
                        <td>{{ product.min }}</td>
                      </tr>
                      <tr>
                        <td><strong>Maximum Buying Limit:</strong></td>
                        <td>{{ product.max }}</td>
                      </tr>
                      <tr>
                        <td><strong>Weight:</strong></td>
                        <td>{{ product.weight }}</td>
                      </tr>
                      <tr>
                        <td><strong>Width:</strong></td>
                        <td>{{ product.width }}</td>
                      </tr>
                      <tr>
                        <td><strong>Height:</strong></td>
                        <td>{{ product.height }}</td>
                      </tr>
                      <tr>
                        <td><strong>Warranty Note:</strong></td>
                        <td>{{ product.warranty_note }}</td>
                      </tr>
                      <tr>
                        <td><strong>Delivery Note:</strong></td>
                        <td>{{ product.delivery_note }}</td>
                      </tr>
                      <tr>
                        <td><strong>Payment Note:</strong></td>
                        <td>{{ product.payment_note }}</td>
                      </tr>
                      <tr>
                        <td><strong>Meta Title:</strong></td>
                        <td>{{ product.meta_title }}</td>
                      </tr>
                      <tr>
                        <td><strong>Meta Description:</strong></td>
                        <td>{{ product.meta_description }}</td>
                      </tr>
                      <tr>
                        <td><strong>Meta Keyword:</strong></td>
                        <td>{{ product.meta_keyword }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
              <v-col cols="12" sm="4">
                <v-simple-table>
                  <template v-slot:default>
                    <tbody>
                      <tr>
                        <td><strong>Category:</strong></td>
                        <td>
                          <div>
                            <v-chip
                              v-for="category in product.categories"
                              :key="category.id"
                              outlined
                              class="ma-1"
                            >
                              {{ category.name }}
                            </v-chip>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Filter:</strong></td>
                        <td>
                          <div>
                            <v-chip
                              v-for="filter in product.filters"
                              :key="filter.id"
                              outlined
                              class="ma-1"
                            >
                              {{ filter.name }}
                            </v-chip>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Tag:</strong></td>
                        <td>
                          <div>
                            <v-chip
                              v-for="tag in product.tags"
                              :key="tag.id"
                              outlined
                              class="ma-1"
                            >
                              {{ tag.name }}
                            </v-chip>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
                <v-subheader>Aditional Images</v-subheader>
                <v-divider />
                <v-row>
                  <v-col
                    v-for="(image, i) in product.images"
                    :key="i"
                    cols="12"
                    sm="4"
                  >
                    <v-img :src="image.src" />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-card-text>
              <v-subheader>Dynamic Tabs</v-subheader>
              <v-divider />
              <v-tabs>
                <template v-for="tab in product.tabs">
                  <v-tab :key="tab.id">{{ tab.title }}</v-tab>
                  <v-tab-item :key="tab.id">
                    <!--  eslint-disable-next-line vue/no-v-html -->
                    <div v-html="tab.content"></div>
                  </v-tab-item>
                </template>
              </v-tabs>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'ProductSingle',
  data() {
    return {
      language: 'en',
      product: {
        name: '',
        excerpt: '',
        content: '',
        date: '',
        time: '',
        categories: [],
        status: 0,
      },
    };
  },
  watch: {
    language(newVal, oldVal) {
      if (newVal !== oldVal) this.getProduct();
    },
  },
  mounted() {
    this.getProduct();
    window.getApp.$on('REFRESH_PAGE_CONTENT', () => this.getProduct());
  },
  beforeDestroy() {
    window.getApp.$off('REFRESH_PAGE_CONTENT');
  },
  methods: {
    async getProduct() {
      try {
        const { data } = await this.$axios.$get(
          `${process.env.API_URL}/${this.language}/product/product/${this.$route.params.id}`
        );
        this.product = data;
      } catch (e) {
        this.$router.replace('/product/products');
      }
    },
  },
};
</script>
