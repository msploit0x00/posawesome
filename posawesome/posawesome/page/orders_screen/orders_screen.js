frappe.pages['orders-screen'].on_page_load = function(wrapper) {
	new MyPage(wrapper);

	fetchData();
	//repeated function to get orders realtime
	// setInterval(fetchData, 5000);
}

//get profile
function getProfile() {
	var item_group = undefined;
	frappe.call({
		async: false,
        method: "frappe.client.get_value",
        args: {
            doctype: "User",
            filters: { name: frappe.session.user },
            fieldname: "email"
        },
        callback: function(response) {
            if (response.message) {
                var userEmail = response.message.email;
                if (userEmail) {
                    frappe.call({
						async: false,
                        method: "frappe.client.get",
                        args: {
                            doctype: "POS Profile",
                            filters: { "custom_assign_user": userEmail },
                        },
                        callback: function(r) {
                            if (r.message) {
                                item_group = r.message.custom_screens_number;
                            } else {
                                console.error('Failed to fetch POS Profile for the user.');
                            }
                        }
                    });
                } else {
                    console.error('User is not of type "System User".');
                }
            } else {
                console.error('Failed to fetch user information.');
            }
        }
    });
	return item_group;
}

//get data from kitchen screen doctype
function fetchData() {
	var screen_number = getProfile();
	setInterval(function() {
		frappe.call({
		method: "posawesome.posawesome.page.orders_screen.orders_screen.get_data_from_kitchen",
		args: {screen_number: screen_number},
		callback: function(r) {
			ordersList = r.message.message;
			regenerateTable(ordersList);
		},
		})
	}, 5000);
	
}

//Page Content
MyPage = Class.extend({
	init: function(wrapper){
		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: 'Orders List',
			single_column: true
		});
		//make page
		this.make();
	},

	//make page
	make: function() {
		//grab the class
		let me = $(this);
		
		//push dom element to page
		$(frappe.render_template(frappe.posawesome_page.body, this)).appendTo(this.page.main);

		// Set the page property in frappe.posawesome_page
        frappe.posawesome_page.page = this.page;
	}
})

function changeStatus(i) {
	///send new data to doctype
	frappe.call({
		method: "posawesome.posawesome.page.orders_screen.orders_screen.update_field_for_item",
		args: {docname: ordersList[i].order_number},
		callback: function(r) {
			console.log(r.message);
		},
	})
	ordersList.splice(i, 1);
	regenerateTable(ordersList);
}

let ordersList = [];

//HTML content
let body = `<div> 
				<table style="text-align: center; width: 100%;">
					<tr style="height: 50px;">
						<td style="width: 25%; border: 1px solid grey; background: #D3D3D3">Order No.</td>
						<td style="width: 25%; border: 1px solid grey; background: #D3D3D3">Order</td>
						<td style="width: 25%; border: 1px solid grey; background: #D3D3D3">Status</td>
						<td style="width: 25%; border: 1px solid grey; background: #D3D3D3">Submit</td>
					</tr>
			`;

if(ordersList.length > 0) {
	for(let i = 0; i < ordersList.length; i++) {
		if(ordersList[i].status === 'pending'){
			body += `<tr>
                	<td style="width: 20%; border: 1px solid grey; padding: 5px">${ordersList[i].naming_series}</td>
                	<td style="width: 20%; border: 1px solid grey; padding: 5px">${ordersList[i].item_name}</td>
					<td style="width: 20%; border: 1px solid grey; padding: 5px">${ordersList[i].custom_quantity}</td>
                	<td style="width: 20%; border: 1px solid grey; padding: 5px">${ordersList[i].status}</td>
                	<td style="width: 20%; border: 1px solid grey;"><button onclick="changeStatus(${i})" style="padding: 0px 20px 0px 20px; border-radius: 15px">Done</button></td>
            	</tr>`;
		}
	}
} else {
	body += `<tr style="text-align: center;"><td colspan="4"><h2>No Orders Yet</h2></td></tr>`;
}

body += `</table></div>`;

frappe.posawesome_page = {
	body: body,
}

// Function to regenerate the table with updated data
function regenerateTable(array) {
	console.log(array);
    let newBody = `<div> 
                    <table style="text-align: center; width: 100%;">
                        <tr style="height: 50px;">
                            <td style="width: 20%; border: 1px solid grey; background: #D3D3D3">Order No.</td>
                            <td style="width: 20%; border: 1px solid grey; background: #D3D3D3">Order</td>
							<td style="width: 20%; border: 1px solid grey; background: #D3D3D3">Quantity</td>
                            <td style="width: 20%; border: 1px solid grey; background: #D3D3D3">Status</td>
                            <td style="width: 20%; border: 1px solid grey; background: #D3D3D3">Submit</td>
                        </tr>`;

	if(array.length > 0) {
		for (let i = 0; i < array.length; i++) {
			if(array[i].status === 'pending'){
				newBody += `<tr>
						<td style="width: 20%; border: 1px solid grey; padding: 5px">${array[i].order_number}</td>
						<td style="width: 20%; border: 1px solid grey; padding: 5px">${array[i].item_name}</td>
						<td style="width: 20%; border: 1px solid grey; padding: 5px">${array[i].custom_quantity}</td>
						<td style="width: 20%; border: 1px solid grey; padding: 5px">${array[i].status}</td>
                        <td style="width: 20%; border: 1px solid grey;padding: 5px"><button onclick="changeStatus(${i})" style="padding: 0px 20px 0px 20px; border-radius: 15px">Done</button></td>
                    </tr>`;
			}
    	}
	}else{
		newBody += `<tr style="text-align: center;"><td colspan="5"><h2>No Orders Yet</h2></td></tr>`;
	}
    

    newBody += `</table></div>`;

    // Update the page content with the regenerated table
    frappe.posawesome_page.body = newBody;
    frappe.posawesome_page.page.main.html(newBody);
}