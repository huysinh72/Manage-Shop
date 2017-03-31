
var shopId = getCookie("shopId");
var Shop = "Shop";
var database = firebase.database();


var list_importBill = [];
var table_importBill = $('#table_importBill').DataTable();
var count = 1;

firebase.database().ref().child(Shop).child(shopId).child("importBill").limitToLast(100).on('child_added', snapshot => {
	var importBill  = snapshot.val();
  	list_importBill.push(importBill);
	table_importBill.row.add([count++, importBill.productName, importBill.quantity, accounting.formatNumber(importBill.price), importBill.time, importBill.providerName]).draw();
  // ...
});

var app = new Vue({
	el: '#app',
	data: {
		selectedProduct: {},
	    products: [],
	   	providers: [],
	    selectedProvider: {},
	    price: '',
	    priceFormat: '',
	    ImportBill: {
	    	id: '',
	    	productName: '',
	    	productId: '',
	    	providerName: '',
	    	providerId: '',
	    	time: '',
	    	price: '',
	    	quantity: ''
	    }
	},
	watch: {
	    price: function() {
	      	this.priceFormat = accounting.formatNumber(this.price, 2);
	    }
	},
	methods: {
		loadData :function (){
			database.ref().child(Shop).child(shopId).child("product").on('child_added', snapshot => {
				var product = snapshot.val();
				this.products.push(product);
				if(this.products.length == 1)
				{
					this.selectedProduct = product;
				}
					
			});

			database.ref().child(Shop).child(shopId).child("provider").on('child_added', snapshot => {
				var provider = snapshot.val();
				this.providers.push(provider);
				if(this.providers.length == 1)
				{
					this.selectedProvider = provider;
				}
					
			});
		},
		importProduct: function (){
			if(this.selectedProduct.quantity2 > 0)
			{
				alert("Store was full \n You distribute down the branches, please");
			}
			else
			{
				this.ImportBill.time = getCurrentDate();
				this.ImportBill.productId = this.selectedProduct.id;
				this.ImportBill.productName = this.selectedProduct.name;
				this.ImportBill.providerId = this.selectedProvider.id;
				this.ImportBill.providerName = this.selectedProvider.name;
				this.ImportBill.price = parseFloat(this.price);
				this.ImportBill.quantity = parseInt(this.ImportBill.quantity);

				this.ImportBill.id = database.ref().child(Shop).child(shopId).child("importBill").push().key;
				database.ref().child(Shop).child(shopId).child("importBill").child(this.ImportBill.id).set(this.ImportBill);

				database.ref().child(Shop).child(shopId).child("product").child(this.ImportBill.productId).child("quantity2").set(this.selectedProduct.quantity1);

				database.ref().child(Shop).child(shopId).child("product").child(this.ImportBill.productId).child("quantity1").set(this.ImportBill.quantity);

				database.ref().child(Shop).child(shopId).child("product").child(this.ImportBill.productId).child("importPrice2").set(this.selectedProduct.importPrice1);

				database.ref().child(Shop).child(shopId).child("product").child(this.ImportBill.productId).child("importPrice1").set(this.ImportBill.price);

				alert("Import successfull");
			}
		}
	},
	beforeMount(){
	    this.loadData()
	}
})





/*

var select_product = document.getElementById("select_product");
var list_product = [];
firebase.database().ref().child(Shop).child(shopId).child("product").on('child_added', snapshot => {
    var product  = snapshot.val();
 	list_product.push(product);
    select_product.appendChild(new Option(product.name, list_product.length-1));
});

var select_provider = document.getElementById("select_provider");

firebase.database().ref().child(Shop).child(shopId).child("provider").on('child_added', snapshot => {
    var provider  = snapshot.val();
    select_provider.appendChild(new Option(provider.name, provider.id));
});

firebase.database().ref().child(Shop).child(shopId).child("importBill").on('child_added', snapshot => {
	var importBill  = snapshot.val();
  	row = "<tr><td>" + importBill.productName + "</td><td>" + importBill.quantity + "</td><td>" + importBill.price + "</td><td>" + importBill.time + "</td>" + "<td><button type=\"button\" class=\"btn btn-sm btn-success\">Edit</button></td>"+"</tr>"; 
  	$( row ).appendTo( "#list_importBill tbody");
  // ...
});


function getCurrentDate()
{
	var dateObj = new Date();
	var month = dateObj.getUTCMonth() + 1; //months from 1-12
	var day = dateObj.getUTCDate();
	var year = dateObj.getUTCFullYear();
	if(month < 10)
		month = "0" + month;
	if(day < 10)
		day = "0" + day;

	newdate = year + "/" + month + "/" + day;
	return newdate;
};

function importClick()
{
	var product_index = document.getElementById("select_product").value;
	var importBill = {
		id : "",
		productId : list_product[product_index].id,
		productName : document.getElementById("select_product").options[document.getElementById("select_product").selectedIndex].text,
		price : parseFloat(document.getElementById("input_price").value),
		quantity : parseInt(document.getElementById("input_quantity").value),
		time : getCurrentDate(),
		providerId : document.getElementById("select_provider").value,
		providerName : document.getElementById("select_provider").options[document.getElementById("select_provider").selectedIndex].text
	}

	if(importBill.price == "" | importBill.quantity == "" | importBill.productId == "" )
		alert("Miss information");
	else {
		var key = database.ref().child(Shop).child(shopId).child("importBill").push().key;
		importBill.id = key;
		database.ref().child(Shop).child(shopId).child("importBill").child(key).set(importBill);

		database.ref().child(Shop).child(shopId).child("product").child(importBill.productId).child("quantity2").set(list_product[product_index].quantity1);

		database.ref().child(Shop).child(shopId).child("product").child(importBill.productId).child("quantity1").set(importBill.quantity);

		database.ref().child(Shop).child(shopId).child("product").child(importBill.productId).child("importPrice2").set(list_product[product_index].importPrice1);

		database.ref().child(Shop).child(shopId).child("product").child(importBill.productId).child("importPrice1").set(importBill.price);

		list_product[product_index].quantity1 = importBill.quantity;
		list_product[product_index].importPrice1 = impportBill.price;

		//database.ref().child(Shop).child(keyStore).child("product").child(importBill.productId).child("sellPrice").set(importBill.price*(1 + list_product[product_index].interestRate));


		alert("Add successfull");
	}
};*/

