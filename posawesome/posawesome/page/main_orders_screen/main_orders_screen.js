frappe.pages['main-orders-screen'].on_page_load = function(wrapper) {
	new MyPage(wrapper);

	fetchData();
	// setInterval(fetchData, 5000);
}

function fetchData() {
	console.log('getting data');
	frappe.call({
		method: "posawesome.posawesome.page.main_orders_screen.main_orders_screen.get_data_from_kitchen",
		// args: {profile_screen_number},
		callback: function(r) {
			console.log(r.message.message[0]);
			ordersList = r.message.message;
			regenerateTable(ordersList);
		},
	})
}

MyPage = Class.extend({
	init: function(wrapper) {
		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: 'Done Orders',
			single_column: true,
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
	},
})

function changeStatus(i) {
	///send new data to doctype
	frappe.call({
		method: "posawesome.posawesome.page.main_orders_screen.main_orders_screen.update_field_for_item",
		args: {docname: ordersList[i].order_number},
		callback: function(r) {
			console.log(r.message);
		},
	})
	ordersList.splice(i, 1);
	regenerateTable(ordersList);
}

let ordersList = [
	{'name' : 'coffee1', 'order' : '346457', 'status' : 'pending'},
	{'name' : 'coffee2', 'order' : '346457', 'status' : 'pending'},
	{'name' : 'coffee3', 'order' : '346457', 'status' : 'pending'},
	{'name' : 'coffee4', 'order' : '346457', 'status' : 'pending'},
];

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
	console.log('start render');
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
			if(array[i].status === 'done'){
				newBody += `<tr>
                	<td style="width: 20%; border: 1px solid grey; padding: 5px">${ordersList[i].order_number}</td>
                	<td style="width: 20%; border: 1px solid grey; padding: 5px">${ordersList[i].item_name}</td>
					<td style="width: 20%; border: 1px solid grey; padding: 5px">${ordersList[i].custom_quantity}</td>
                	<td style="width: 20%; border: 1px solid grey; padding: 5px">${ordersList[i].status}</td>
                	<td style="width: 20%; border: 1px solid grey;"><button onclick="changeStatus(${i})" style="padding: 0px 20px 0px 20px; border-radius: 15px">Done</button></td>
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