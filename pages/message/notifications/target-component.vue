<template>
  <div id="targetComponent">
    <v-simple-table dense>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Key</th>
            <th class="text-left">Conditon</th>
            <th class="text-left">Value</th>
            <th class="text-center" style="width: 165px">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(target, k) in targetsList" :key="k">
            <td class="pt-3 pb-3">
              <v-select
                v-model="target.key"
                class="pt-3 pb-3"
                :items="getTargetKeyList(k, target)"
                label="Key"
                outlined
                hide-details
                dense
                :click="onChangeTargetKey(k, target)"
              ></v-select>
            </td>
            <td class="pt-3 pb-3">
              <v-select
                v-model="target.condition"
                class="pt-3 pb-3"
                :items="getTargetConditionList(target.key)"
                label="Operation"
                outlined
                hide-details
                dense
                @change="onChangeTargetCondition(target)"
              ></v-select>
            </td>
            <td class="pt-3 pb-3">
              <template v-if="showInputTextField(target.key)">
                <div class="d-flex align-center" title="Month">
                  <b-text
                    v-model="target.firstValue"
                    rules="numeric"
                    outlined
                    label="Start"
                    dense
                    hide-details
                  />
                  <b-text
                    v-model="target.lastValue"
                    rules="numeric"
                    outlined
                    label="End"
                    dense
                    hide-details
                  />
                  <div>M</div>
                </div>
              </template>
              <template v-else-if="showMultiSelect(target.key)">
                <v-select
                  v-model="target.value"
                  class="pt-3 pb-3"
                  :items="getTargetValueList(target)"
                  label="Value"
                  outlined
                  hide-details
                  dense
                  multiple
                  @change="onChangeTargetValue()"
                >
                  <template v-slot:selection="{ item, index }">
                    <v-chip v-if="index === 0">
                      <span>{{ item.text }}</span>
                    </v-chip>
                    <span v-if="index === 1" class="grey--text text-caption">
                      (+{{ target.value.length - 1 }} others)
                    </span>
                  </template>
                </v-select>
              </template>
              <template v-else="">
                <v-select
                  v-model="target.value"
                  class="pt-3 pb-3"
                  :items="getTargetValueList(target)"
                  label="Value"
                  outlined
                  hide-details
                  dense
                  @change="onChangeTargetValue()"
                ></v-select>
              </template>
            </td>
            <td class="pt-3 pb-3">
              <v-btn class="decor" color="blue" @click.stop="addRow()">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
              <v-btn
                class="decor"
                color="red"
                @click.stop="removeRow(k, target)"
              >
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
export default {
  name: 'TargetComponent',
  components: {},
  props: {
    targetsList: {
      type: Array,
      default: () => {},
    },
    options: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      targetConditionList: [
        { text: 'Between', value: 'between' },
        { text: 'Not Between', value: 'not_between' },
      ],
      keyList: [
        { text: 'Child Age', value: 'child_age' },
        { text: 'Child Expecting', value: 'child_expecting' },
        { text: 'User Gender', value: 'user_gender' },
      ],
      itemList: [],
      targetValueList: childAgeRange,
      getTargetConditionList(key) {
        if (key && multiSelectKeysList.includes(key)) {
          return [
            { text: 'Is in', value: 'in' },
            { text: 'Is not in', value: 'nin' },
          ];
        }
        return this.targetConditionList;
      },
      getTargetValueList(target) {
        if (target && target.key === 'child_age') return childAgeRange;
        else if (target && target.key === 'user_gender') return userGenderList;
        else if (target && target.key === 'child_expecting')
          return userExpectingList;
        else return childAgeRange;
      },
      showMultiSelect(key) {
        if (key && multiSelectKeysList.includes(key)) return true;
        else return false;
      },
      showInputTextField(key) {
        if (key && inputKeysList.includes(key)) return true;
        else return false;
      },
      getTargetKeyList(k, target) {
        return this.keyList;
      },
    };
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    addRow() {
      this.targetsList.push({
        key: '',
        condition: '',
        value: '',
      });
    },
    removeRow(index, item) {
      // Remove row
      const idx = this.targetsList.indexOf(item);
      if (idx > 0) {
        this.targetsList.splice(idx, 1);
      }
    },
    onChangeTargetKey(k, target) {
      this.targetsListTrriger();
    },
    onChangeTargetCondition(item) {
      this.targetsListTrriger();
    },
    onChangeTargetValue() {
      this.targetsListTrriger();
    },
    targetsListTrriger() {
      this.$emit('input', this.targetsList);
    },
  },
};

const inputKeysList = ['child_age', 'child_expecting'];

const multiSelectKeysList = [
  'user_gender',
  'child_gender',
  'location',
  'parent_type',
  'religion',
  'profession',
  'company',
  'education',
  'child_school',
  'child_class',
  'child_doctor',
  'child_blood_group',
];

const userGenderList = [
  { text: 'Male', value: 'male' },
  { text: 'Female', value: 'female' },
  { text: 'Others', value: 'others' },
];

const childAgeRange = [
  { text: 'Expecting', value: '0-11-m-expecting' },
  { text: '0M-6M', value: '0-6-m-parent' },
  { text: '6M-12M', value: '6-12-m-parent' },
  { text: '12M-24M', value: '12-24-m-parent' },
  { text: '24M-36M', value: '24-36-m-parent' },
  { text: '36M-48M', value: '36-48-m-parent' },
  { text: '48M-60M', value: '48-60-m-parent' },
  { text: '60M-96M', value: '60-96-m-parent' },
  { text: '96M+', value: '96-900-m-parent' },
];

const userExpectingList = [{ text: '0-12M', value: '12-m' }];
</script>
