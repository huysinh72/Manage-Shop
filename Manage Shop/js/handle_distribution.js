var shopId = getCookie("shopId");
var Shop = "Shop";
var database = firebase.database(); 


var table_distribution = $('#table_distribution').DataTable();
var table_distributionHistory = $('#table_distributionHistory').DataTable();

var list_product = [];
var list_distribution = [];
var keyBranchProducts = [];
var countProduct = 1;
var countDistribution = 1;


var app = new Vue({
	el: '#app',
	data: {
		selectedProduct: {},
	    products: [],
	    importTimes : ['Recent import time', 'Old import time'],
	   	selectedImportTime: '',
	   	quantity: 0
	},
	methods: {
		loadData :function (){
			this.selectedImportTime = this.importTimes[0];
			database.ref().child(Shop).child(shopId).child("product").on('child_added', snapshot => {
				var product = snapshot.val();
				if(product.quantity1 > 0 | product.quantity2 > 0)
				{
					this.products.push(product);
					if(this.products.length == 1)
					{
						this.selectedProduct = product;
						this.quantity = product.quantity1;
						this.loadDistribution();

					}
				}
					
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
			table_distribution.clear().draw();
			list_product = [];
			countProduct = 1;
			firebase.database().ref().child(Shop).child(shopId).child("branchStore").orderByChild("id").equalTo(this.selectedProduct.id)
				.once('value', snapshot => {
					snapshot.forEach(function(childSnapshot) {
				      	var product  = childSnapshot.val();
				      	keyBranchProducts.push(childSnapshot.key);
						list_product.push(product);
						table_distribution.row.add([countProduct,product.branchName, product.saleQuantity, product.quantity2, product.quantity1, createInputElementTableDistribution(countProduct, product.quantity2)]).draw();
				  		countProduct ++;
				  	});
				});
		},
		onProductChange : function (){
			if(this.selectedImportTime == this.importTimes[0])
				this.quantity = this.selectedProduct.quantity1;
			else
				this.quantity = this.selectedProduct.quantity2;

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
			distributionHistory.time = getCurrentDate();
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

			this.loadDistribution();
			alert("Distribute successfull");
		},
		autoDistribution: function (){
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

		}
	},
	beforeMount(){
	    this.loadData()
	}
})

function updateQuatity(id)
{
	if (document.getElementById(value).value == "")
		document.getElementById(value).value = 0;;
	var sum = 0;
	for(i = 1; i < countProduct; i++ )
	{
		sum = sum + parseInt(document.getElementById(""+i).value);
	}
	
	if (sum > app.quantity)
	{
		alert("The total your distribution quantity was over");
		document.getElementById(id).value = 0;
	}
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
	alert("Remove successfull");

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
