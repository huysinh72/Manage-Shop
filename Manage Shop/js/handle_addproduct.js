var shopId = getCookie("shopId");
if(shopId == null)
	window.location.href='login.html?preUrl='+window.location.href;
var Shop = "Shop";
var database = firebase.database();
var storage = firebase.storage(); 

var productNumber = -1;

var app = new Vue({
	el: '#app',
	data: {
		selectedCategory: {},
	    categories: [],
	    image: null,
	    salePrice: '',
	    salePriceFormat: '',
	    Product: {
	    	id: '',
	    	name: '',
			barcode: '',
			categoryName: '',
			categoryId : '',
			salePrice: '',
			importPrice1: 0,
			importPrice2: 0,
			productDescription: '',
			quantity1: 0,
			quantity2: 0,
			discount: 0,
			startDate: '',
			endDate: '',
			image: '',
	    	state: 'Active'
	    }
	},
	watch: {
	    salePrice: function() {
	      	this.salePriceFormat = accounting.formatNumber(this.salePrice, 2);
	    }
	},
	methods: {
		onBarcodeChange: function(){
			//alert("ádfsdaf");
			JsBarcode("#barcode" , this.Product.barcode);
			//JsBarcode("#barcode", "1234567890128", {format: "ean13"});
			productNumber = -1;
			
		},
		createBarcode :function()
		{
			database.ref().child(Shop).child(shopId).child("productNumber")
			.once('value', snapshot => {
				productNumber = snapshot.val();
				var barcode = getNumberBarcode(snapshot.val()+1);
				JsBarcode("#barcode" , barcode);
				this.Product.barcode = barcode;
			});
		},

		loadCategory :function (){
			firebase.database().ref().child(Shop).child(shopId).child("category").on('child_added', snapshot => {
				var category  = snapshot.val();
				this.categories.push(category);
				if(this.categories.length == 1)
				{
					this.selectedCategory = category;
				}
			});
		},
		onFileChange : function (){
			var input = document.getElementById("product_file");
		   	if (input.files && input.files[0]) {
		        var reader = new FileReader();

		        reader.onload = function (e) {
		            $('#product_image').attr('src', e.target.result);
		        }

		        reader.readAsDataURL(input.files[0]);
		    }

		   	this.image = input.files[0];
		},

		addProduct: function (){
			this.Product.categoryId = this.selectedCategory.id;
			this.Product.categoryName = this.selectedCategory.name;
			this.Product.salePrice = parseFloat(this.salePrice);
	
			if(this.image != null)
			{
				this.Product.image = this.image.name;

		   		var uploadTask = storage.ref().child('images/'+ shopId+'/Product/'+ this.image.name).put(this.image);

		   		uploadTask.on('state_changed', function(snapshot){
					// Observe state change events such as progress, pause, and resume
					// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
					}, function(error) {
					 // Handle unsuccessful uploads
					}, function() {
					// Handle successful uploads on complete
					// For instance, get the download URL: https://firebasestorage.googleapis.com/...
					var downloadURL = uploadTask.snapshot.downloadURL;
				});
		   	}

			this.Product.id = database.ref().child(Shop).child(shopId).child("product").push().key;
			database.ref().child(Shop).child(shopId).child("product").child(this.Product.id).set(this.Product);

			if(productNumber != -1)
				database.ref().child(Shop).child(shopId).child("productNumber").set(productNumber+1);

			var branchProduct = {
		    	id: this.Product.id,
		    	name: this.Product.name,
				barcode: this.Product.barcode,
				categoryName: this.Product.categoryName,
				categoryId : this.Product.categoryId,
				salePrice: this.Product.salePrice,
				saleQuantity: 0,
				importPrice1: 0,
				importPrice2: 0,
				productDescription: this.Product.productDescription,
				quantity1: 0,
				quantity2: 0,
				discount: 0,
				startDate: '',
				endDate: '',
				image: this.Product.image,
		    	state: 'Active'
		    }

			database.ref().child(Shop).child(shopId).child("branch").once('value', snapshot => {
				snapshot.forEach(function(childSnapshot) {
					var branch  = childSnapshot.val();
					branchProduct.branchId = branch.id;
					branchProduct.branchName = branch.name;
					branchProduct.key = database.ref().child(Shop).child(shopId).child("branchStore").push().key;
					database.ref().child(Shop).child(shopId).child("branchStore").child(branchProduct.key).set(branchProduct);
				});
	
			});
			
			showToastSuccess('Add successfull product !!');

			$('#product_image').attr('src', '../image/noimageavailable.png');
			$('#barcode').attr('src', '../image/barcode.png');
			document.getElementById("product_file").value = '';
			//window.location.reload(true); 
			this.Product.name = '';
			this.Product.barcode = '';
			this.salePrice = '';
			this.salePriceFormat = '';
			this.Product.productDescription = '';
			this.image = null;
		}

	},
	beforeMount(){
	    this.loadCategory()
	}
})


var table_ProductFile = $('#table_ProductFile').DataTable();
var dataProductFile = [];

function showDialog()
{
	$('#dialog').modal('show');
}

function onFileChange(event)
{	
	dataProductFile = [];
	var countData = 1;
	table_ProductFile.clear().draw();
	
    alasql('SELECT * FROM FILE(?,{headers:true})',[event],function(data){
    	dataProductFile = data;
       	for(i = 0; i < data.length; i++){
        	table_ProductFile.row.add([countData++, data[i].Barcode, data[i].ProductName, accounting.formatNumber(data[i].SalePrice), data[i].Description]).draw();
    	}
    }); 
    $('#dialogProductTable').modal('show');	 
}


function getSampleFile()
{
	var samples = [];
	var i = 1;
	
	var sample = {};
	sample.Barcode = '123';
	sample.ProductName = 'Sample';
	sample.SalePrice = 0;
	sample.Description = 'nothing';

	samples.push(sample);
	alasql('SELECT * INTO XLSX("Product sample.xlsx",{headers:true}) FROM ?',[samples]);
}


function addProductFile()
{
	for(i = 0; i < dataProductFile.length; i++)
	{

	}
}
