import frappe
from frappe import _

# get data from docType
@frappe.whitelist()
def get_data_from_kitchen(screen_number):
    try:
        fields_to_fetch = ["custom_quantity", "item_name", "status", "naming_series", "order_number"]

        filters = {"status": "pending", "custom_screen_no" : screen_number}

        # Get data from the doctype
        data = frappe.get_all("Kitchen Orders", filters=filters, fields=fields_to_fetch)

        return {
            "message": data
        }
    except Exception as e:
        frappe.log_error(_("Error fetching data from Kitchen Orders: {0}").format(e))
        frappe.throw(_("Error fetching data from Kitchen Orders"))


# update item in the doctype
@frappe.whitelist()
def update_field_for_item(docname):
    try:
        # Get the document
        frappe.db.set_value("Kitchen Orders" , docname , "status" , "done")

    except Exception as e:
        frappe.log_error(_("Error updating field: {0}").format(e))
        frappe.throw(_("Error updating field"))