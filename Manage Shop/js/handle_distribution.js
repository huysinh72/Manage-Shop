var shopId = getCookie("shopId");
if(shopId == null)
	window.location.href='login.html?preUrl='+window.location.href;
document.getElementById("user").innerHTML = "<i class=\"fa fa-user\"></i> "+ getCookie("username") +"<b class=\"caret\"></b>";
var Shop = "Shop";
var database = firebase.database(); 

$('#table_distribution').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [2,3,4] },

    ]
});

$('#table_distributionHistory').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [3] },

    ]
});


var table_distribution = $('#table_distribution').DataTable();
var table_distributionHistory = $('#table_distributionHistory').DataTable();

var list_product = [];
var list_distribution = [];
var keyBranchProducts = [];
var countProduct = 1;
var countDistribution = 1;
var branches = [];
var saleQuantities = [];


var app = new Vue({
	el: '#app',
	data: {
		selectedProduct: {},
	    products: [],
	    selectedDistributionType: {},
	    distributions: ['Equal distribution', 'Optimal distribution'],
	    importTimes : ['Recent import time', 'Old import time'],
	   	selectedImportTime: '',
	   	quantity: 0,
	   	quantityDisplay: 0
	},
	methods: {
		loadData :function (){
			this.products = [];
			this.selectedImportTime = this.importTimes[0];
			this.selectedDistributionType = this.distributions[0];
			database.ref().child(Shop).child(shopId).child("product").on('child_added', snapshot => {
				var product = snapshot.val();
				if(product.quantity1 > 0 | product.quantity2 > 0)
				{
					this.products.push(product);
					if(this.products.length == 1)
					{
						this.selectedProduct = product;
						this.quantity = product.quantity1;
						this.quantityDisplay = this.quantity;
						
					}
				}
					
			});
			endDate = getCurrentDate();
			startDate = getBeforeDate(endDate, 30);

			firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startDate).endAt(endDate).once('value', snapshot => {       
                snapshot.forEach(function(childSnapshot) {
                	invoice = childSnapshot.val();

                	exist = 0;
                	for(i = 0; i < branches.length; i++)
                		if (branches[i].id == childSnapshot.child("branchId").val())
                		{
                			for(j = 1; j < invoice.product.length; j++)
                			{
                				if (branches[i].product[invoice.product[j].id] == null)
                					branches[i].product[invoice.product[j].id] = invoice.product[j].quantity1 + invoice.product[j].quantity2;
                				else
                					branches[i].product[invoice.product[j].id] += invoice.product[j].quantity1 + invoice.product[j].quantity2;
                			}
                			exist = 1;
                		}
                	if(exist == 0)
                	{
                		branch = {};
                		branch.id = invoice.branchId;
                		branch.name = invoice.branchName;
                		branch.product = [];
                		for(j = 1; j < invoice.product.length; j++)
                				branch.product[invoice.product[j].id] = invoice.product[j].quantity1 + invoice.product[j].quantity2;
                		
                		branches.push(branch);
                	}
                });
                this.loadDistribution();
                
            });
			
			
			this.loadDistributionHistory();
		},
		loadDistributionHistory: function(){
			var countDistribution = 1;
			table_distributionHistory.clear().draw();
			database.ref().child(Shop).child(shopId).child("distribution").limitToLast(100).on('child_added', snapshot => {
				var distribution = snapshot.val();
				list_distribution.push(distribution);

				table_distributionHistory.row.add([countDistribution ,distribution.branchName, distribution.productName, distribution.quantity, distribution.time, distribution.state, createInputElementTableDistributionHistory(countDistribution++)]).draw();
				
			});
		},
		loadDistribution: function (){
			saleQuantities = [];
			table_distribution.clear().draw();
			list_product = [];
			countProduct = 1;
			firebase.database().ref().child(Shop).child(shopId).child("branchStore").orderByChild("id").equalTo(this.selectedProduct.id)
				.once('value', snapshot => {
					snapshot.forEach(function(childSnapshot) {
				      	var product  = childSnapshot.val();
				      	keyBranchProducts.push(childSnapshot.key);
						list_product.push(product);
						saleQuantity = 0;

						for(i = 0; i < branches.length; i++)
							if(branches[i].id == product.branchId)
							{
								if(branches[i].product[product.id] != null)
									saleQuantity = branches[i].product[product.id];
							}
						saleQuantities.push(saleQuantity);
						table_distribution.row.add([countProduct,product.branchName, saleQuantity, product.quantity2, product.quantity1, createInputElementTableDistribution(countProduct, product.quantity2)]).draw();
				  		countProduct ++;
				  	});
				});
		},
		onProductChange : function (){
			if(this.selectedImportTime == this.importTimes[0])
				this.quantity = this.selectedProduct.quantity1;
			else
				this.quantity = this.selectedProduct.quantity2;
			this.quantityDisplay = this.quantity;
			this.loadDistribution();

		},
		saveDistributetionHistory : function(product, importTime) {
			var distributionHistory = {};
			distributionHistory.branchName = product.branchName;
			distributionHistory.branchId = product.branchId;
			distributionHistory.productId = product.id;
			distributionHistory.productName = product.name;
			distributionHistory.quantity = product.quantity1;
			distributionHistory.importTime = importTime;
			distributionHistory.state = "Shipping";
			distributionHistory.time = getCurrentDateAndTime();

			if(this.selectedImportTime == this.importTimes[0])
				distributionHistory.price = product.importPrice1;
			else
				distributionHistory.price = product.importPrice2;

			distributionHistory.id = database.ref().child(Shop).child(shopId).child("distribution").push().key;
			database.ref().child(Shop).child(shopId).child("distribution").child(distributionHistory.id).set(distributionHistory);
		},
		distribute: function (){
			for(i = 1; i< countProduct; i++)
				if (document.getElementById(""+i).value > 0)
				{	
					var j = i-1;
					list_product[j].quantity2 = list_product[j].quantity1;
					list_product[j].importPrice2 = list_product[j].importPrice1;
					list_product[j].quantity1 = parseInt(document.getElementById(""+i).value);

					if(this.selectedImportTime == this.importTimes[0])
					{
						list_product[j].importPrice1 = this.selectedProduct.importPrice1;
						this.saveDistributetionHistory(list_product[j], 0);
					}
					else
					{
						list_product[j].importPrice1 = this.selectedProduct.importPrice2;
						this.saveDistributetionHistory(list_product[j], 1);
					}
		
					//database.ref().child(Shop).child(shopId).child("branchStore").child(keyBranchProducts[j]).set(list_product[j]);

				}

			var sum = 0;
			for(i = 1; i < countProduct; i++ )
				sum = sum + parseInt(document.getElementById(""+i).value);
			this.quantity -= sum;

			if(this.selectedImportTime == this.importTimes[0])
				database.ref().child(Shop).child(shopId).child("product").child(this.selectedProduct.id).child("quantity1").set(this.quantity);
			else
				database.ref().child(Shop).child(shopId).child("product").child(this.selectedProduct.id).child("quantity2").set(this.quantity);

			this.loadData()
			showToastSuccess('Distribute successfull !!');
		},
		equalDistribution: function(){
			var aver = 0;
			for(i = 1; i < countProduct; i++ )
			{
				if(document.getElementById(""+i).disabled == false)
					aver++;
			}
			var remainder = this.quantity % aver;
			for(i = 1; i < countProduct; i++ )
			{
				if(document.getElementById(""+i).disabled == false)
				{
					document.getElementById(""+i).value = parseInt(this.quantity / aver) + remainder;
					remainder = 0;
				}
			}
			this.quantityDisplay = 0;
		},
		activeDistribution: function (){
			
			if(this.selectedDistributionType == this.distributions[0])
			{
				this.equalDistribution();
			}
			else
			{
				var sum = 0;
				for(i = 1; i < countProduct; i++)
					if(document.getElementById(""+i).disabled == false)
						sum += saleQuantities[i-1];

				if(sum==0)
					this.equalDistribution();
				else
				{
					var remainder = 0;
					for(i = 1; i < countProduct; i++)
						if(document.getElementById(""+i).disabled == false)
							remainder += parseInt(saleQuantities[i-1]/sum*this.quantity);

					remainder = this.quantity - remainder;
					
					for(i = 1; i < countProduct; i++)
					{
						if(document.getElementById(""+i).disabled == false)
						{	
							if(saleQuantities[i-1] > 0)
							{
								document.getElementById(""+i).value = parseInt(saleQuantities[i-1]/sum*this.quantity)+ remainder;
								remainder = 0;
							}
						}
					}
				}
				this.quantityDisplay = 0;

			}
		},
		onDistributionTypeChange: function(){
			this.quantityDisplay = this.quantity;
			this.loadDistribution();
		}
	},
	beforeMount(){
	    this.loadData()
	}
})

