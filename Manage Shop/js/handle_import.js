
var shopId = getCookie("shopId");
if(shopId == null)
	window.location.href='login.html?preUrl='+window.location.href;

var Shop = "Shop";
var database = firebase.database();

var list_importBill = [];
$('#table_importBill').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [2,3] },

    ]
});

$('#table_importFile').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [3,4] },

    ]
});

var table_importBill = $('#table_importBill').DataTable();
var table_importFile = $('#table_importFile').DataTable();

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
		pushData: function (importBill, product){

				importBill.id = database.ref().child(Shop).child(shopId).child("importBill").push().key;
	
				database.ref().child(Shop).child(shopId).child("importBill").child(importBill.id).set(importBill);

				database.ref().child(Shop).child(shopId).child("product").child(importBill.productId).child("quantity2").set(product.quantity1);

				database.ref().child(Shop).child(shopId).child("product").child(importBill.productId).child("quantity1").set(importBill.quantity);

				database.ref().child(Shop).child(shopId).child("product").child(importBill.productId).child("importPrice2").set(product.importPrice1);

				database.ref().child(Shop).child(shopId).child("product").child(importBill.productId).child("importPrice1").set(importBill.price);

				for(j = 0; j < app.products.length; j++)
       			{
       				if(this.products[j].barcode == product.barcode )
       				{
       					this.products[j].quantity2 = product.quantity1;
       					this.products[j].quantity1 = importBill.quantity;
       					this.products[j].importPrice2 = product.importPrice1;
       					this.products[j].importPrice1 = importBill.price;
       					break;
       				}
 
       			}
		},
		importProduct: function (){
	
			if(this.selectedProduct.quantity2 > 0)
			{
				showToastWarning("This product is still in stock. Please check and distribute it to branches");
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

				this.pushData(this.ImportBill, this.selectedProduct);
				showToastSuccess('Import successfull product !!!');
			}
		}
	},
	beforeMount(){
	    this.loadData()
	}
})

var warning = new Vue({
	el: '#warning',
	data:{
		warning :''	
	},
})


var dataImportFile = [];
function importFile()
{
	if (warning.warning != '')
	{
		showToastWarning("You can not import this file. Let check warning again !!!");
	}
	else
	{
		var importBill= {
	    	id: '',
	    	productName: '',
	    	productId: '',
	    	providerName: '',
	    	providerId: '',
	    	time: '',
	    	price: '',
	    	quantity: ''
	    }
	    for(i = 0; i < dataImportFile.length; i++)
	    	if (dataImportFile[i].Quantity > 0)
		    {
			    importBill.productId = dataImportFile[i].id;
			    importBill.productName = dataImportFile[i].Name;
			    importBill.providerName = dataImportFile[i].Provider;
			    importBill.price = dataImportFile[i].ImportPrice;
			    importBill.quantity = dataImportFile[i].Quantity;
			    importBill.time = getCurrentDate();

			    app.pushData(importBill, app.products[dataImportFile[i].index]);
			}

		showToastSuccess('Import successfull file !!');
		$('#dialog').modal('hide');
	}
	

}

function onFileChange(event)
{	
	dataImportFile = [];
	var countData = 1;
	table_importFile.clear().draw();
	warning.warning = '';
    alasql('SELECT * FROM FILE(?,{headers:true})',[event],function(data){
    	dataImportFile = data;

       	for(i = 0; i < data.length; i++)
       		if(data[i].Quantity > 0)
       		{	
       			for(j = 0; j < app.products.length; j++)
       			{
       				if(app.products[j].barcode == data[i].Barcode )
       				{
       					dataImportFile[i].id = app.products[j].id;
       					dataImportFile[i].index = j; 
       					if (app.products[j].quantity2 > 0)
       						warning.warning = data[i].Name + " - " + warning.warning;
       				}
 
       			}
       			if(data[i].Provider == null)
       				data[i].Provider = '';

        		table_importFile.row.add([countData++, data[i].Name,data[i].Barcode, data[i].Quantity, accounting.formatNumber(data[i].ImportPrice), data[i].Provider]).draw();
    		}
    	if(warning.warning != '')
    		warning.warning += "is still in stock";
    	dataImportFile = data;
        $('#dialog').modal('show');
        document.getElementById("importFile").value = '';
    });  
}

function getImportSampleFile()
{

	var samples = [];
	for(i = 0; i < app.products.length; i ++)
	{
		var sample = {};
		sample.Name = app.products[i].name;
		sample.Barcode = app.products[i].barcode;
		sample.Quantity = 0;
		sample.ImportPrice = 0;
		samples.push(sample);
	}
	//var aa = [ { name:'Sinh', id: 1 }, { name: 'B', id: 2 }, { name: 'C', id: 3 } ];
	alasql('SELECT * INTO XLSX("Import sample.xlsx",{headers:true}) FROM ?',[samples]);
}



