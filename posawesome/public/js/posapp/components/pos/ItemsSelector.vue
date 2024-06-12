<template>
  <div>
    <v-row>
      <!-- card of items groups -->
      <v-card class="selection mx-auto grey lighten-5 mt-3 pt-2 pb-5 pl-2 " style="overflow: auto; width: 25%; max-height: 670px;">
        <v-col>
          <!-- all item groups -->
            <div fluid class="items">
            <v-col dense class="overflow-y-auto">
              <v-row
                v-for= "(item, index) in all_groups_details"
                :key="index"
                xl="1"
                lg="1"
                md="1"
                sm="1"
                cols="6"
                min-height="50"
                v-show="item.visible"
                :style="{padding: (item.name === 'ALL')? '0px 0px 10px 0px' : (item.parent_item_group !== 'All Item Groups')? '0px 0px 10px 20px' : '0px 0px 10px 0px'}"
              >
                <v-card hover="hover" @click="selectItem(item.name)" style="width: 80%; text-align: center;">
                  <v-img
                    
                    class="white--text align-end"
                    style="text-align: center;"
                    :gradient="calculateGradient(item)"
                    height="40px"
                  >
                  {{ item.name }}
                  </v-img>
                  <!-- <v-card-text
                      class="text--primary pa-1" 
                    >
                    <v-card-text class="text-caption primary--text" :style="{background: calculateGradient(item)}">
                      
                    </v-card-text>
                  </v-card-text> -->
                </v-card>
              </v-row>
            </v-col>
          </div>
        </v-col>
      </v-card>
      <!-- body card -->
      <v-card class="selection mx-auto grey lighten-5 mt-3" style="width: 75%;">
      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        top
        color="info"
      ></v-progress-linear>
      <v-row class="items px-2 py-1">
        <v-col cols="5" class="pb-0 mb-2">
          <!-- //text field for search -->
          <v-text-field
            dense
            clearable
            autofocus
            outlined
            color="primary"
            :label="frappe._('Search Items')"
            hint="Search by item code, serial number, batch no or barcode"
            background-color="white"
            hide-details
            v-model="debounce_search"
            @keydown.esc="esc_event"
            @keydown.enter="search_onchange"
            ref="debounce_search"
          ></v-text-field>
        </v-col>
        <v-col cols="3" class="pb-0 mb-2" v-if="pos_profile.posa_input_qty">
          <!-- text field for quantity -->
          <v-text-field
            dense
            outlined
            color="primary"
            :label="frappe._('QTY')"
            background-color="white"
            hide-details
            v-model.number="qty"
            type="number"
            @keydown.enter="enter_event"
            @keydown.esc="esc_event"
          ></v-text-field>
        </v-col>
        <!-- add in new line -->
        <v-col cols="2" class="pb-0 mb-2" v-if="pos_profile.posa_new_line">
          <v-checkbox
            v-model="new_line"
            color="accent"
            value="true"
            label="NLine"
            dense
            hide-details
          ></v-checkbox>
        </v-col>
        <v-col cols="12" class="pt-0 mt-0">
          <!-- //display items card -->
          <div fluid class="items" v-if="items_view == 'card'">
            <v-row dense class="overflow-y-auto" style="max-height: 67vh">
              <v-col
                v-for="(item, idx) in filtred_items"
                :key="idx"
                xl="2"
                lg="3"
                md="6"
                sm="6"
                cols="6"
                min-height="50"
              >
                <v-card hover="hover" @click="add_item(item)">
                  <v-img
                    :src="
                      item.image ||
                      '/assets/posawesome/js/posapp/components/pos/placeholder-image.png'
                    "
                    class="white--text align-end"
                    gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,0.4)"
                    
                  >
                    <!-- <v-card-text
                      v-text="item.item_name"
                      class="text-caption px-1 pb-0"
                    ></v-card-text> -->
                  </v-img>
                  <v-card-text class="text--primary pa-1">
                    <div style="color: black;">
                      {{ item.item_name }}
                    </div>
                    <div class="text-caption primary--text">
                      {{ currencySymbol(item.currency) || '' }}
                      {{ formtCurrency(item.rate) || 0 }}
                    </div>
                    <div class="text-caption golden--text">
                      {{ formtFloat(item.actual_qty) || 0 }}
                      {{ item.stock_uom || '' }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
          <!-- //display items list -->
          <div fluid class="items" v-if="items_view == 'list'">
            <div class="my-0 py-0 overflow-y-auto" style="max-height: 75vh">
              <template>
                <v-data-table
                  :headers="getItmesHeaders()"
                  :items="filtred_items"
                  item-key="item_code"
                  class="elevation-1"
                  :items-per-page="itemsPerPage"
                  hide-default-footer
                  @click:row="add_item"
                >
                  <template v-slot:item.rate="{ item }">
                    <span class="primary--text"
                      >{{ currencySymbol(item.currency) }}
                      {{ formtCurrency(item.rate) }}</span
                    >
                  </template>
                  <template v-slot:item.actual_qty="{ item }">
                    <span class="golden--text">{{
                      formtFloat(item.actual_qty)
                    }}</span>
                  </template>
                </v-data-table>
              </template>
            </div>
          </div>
        </v-col>
        <v-col>
          <v-row>
            <!-- //switch between list $ card -->
            <v-col>
              <v-btn-toggle
                v-model="items_view"
                color="primary"
                group
                dense
                rounded>
                <v-btn small value="list">{{ __('List') }}</v-btn>
                <v-btn small value="card">{{ __('Card') }}</v-btn>
              </v-btn-toggle>
            </v-col>
          <!-- //coupons button -->
            <v-col cols="4">
              <v-btn small block color="primary" text @click="show_coupons"
                >{{ couponsCount }} {{ __('Coupons') }}</v-btn>
            </v-col>
          <!-- //offers button -->
            <v-col cols="5" >
              <v-btn small block color="primary" text @click="show_offers"
              >{{ offersCount }} {{ __('Offers') }} : {{ appliedOffersCount }}
              {{ __('Applied') }}</v-btn>
            </v-col>
          </v-row>  
        </v-col>
        <v-dialog v-model="bundleDialogVisible" max-width="600px">
          <v-card>
            <v-card-title>Select bundle items</v-card-title>
            <v-card-text>
              <div v-for="(dropdown, index) in dropdowns" :key="index" class="d-flex align-center">
                <v-select
                  :value="dropdown.defaultValue"
                  :items="dropdown.options"
                  label="Select option"
                  outlined
                  dense
                  @input="dropdown.defaultValue = $event"
                  class="mr-2"
                ></v-select>
                <v-text-field
                  v-model.number="dropdown.qty"
                  label="Qty"
                  type="number"
                  outlined
                  dense
                  style="max-width: 100px;"
                ></v-text-field>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn text @click="closeDialog">Close</v-btn>
              <v-btn text @click="done">Done</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
      </v-card>
    </v-row>
  </div>
</template>

<script>
import { evntBus } from '../../bus';
import format from '../../format';
import _ from 'lodash';

export default {
  mixins: [format],
  data: () => ({
    bundleDialogVisible: false,
    dropdowns: [],
    totalBundles: 0,
    pos_profile: '',
    flags: {},
    items_view: 'list',
    item_group: 'ALL',
    loading: false,
    items_group: ['ALL'],
    items_groups_details: [],
    all_groups_details: [{'name' : 'ALL', 'image' : '/assets/posawesome/js/posapp/components/pos/placeholder-image.png', 'is_group' : 0, 'visible': true}],
    item_group_logo: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmBcgw2neM5l4XgR_eWnLjT88WcnoQjTQzFJV8lJO-rQ&s",],
    items: [],
    search: '',
    first_search: '',
    itemsPerPage: 1000,
    offersCount: 0,
    appliedOffersCount: 0,
    couponsCount: 0,
    appliedCouponsCount: 0,
    customer_price_list: null,
    new_line: false,
    qty: 1,
    isDropdownOpen: true,
  }),

  watch: {
    filtred_items(new_value, old_value) {
      if (!this.pos_profile.pose_use_limit_search) {
        if (new_value.length != old_value.length) {
          this.update_items_details(new_value);
        }
      }
    },
    customer_price_list() {
      this.get_items();
    },
    new_line() {
      evntBus.$emit('set_new_line', this.new_line);
    },
  },

  methods: {
    openDialog() {
        this.bundleDialogVisible = true;
        evntBus.$emit("open_bundle");
    },
    closeDialog() {
        this.bundleDialogVisible = false;
    },
    async done() {
      var totalQty = 0;
      var drops = this.dropdowns;
      for(var dd of drops) {
        totalQty = totalQty + dd.qty;
      }
      if(totalQty > this.totalBundles) {
        return;
      }
      for (var drop of drops) {
        console.log(JSON.stringify(drop));
        try {
          const response = await frappe.call({
            method: 'posawesome.posawesome.api.posapp.get_single_item',
            args: { item_code: drop.defaultValue },
          });
          response.message.discount_amount_per_item = response.message.rate - drop.rate;
          response.message.rate = drop.rate;
          response.message.qty = drop.qty;
          response.message.idx = 0;
          response.message.posa_is_offer = 1;
          response.message.posa_notes = drop.bundleName;
          if(response.message.qty > 0) {
            this.add_item(response.message);
          }
        } catch (error) {
          console.error("Error fetching item:", error);
        }
      }
      this.closeDialog();
    },
    calculateGradient(index) {
      if (index.name === this.item_group) {
        return 'to bottom, rgba(0,0,0,0), rgba(135,211,124,0.8)';
      } else {
        return 'to bottom, rgba(0,0,0,0), rgba(0,0,0,0.4)';
      }
    },
    show_offers() {
      evntBus.$emit('show_offers', 'true');
    },
    show_coupons() {
      evntBus.$emit('show_coupons', 'true');
    },
    get_groups_details() {
      if (!this.pos_profile) {
        console.error('No POS Profile');
        return;
      }
      const vm = this;
      frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_item_groups_2',
        args: {
          pos_profile: this.pos_profile.name,
        },
        callback: function (r) {
          if(r.message){
            vm.items_groups_details = r.message;
          }else{
            vm.items_groups_details = [];
          }
        },
      }).then(this.get_items_groups);
    },
    get_items() {
      if (!this.pos_profile) {
        console.error('No POS Profile');
        return;
      }
      const vm = this;
      this.loading = true;
      let search = this.get_search(this.first_search);
      let gr = '';
      let sr = '';
      if (search) {
        sr = search;
      }
      if (vm.item_group != 'ALL') {
        gr = vm.item_group.toLowerCase();
      }
      if (
        vm.pos_profile.posa_local_storage &&
        localStorage.items_storage &&
        !vm.pos_profile.pose_use_limit_search
      ) {
        vm.items = JSON.parse(localStorage.getItem('items_storage'));
        evntBus.$emit('set_all_items', vm.items);
        vm.loading = false;
      }
      frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_items',
        args: {
          pos_profile: vm.pos_profile,
          price_list: vm.customer_price_list,
          item_group: gr,
          search_value: sr,
        },
        callback: function (r) {
          if (r.message) {
            vm.items = r.message;
            evntBus.$emit('set_all_items', vm.items);
            vm.loading = false;
            if (
              vm.pos_profile.posa_local_storage &&
              !vm.pos_profile.pose_use_limit_search
            ) {
              localStorage.setItem('items_storage', '');
              try {
                localStorage.setItem(
                  'items_storage',
                  JSON.stringify(r.message)
                );
              } catch (e) {
                console.error(e);
              }
            }
            if (vm.pos_profile.pose_use_limit_search) {
              vm.enter_event();
            }
          }
        },
      });
    },
    get_items_groups() {
      if (!this.pos_profile) {
        console.log('No POS Profile');
        return;
      }
      if (this.pos_profile.item_groups.length > 0) {
        for(var subArray of this.items_groups_details){
          var object = subArray[0];
          if(object.name !== 'All Item Groups'){
            if(object.parent_item_group === 'All Item Groups' && object.is_group === 0){
              object.visible = true;
              if(object.image !== null){
                this.all_groups_details.push(object);
              }else{
                object.image = '/assets/posawesome/js/posapp/components/pos/placeholder-image.png';
                this.all_groups_details.push(object);
              }
            }else if(object.parent_item_group === 'All Item Groups' && object.is_group === 1){
              object.visible = true;
              if(object.image !== null){
                this.all_groups_details.push(object);
              }else{
                object.image = '/assets/posawesome/js/posapp/components/pos/placeholder-image.png';
                this.all_groups_details.push(object);
              }
              for(var children of this.items_groups_details){
                var child = children[0];
                if(child.parent_item_group === object.name){
                  child.visible = false;
                  if(child.image !== null){
                    this.all_groups_details.push(child);
                  }else{
                    child.image = "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.webp?s=2048x2048&w=is&k=20&c=dFWJz1EFJt7Tq2lA-hgTpSW119YywTWtS4EwU3fpKrE=";
                    this.all_groups_details.push(child);
                  }
                }
              }
            }
          }
        }
      }else {
        const vm = this;
        frappe.call({
          method: 'posawesome.posawesome.api.posapp.get_items_groups',
          args: {},
          callback: function (r) {
            if (r.message) {
              r.message.forEach((element) => {
                vm.items_group.push(element.name);
              });
            }
          },
        });
      }
    },
    getItmesHeaders() {
      const items_headers = [
        {
          text: __('Name'),
          align: 'start',
          sortable: true,
          value: 'item_name',
        },
        {
          text: __('Code'),
          align: 'start',
          sortable: true,
          value: 'item_code',
        },
        { text: __('Rate'), value: 'rate', align: 'start' },
        { text: __('Available QTY'), value: 'actual_qty', align: 'start' },
        { text: __('UOM'), value: 'stock_uom', align: 'start' },
      ];
      if (!this.pos_profile.posa_display_item_code) {
        items_headers.splice(1, 1);
      }

      return items_headers;
    },
    add_item(item) {
      item = { ...item };
      if (item.has_variants) {
        evntBus.$emit('open_variants_model', item, this.items);
      } else if (item.custom_bundle_options) {
        this.dropdowns = [];
        this.totalBundles = 0;
        var bundleOptions = item.custom_bundle_options.bundle_options.slice(); // Make a copy of the array
        var items = item.custom_bundle_options.items; // Access the items list

        // Create a map to group options by bundle_item
        var bundleMap = {};

        // Iterate over bundleOptions to populate the bundleMap
        for (var i = 0; i < bundleOptions.length; i++) {
          var option = bundleOptions[i];
          var bundleItem = option.bundle_item;
          if (!bundleMap[bundleItem]) {
            // Find the rate and qty of the bundleItem from the items list
            var itemRate = items.find(it => it.item_code === bundleItem).rate;
            var itemQty = items.find(it => it.item_code === bundleItem).qty;
            bundleMap[bundleItem] = { rate: itemRate, options: [bundleItem], qty: itemQty, bundleName: item.item_code }; // Start with the bundle_item itself
          }
          bundleMap[bundleItem].options.push(option.option);
        }

        // Transform the bundleMap into dropdowns array
        for (var key in bundleMap) {
          if (bundleMap.hasOwnProperty(key)) {
            this.dropdowns.push({ defaultValue: bundleMap[key].options[0], options: bundleMap[key].options, rate: bundleMap[key].rate, qty: bundleMap[key].qty, bundleName: bundleMap[key].bundleName });
            this.totalBundles = this.totalBundles + bundleMap[key].qty;
          }
        }

        this.openDialog();
      } else {
        if (!item.qty || item.qty === 1) {
          item.qty = Math.abs(this.qty);
        }
        evntBus.$emit('add_item', item);
        this.qty = 1;
      }
    },
    enter_event() {
      let match = false;
      if (!this.filtred_items.length || !this.first_search) {
        return;
      }
      const qty = this.get_item_qty(this.first_search);
      const new_item = { ...this.filtred_items[0] };
      new_item.qty = flt(qty);
      new_item.item_barcode.forEach((element) => {
        if (this.search == element.barcode) {
          new_item.uom = element.posa_uom;
          match = true;
        }
      });
      if (
        !new_item.to_set_serial_no &&
        new_item.has_serial_no &&
        this.pos_profile.posa_search_serial_no
      ) {
        new_item.serial_no_data.forEach((element) => {
          if (this.search && element.serial_no == this.search) {
            new_item.to_set_serial_no = this.first_search;
            match = true;
          }
        });
      }
      if (this.flags.serial_no) {
        new_item.to_set_serial_no = this.flags.serial_no;
      }
      if (
        !new_item.to_set_batch_no &&
        new_item.has_batch_no &&
        this.pos_profile.posa_search_batch_no
      ) {
        new_item.batch_no_data.forEach((element) => {
          if (this.search && element.batch_no == this.search) {
            new_item.to_set_batch_no = this.first_search;
            new_item.batch_no = this.first_search;
            match = true;
          }
        });
      }
      if (this.flags.batch_no) {
        new_item.to_set_batch_no = this.flags.batch_no;
      }
      if (match) {
        this.add_item(new_item);
        this.search = null;
        this.first_search = null;
        this.debounce_search = null;
        this.flags.serial_no = null;
        this.flags.batch_no = null;
        this.qty = 1;
        this.$refs.debounce_search.focus();
      }
    },
    search_onchange() {
      const vm = this;
      if (vm.pos_profile.pose_use_limit_search) {
        vm.get_items();
      } else {
        vm.enter_event();
      }
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    selectItem(item) {
      this.item_group = item;
      for(var object of this.all_groups_details){
        if(object.parent_item_group === item){
          object.visible = !object.visible;
        }
      }
    },
    get_item_qty(first_search) {
      let scal_qty = Math.abs(this.qty);
      if (first_search.startsWith(this.pos_profile.posa_scale_barcode_start)) {
        let pesokg1 = first_search.substr(7, 5);
        let pesokg;
        if (pesokg1.startsWith('0000')) {
          pesokg = '0.00' + pesokg1.substr(4);
        } else if (pesokg1.startsWith('000')) {
          pesokg = '0.0' + pesokg1.substr(3);
        } else if (pesokg1.startsWith('00')) {
          pesokg = '0.' + pesokg1.substr(2);
        } else if (pesokg1.startsWith('0')) {
          pesokg =
            pesokg1.substr(1, 1) + '.' + pesokg1.substr(2, pesokg1.length);
        } else if (!pesokg1.startsWith('0')) {
          pesokg =
            pesokg1.substr(0, 2) + '.' + pesokg1.substr(2, pesokg1.length);
        }
        scal_qty = pesokg;
      }
      return scal_qty;
    },
    get_search(first_search) {
      let search_term = '';
      if (
        first_search &&
        first_search.startsWith(this.pos_profile.posa_scale_barcode_start)
      ) {
        search_term = first_search.substr(0, 7);
      } else {
        search_term = first_search;
      }
      return search_term;
    },
    esc_event() {
      this.search = null;
      this.first_search = null;
      this.qty = 1;
      this.$refs.debounce_search.focus();
    },
    update_items_details(items) {
      const vm = this;
      frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_items_details',
        args: {
          pos_profile: vm.pos_profile,
          items_data: items,
        },
        callback: function (r) {
          if (r.message) {
            items.forEach((item) => {
              const updated_item = r.message.find(
                (element) => element.item_code == item.item_code
              );
              item.actual_qty = updated_item.actual_qty;
              item.serial_no_data = updated_item.serial_no_data;
              item.batch_no_data = updated_item.batch_no_data;
              item.item_uoms = updated_item.item_uoms;
            });
          }
        },
      });
    },
    update_cur_items_details() {
      this.update_items_details(this.filtred_items);
    },
    scan_barcoud() {
      const vm = this;
      onScan.attachTo(document, {
        suffixKeyCodes: [],
        keyCodeMapper: function (oEvent) {
          oEvent.stopImmediatePropagation();
          return onScan.decodeKeyEvent(oEvent);
        },
        onScan: function (sCode) {
          setTimeout(() => {
            vm.trigger_onscan(sCode);
          }, 300);
        },
      });
    },
    trigger_onscan(sCode) {
      if (this.filtred_items.length == 0) {
        evntBus.$emit('show_mesage', {
          text: `No Item has this barcode "${sCode}"`,
          color: 'error',
        });
        frappe.utils.play_sound('error');
      } else {
        this.enter_event();
        this.debounce_search = null;
        this.search = null;
      }
    },
  },

  computed: {
    filtred_items() {
      this.search = this.get_search(this.first_search);
      if (!this.pos_profile.pose_use_limit_search) {
        let filtred_list = [];
        let filtred_group_list = [];
        if (this.item_group != 'ALL') {
          filtred_group_list = this.items.filter((item) =>
            item.item_group
              .toLowerCase()
              .includes(this.item_group.toLowerCase())
          );
        } else {
          filtred_group_list = this.items;
        }
        if (!this.search || this.search.length < 3) {
          if (
            this.pos_profile.posa_show_template_items &&
            this.pos_profile.posa_hide_variants_items
          ) {
            return (filtred_list = filtred_group_list
              .filter((item) => !item.variant_of)
              .slice(0, 50));
          } else {
            return (filtred_list = filtred_group_list.slice(0, 50));
          }
        } else if (this.search) {
          filtred_list = filtred_group_list.filter((item) => {
            let found = false;
            for (let element of item.item_barcode) {
              if (element.barcode == this.search) {
                found = true;
                break;
              }
            }
            return found;
          });
          if (filtred_list.length == 0) {
            filtred_list = filtred_group_list.filter((item) =>
              item.item_code.toLowerCase().includes(this.search.toLowerCase())
            );
            if (filtred_list.length == 0) {
              filtred_list = filtred_group_list.filter((item) =>
                item.item_name.toLowerCase().includes(this.search.toLowerCase())
              );
            }
            if (
              filtred_list.length == 0 &&
              this.pos_profile.posa_search_serial_no
            ) {
              filtred_list = filtred_group_list.filter((item) => {
                let found = false;
                for (let element of item.serial_no_data) {
                  if (element.serial_no == this.search) {
                    found = true;
                    this.flags.serial_no = null;
                    this.flags.serial_no = this.search;
                    break;
                  }
                }
                return found;
              });
            }
            if (
              filtred_list.length == 0 &&
              this.pos_profile.posa_search_batch_no
            ) {
              filtred_list = filtred_group_list.filter((item) => {
                let found = false;
                for (let element of item.batch_no_data) {
                  if (element.batch_no == this.search) {
                    found = true;
                    this.flags.batch_no = null;
                    this.flags.batch_no = this.search;
                    break;
                  }
                }
                return found;
              });
            }
          }
        }
        if (
          this.pos_profile.posa_show_template_items &&
          this.pos_profile.posa_hide_variants_items
        ) {
          return filtred_list.filter((item) => !item.variant_of).slice(0, 50);
        } else {
          return filtred_list.slice(0, 50);
        }
      } else {
        return this.items.slice(0, 50);
      }
    },
    debounce_search: {
      get() {
        return this.first_search;
      },
      set: _.debounce(function (newValue) {
        this.first_search = newValue;
      }, 200),
    },
  },

  created: function () {
    this.$nextTick(function () {});
    evntBus.$on('register_pos_profile', (data) => {
      this.pos_profile = data.pos_profile;
      this.get_items();
      //this.get_items_groups();
      this.get_groups_details();
      this.items_view = this.pos_profile.posa_default_card_view
        ? 'card'
        : 'list';
    });
    evntBus.$on('update_cur_items_details', () => {
      this.update_cur_items_details();
    });
    evntBus.$on('update_offers_counters', (data) => {
      this.offersCount = data.offersCount;
      this.appliedOffersCount = data.appliedOffersCount;
    });
    evntBus.$on('update_coupons_counters', (data) => {
      this.couponsCount = data.couponsCount;
      this.appliedCouponsCount = data.appliedCouponsCount;
    });
    evntBus.$on('update_customer_price_list', (data) => {
      this.customer_price_list = data;
    });
  },

  mounted() {
    this.scan_barcoud();
  },
};
</script>

<style scoped>

.percent-width {
    width: 60%;
}

.card {
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  width: 80%;
}

.card:hover {
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
}

.container {
  padding: 2px 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.group-image {
  width: 100%; 
  height: 50px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

</style>