function updateQuatity(id)
{
	if (document.getElementById(id).value == "")
		document.getElementById(id).value = 0;
	var sum = 0;
	for(i = 1; i < countProduct; i++ )
	{
		sum = sum + parseInt(document.getElementById(""+i).value);
	}
	
	if (sum > app.quantity)
	{
		showToastWarning("The total your distribution quantity was over");
		document.getElementById(id).value = 0;
	}
	else
		app.quantityDisplay = app.quantity - sum;
}

function removeDistribution(id)
{
	id = parseInt(id.slice(2, id.length))-1;
	firebase.database().ref().child(Shop).child(shopId).child("product").orderByChild("id").equalTo(list_distribution[id].productId)
		.once('value', snapshot => {
			if(list_distribution[id].importTime == 0)
				database.ref().child(Shop).child(shopId).child("product").child(list_distribution[id].productId).child("quantity1")
					.set(snapshot.child(list_distribution[id].productId).child("quantity1").val() + list_distribution[id].quantity);
			else
				database.ref().child(Shop).child(shopId).child("product").child(list_distribution[id].productId).child("quantity2")
					.set(snapshot.child(list_distribution[id].productId).child("quantity2").val() + list_distribution[id].quantity);
		});
	
	//table_distributionHistory.row(id).remove().draw();
	//if (list_distribution[id-1].importTime == 0)
			//database.ref().child(Shop).child(shopId).child("product").child(this.selectedProduct.id).child("quantity1").set(this.quantity);
	database.ref().child(Shop).child(shopId).child("distribution").child(list_distribution[id].id).remove();
	
	window.location.reload(false);
	showToastSuccess('Remove successfull category !!');

}

