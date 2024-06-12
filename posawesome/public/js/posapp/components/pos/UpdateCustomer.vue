<template>
  <v-row justify="center">
    <v-dialog
      v-model="customerDialog"
      max-width="600px"
      @click:outside="clear_customer">
      <v-card>
        <v-card-title>
          <span v-if="customer_id" class="headline primary--text">{{
            __('Update Customer')
          }}</span>
          <span v-else class="headline primary--text">{{
            __('Create Customer')
          }}</span>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-container>
            <v-row>
              <!-- customer name -->
              <v-col cols="12">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Customer Name')"
                  background-color="white"
                  hide-details
                  v-model="customer_name"
                ></v-text-field>
              </v-col>
              <!-- first mobile -->
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('First Mobile')"
                  background-color="white"
                  hide-details
                  v-model="first_mobile"
                ></v-text-field>
              </v-col>
              <!-- second mobile -->
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Second Mobile')"
                  background-color="white"
                  hide-details
                  v-model="second_mobile"
                ></v-text-field>
              </v-col>
              <!-- address -->
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Address')"
                  background-color="white"
                  hide-details
                  v-model="address"
                ></v-text-field>
              </v-col>
              <!-- note -->
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Note')"
                  background-color="white"
                  hide-details
                  v-model="note"
                ></v-text-field>
              </v-col>
              <!-- <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Area')"
                  background-color="white"
                  hide-details
                  v-model="area"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Building')"
                  background-color="white"
                  hide-details
                  v-model="building"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Floor')"
                  background-color="white"
                  hide-details
                  v-model="floor"
                ></v-text-field>
              </v-col> -->
              <!-- email -->
              <v-col cols="12">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Email')"
                  background-color="white"
                  hide-details
                  v-model="email_id"
                ></v-text-field>
              </v-col>
              <!-- customer group -->
              <v-col cols="6">
                <v-autocomplete
                  clearable
                  dense
                  auto-select-first
                  color="primary"
                  :label="frappe._('Customer Group')"
                  v-model="group"
                  :items="groups"
                  background-color="white"
                  :no-data-text="__('Group not found')"
                  hide-details
                  required
                >
                </v-autocomplete>
              </v-col>
              <!-- territory -->
              <v-col cols="6">
                <v-autocomplete
                  clearable
                  dense
                  auto-select-first
                  color="primary"
                  :label="frappe._('Territory')"
                  v-model="territory"
                  :items="territorys"
                  background-color="white"
                  :no-data-text="__('Territory not found')"
                  hide-details
                  required
                >
                </v-autocomplete>
              </v-col>
              <!-- <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Tax ID')"
                  background-color="white"
                  hide-details
                  v-model="tax_id"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Mobile No')"
                  background-color="white"
                  hide-details
                  v-model="mobile_no"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Email Id')"
                  background-color="white"
                  hide-details
                  v-model="email_id"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  dense
                  label="Gender"
                  :items="genders"
                  v-model="gender"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  color="primary"
                  :label="frappe._('Referral Code')"
                  background-color="white"
                  hide-details
                  v-model="referral_code"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-menu
                  ref="birthday_menu"
                  v-model="birthday_menu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  dense
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="birthday"
                      :label="frappe._('Birthday')"
                      readonly
                      dense
                      clearable
                      hide-details
                      v-bind="attrs"
                      v-on="on"
                      color="primary"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="birthday"
                    color="primary"
                    no-title
                    scrollable
                    :max="frappe.datetime.now_date()"
                    @input="birthday_menu = false"
                  >
                  </v-date-picker>
                </v-menu>
              </v-col> -->
              <v-col cols="6" v-if="loyalty_program">
                <v-text-field
                  v-model="loyalty_program"
                  :label="frappe._('Loyalty Program')"
                  dense
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="6" v-if="loyalty_points">
                <v-text-field
                  v-model="loyalty_points"
                  :label="frappe._('Loyalty Points')"
                  dense
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" dark @click="close_dialog">{{
            __('Close')
          }}</v-btn>
          <v-btn color="success" dark @click="submit_dialog">{{
            __('Submit')
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { evntBus } from '../../bus';
export default {
  data: () => ({
    customerDialog: false,
    first_mobile: '',
    second_mobile: '',
    address: '',
    pos_profile: '',
    customer_id: '',
    customer_name: '',
    email_id: '',
    note: '',
    referral_code: '',
    birthday: null,
    birthday_menu: false,
    group: 'Individual',
    groups: [],
    territory: '',
    territorys: [],
    genders: [],
    customer_type: 'Individual',
    gender: '',
    loyalty_points: null,
    loyalty_program: null,
  }),
  watch: {},
  methods: {
    set_customer_id(){
      this.customer_id = localStorage.getItem("customer_id");
    },
    close_dialog() {
      this.customerDialog = false;
      this.clear_customer();
    },
    clear_customer() {
      this.customer_name = '';
      this.email_id = '';
      this.group = frappe.defaults.get_user_default('Customer Group');
      this.territory = frappe.defaults.get_user_default('Territory');
      this.customer_id = '';
      this.customer_type = 'Individual';
      this.loyalty_points = null;
      this.loyalty_program = null;
      this.first_mobile = '';
      this.second_mobile = '';
      this.city = '';
      this.area = '';
      this.department = '';
      this.floor = '';
    },
    getCustomerGroups() {
      if (this.groups.length > 0) return;
      const vm = this;
      frappe.db
        .get_list('Customer Group', {
          fields: ['name'],
          filters: { is_group: 0 },
          limit: 1000,
          order_by: 'name',
        })
        .then((data) => {
          if (data.length > 0) {
            data.forEach((el) => {
              vm.groups.push(el.name);
            });
          }
        });
    },
    getCustomerTerritorys() {
      if (this.territorys.length > 0) return;
      const vm = this;
      frappe.db
        .get_list('Territory', {
          fields: ['name'],
          filters: { is_group: 0 },
          limit: 5000,
          order_by: 'name',
        })
        .then((data) => {
          if (data.length > 0) {
            data.forEach((el) => {
              vm.territorys.push(el.name);
            });
          }
        });
    },
    getGenders() {
      const vm = this;
      frappe.db
        .get_list('Gender', {
          fields: ['name'],
          page_length: 10,
        })
        .then((data) => {
          if (data.length > 0) {
            data.forEach((el) => {
              vm.genders.push(el.name);
            });
          }
        });
    },
    submit_dialog() {
      // validate if all required fields are filled
      if (this.customer_name || this.first_mobile || this.address) {
        const vm = this;
        const args = {
          customer_id: this.customer_id,
          customer_name: this.customer_name,
          company: this.pos_profile.company,
          email_id: this.email_id,
          address: this.address,
          second_mobile: this.second_mobile,
          first_mobile: this.first_mobile ?? "",
          customer_group: this.group,
          territory: this.territory,
          customer_type: this.customer_type,
          gender: this.gender,
          method: this.customer_id ? 'update' : 'create',
          pos_profile_doc: this.pos_profile,
          note: this.note ? this.note : '',
        };
        frappe.call({
          method: 'posawesome.posawesome.api.posapp.create_customer',
          args: args,
          callback: (r) => {
            if (!r.exc && r.message.name) {
              let text = __('Customer created successfully.');
              if (vm.customer_id) {
                text = __('Customer updated successfully.');
              }
              evntBus.$emit('show_mesage', {
                text: text,
                color: 'success',
              });
              args.name = r.message.name;
              frappe.utils.play_sound('submit');
              evntBus.$emit('add_customer_to_list', args);
              evntBus.$emit('set_customer', r.message.name);
              evntBus.$emit('fetch_customer_details');
              this.close_dialog();
            } else {
              frappe.utils.play_sound('error');
              evntBus.$emit('show_mesage', {
                text: __('Customer creation failed.'),
                color: 'error',
              });
            }
          },
        });
        this.customerDialog = false;
      }
    },
  },
  created: function () {
    evntBus.$on('open_update_customer', (data) => {
      this.customerDialog = true;
      if (data) {
        this.customer_name = data.customer_name;
        this.customer_id = data.name;
        this.tax_id = data.tax_id;
        this.first_mobile = data.first_mobile;
        this.email_id = data.email_id;
        this.referral_code = data.referral_code;
        this.birthday = data.birthday;
        this.group = data.customer_group;
        this.territory = data.territory;
        this.loyalty_points = data.loyalty_points;
        this.loyalty_program = data.loyalty_program;
        this.gender = data.gender;
      }
    });
    evntBus.$on('register_pos_profile', (data) => {
      this.pos_profile = data.pos_profile;
    });
    evntBus.$on('payments_register_pos_profile', (data) => {
      this.pos_profile = data.pos_profile;
    });
    this.getCustomerGroups();
    this.getCustomerTerritorys();
    this.getGenders();
    // set default values for customer group and territory from user defaults
    this.group = frappe.defaults.get_user_default('Customer Group');
    this.territory = frappe.defaults.get_user_default('Territory');
  },
};
</script>
