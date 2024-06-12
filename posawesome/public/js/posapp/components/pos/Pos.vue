<template>
  <div fluid class="mt-2">
    <ClosingDialog></ClosingDialog>
    <Drafts></Drafts>
    <Returns></Returns>
    <NewAddress></NewAddress>
    <MpesaPayments></MpesaPayments>
    <Variants></Variants>
    <OpeningDialog v-if="dialog" :dialog="dialog"></OpeningDialog>
    <v-row v-show="!dialog">
      <v-col
        v-show="!payment && !offers && !coupons"
        xl="6"
        lg="6"
        md="6"
        sm="6"
        cols="12"
        class="pos pr-0"
      >
        <ItemsSelector></ItemsSelector>
      </v-col>
      <v-col
        v-show="offers"
        xl="5"
        lg="5"
        md="5"
        sm="5"
        cols="12"
        class="pos pr-0"
      >
        <PosOffers></PosOffers>
      </v-col>
      <v-col
        v-show="coupons"
        xl="5"
        lg="5"
        md="5"
        sm="5"
        cols="12"
        class="pos pr-0"
      >
        <PosCoupons></PosCoupons>
      </v-col>
      <v-col
        v-show="payment"
        xl="5"
        lg="5"
        md="5"
        sm="5"
        cols="12"
        class="pos pr-0"
      >
        <Payments></Payments>
      </v-col>

      <v-col xl="6" lg="6" md="6" sm="6" cols="12" class="pos">
        <Invoice></Invoice>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { evntBus } from '../../bus';
import ItemsSelector from './ItemsSelector.vue';
import Invoice from './Invoice.vue';
import OpeningDialog from './OpeningDialog.vue';
import Payments from './Payments.vue';
import PosOffers from './PosOffers.vue';
import PosCoupons from './PosCoupons.vue';
import Drafts from './Drafts.vue';
import ClosingDialog from './ClosingDialog.vue';
import NewAddress from './NewAddress.vue';
import Variants from './Variants.vue';
import Returns from './Returns.vue';
import MpesaPayments from './Mpesa-Payments.vue';
import { method } from 'lodash';

