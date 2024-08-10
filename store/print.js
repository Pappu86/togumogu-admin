const UPDATED_ORDER = 'UPDATED_ORDER';
const UPDATED_FIELDS = 'UPDATED_FIELDS';
const EMPTY_FIELDS = 'EMPTY_FIELDS';
const UPDATED_PAGE_MODE = 'UPDATED_PAGE_MODE';
const UPDATED_PAGE_SIZE = 'UPDATED_PAGE_SIZE';
const UPDATED_PAGE_TITLE = 'UPDATED_PAGE_TITLE';

const state = () => ({
  table_fields: [],
  order: null,
  mode: 'portrait',
  paper: 'A4',
  title: '',
  civilDivisions: [],
  mechanicalDivisions: [],
});

const mutations = {
  [EMPTY_FIELDS](state) {
    state.table_fields = [];
  },
  [UPDATED_FIELDS](state, payload) {
    state.table_fields = payload;
  },
  [UPDATED_PAGE_MODE](state, payload) {
    state.mode = payload;
  },
  [UPDATED_PAGE_SIZE](state, payload) {
    state.paper = payload;
  },
  [UPDATED_PAGE_TITLE](state, payload) {
    state.title = payload;
  },
  [UPDATED_ORDER](state, payload) {
    state.order = payload;
  },
};

const actions = {
  updateFields({ commit }, payload) {
    commit(EMPTY_FIELDS);
    commit(UPDATED_FIELDS, payload);
  },
  updateProperties({ commit }, payload) {},
};

export default {
  state,
  mutations,
  actions,
};