function createInputElementTableDistribution(index, oldQuatity)
{
	if(oldQuatity == 0)
		return "<td><input type=\"number\"class=\"form-control\" id=\""+index+"\" onchange=\"updateQuatity(this.id)\" value=\"0\"></input></td>";
	else
		return "<td><input type=\"number\"class=\"form-control\" id=\""+index+"\" onchange=\"updateQuatity(this.id)\" value=\"0\" disabled=\"true\"></input></td>";
}

function createInputElementTableDistributionHistory(index)
{
	if(list_distribution[index-1].state == "Shipping")
		return "<td><button type=\"button\" class=\"btn btn-success\" id=\"bt"+index+"\" onclick=\"removeDistribution(this.id)\">Remove</button></td>";
	else
		return "<td><button type=\"button\" class=\"btn btn-success\" id=\"bt"+index+"\" onclick=\"removeDistribution(this.id)\" disabled=\"true\">Remove</button></td>";
}

/*$('#table_distribution tbody').on( 'click', 'tr', function (e) {
	index = table_distribution.row(this).data()[0]-1;
	console.log(table_distribution.row(this).data());
	//dialogEdit.loadData(list_employee[index]);

	//$('#dialog').modal('show');
		
	//$('#wrapper').append('<div id="over"></div>');
    //$('#over').fadeIn(300);

	//dialog.dialog("open");

});*/