export default {
  data: function () {
    return {
      dialog: false,
      pos_profile: '',
      pos_opening_shift: '',
      payment: false,
      offers: false,
      coupons: false,
      opening_shift_name: '',
      total_cash: 0,
      total_visa: 0,
      total_deliv: 0,
    };
  },

  components: {
    ItemsSelector,
    Invoice,
    OpeningDialog,
    Payments,
    Drafts,
    ClosingDialog,

    Returns,
    PosOffers,
    PosCoupons,
    NewAddress,
    Variants,
    MpesaPayments,
  },

  methods: {
    check_opening_entry() {
      return frappe
        .call('posawesome.posawesome.api.posapp.check_opening_shift', {
          user: frappe.session.user,
        })
        .then((r) => {
          if (r.message) {
            this.pos_profile = r.message.pos_profile;
            this.pos_opening_shift = r.message.pos_opening_shift;
            this.get_offers(this.pos_profile.name);
            evntBus.$emit('register_pos_profile', r.message);
            evntBus.$emit('set_company', r.message.company);
            console.info('LoadPosProfile');
          } else {
            this.create_opening_voucher();
          }
        });
    },
    create_opening_voucher() {
      this.dialog = true;
    },
    get_closing_data() {
      return frappe
        .call(
          'posawesome.posawesome.doctype.pos_closing_shift.pos_closing_shift.make_closing_shift_from_opening',
          {
            opening_shift: this.pos_opening_shift,
          }
        )
        .then((r) => {
          if (r.message) {
            frappe.call({
              method: "posawesome.posawesome.api.posapp.search_invoices_for_current_shift",
              args: {pos_shift: this.opening_shift_name,},
              callback: (g) => {
                for (let inv of g.message) {
                  if(inv.payments.length > 0) {
                    if(inv.payments[0].mode_of_payment === "Cash") {
                      this.total_cash = this.total_cash + inv.total;
                    }
                    if(inv.payments[0].mode_of_payment === "visa") {
                      this.total_visa += inv.total;
                    }
                    this.total_deliv += inv.total_taxes_and_charges;
                  }
                }
                console.log(this.total_cash);
                console.log(this.total_visa);
                console.log(this.total_deliv);
                console.log(r.message);
                if (r.message.payment_reconciliation.length > 0) {
                  for (let mode of r.message.payment_reconciliation) {
                    if (mode.mode_of_payment === "Cash") {
                      mode.expected_amount = this.total_cash;
                    }
                    if (mode.mode_of_payment === "visa") {
                      mode.expected_amount = this.total_visa;
                    }
                    if (mode.mode_of_payment === "Delivery Fees") {
                      mode.expected_amount = this.total_deliv;
                    }
                  }
                }
                this.total_cash = 0;
                this.total_visa = 0;
                this.total_deliv = 0;
                console.log(r.message);
                evntBus.$emit('open_ClosingDialog', r.message);
              },
            });
          } else {
            // console.log(r);
          }
        });
    },
    submit_closing_pos(data) {
      frappe
        .call(
          'posawesome.posawesome.doctype.pos_closing_shift.pos_closing_shift.submit_closing_shift',
          {
            closing_shift: data,
          }
        )
        .then((r) => {
          if (r.message) {
            evntBus.$emit('show_mesage', {
              text: `POS Shift Closed`,
              color: 'success',
            });
            this.check_opening_entry();
          } else {
            console.log(r);
          }
        });
    },
    get_offers(pos_profile) {
      return frappe
        .call('posawesome.posawesome.api.posapp.get_offers', {
          profile: pos_profile,
        })
        .then((r) => {
          if (r.message) {
            console.info('LoadOffers');
            evntBus.$emit('set_offers', r.message);
          }
        });
    },
    get_pos_setting() {
      frappe.db.get_doc('POS Settings', undefined).then((doc) => {
        evntBus.$emit('set_pos_settings', doc);
      });
    },
  },

  mounted: function () {
    this.$nextTick(function () {
      this.check_opening_entry();
      this.get_pos_setting();
      evntBus.$on('close_opening_dialog', () => {
        this.dialog = false;
      });
      evntBus.$on("register_pos_profile", (data) => {
        this.opening_shift_name = data.pos_opening_shift.name;
      });
      evntBus.$on('register_pos_data', (data) => {
        this.pos_profile = data.pos_profile;
        this.get_offers(this.pos_profile.name);
        this.pos_opening_shift = data.pos_opening_shift;
        evntBus.$emit('register_pos_profile', data);
        console.info('LoadPosProfile');
      });
      evntBus.$on('show_payment', (data) => {
        this.payment = true ? data === 'true' : false;
        this.offers = false ? data === 'true' : false;
        this.coupons = false ? data === 'true' : false;
      });
      evntBus.$on('show_offers', (data) => {
        this.offers = true ? data === 'true' : false;
        this.payment = false ? data === 'true' : false;
        this.coupons = false ? data === 'true' : false;
      });
      evntBus.$on('show_coupons', (data) => {
        this.coupons = true ? data === 'true' : false;
        this.offers = false ? data === 'true' : false;
        this.payment = false ? data === 'true' : false;
      });
      evntBus.$on('open_closing_dialog', () => {
        this.get_closing_data();
      });
      evntBus.$on('submit_closing_pos', (data) => {
        this.submit_closing_pos(data);
      });
    });
  },
  beforeDestroy() {
    evntBus.$off('close_opening_dialog');
    evntBus.$off('register_pos_data');
    evntBus.$off('LoadPosProfile');
    evntBus.$off('show_offers');
    evntBus.$off('show_coupons');
    evntBus.$off('open_closing_dialog');
    evntBus.$off('submit_closing_pos');
  },
};
</script>

<style scoped>
.item{
  width: 70%;
}

</style>