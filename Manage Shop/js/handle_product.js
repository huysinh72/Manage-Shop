var shopId = getCookie("shopId");
var Shop = "Shop";
var database = firebase.database(); 
var storage = firebase.storage();

var list_product = [];

var table_product = $('#table_product').DataTable();


var dialogEdit = new Vue({
	el: '#dialog',
	data: {
		disabled: 0,
		selectedCategory: {},
	    categories: [],
	    image: null,
	    salePrice: '',
	    salePriceFormat: '',
	    discount: '',
	    discountFormat: '',
	    currentImportPrice: '',
	    currentImportPriceFormat: '',
	    oldImportPrice: '',
	    oldImportPriceFormat: '',
	    Product: {}
	},
	watch: {
	    salePrice: function() {
	      	this.salePriceFormat = accounting.formatNumber(this.salePrice, 2);
	    },

	    discount: function() {
	      	this.discountFormat = accounting.formatNumber(this.discount, 2);
	    }
	},
	methods: {
		loadData :function (product){
			this.Product = product;
			this.salePrice = product.salePrice;
			this.salePriceFormat = accounting.formatNumber(product.salePrice);
			this.discount = product.discount;
			this.discountFormat = accounting.formatNumber(product.discount);
			this.currentImportPrice = product.importPrice1;
			this.currentImportPriceFormat = accounting.formatNumber(product.importPrice1, 2);
			this.oldImportPrice = product.importPrice2;
			this.oldImportPriceFormat = accounting.formatNumber(product.importPrice2, 2);

			document.getElementById("datepickerStart").value = this.formatDateMMDDYY(product.startDay);
			document.getElementById("datepickerEnd").value = this.formatDateMMDDYY(product.endDay);

			firebase.database().ref().child(Shop).child(shopId).child("category").on('child_added', snapshot => {
				var category  = snapshot.val();
				this.categories.push(category);
				if(category.id == product.categoryId)
					this.selectedCategory = category;

			});

			storage.ref().child('images/'+ shopId+'/Product/'+ this.Product.image).getDownloadURL().then(function(url) {
				var xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';
				xhr.onload = function(event) {
				   	var blob = xhr.response;
				};
				xhr.open('GET', url);
				xhr.send();

				// Or inserted into an <img> element:
				var img = document.getElementById('product_image_edit');
				img.src = url;
			}).catch(function(error) {
				  // Handle any errors
			});


		},
		onFileChange : function (){
			var input = document.getElementById("product_file_edit");
		   	if (input.files && input.files[0]) {
		        var reader = new FileReader();

		        reader.onload = function (e) {
		            $('#product_image_edit').attr('src', e.target.result);
		        }

		        reader.readAsDataURL(input.files[0]);
		    }

		   	this.image = input.files[0];
		},
		closeDialog : function (){
			$('#dialog').modal('hide');
		},
		formatDateYYMMDD : function (date)
		{
			return date.slice(6, 10) + '/' + date.slice(0, 2) + '/' + date.slice(3, 5);
		},
		formatDateMMDDYY : function (date)
		{
			return date.slice(5, 7) + '/' + date.slice(8, 10) + '/' + date.slice(0, 4);
		},
		saveChange : function (){
			this.Product.startDay = this.formatDateYYMMDD(document.getElementById("datepickerStart").value);
			this.Product.endDay = this.formatDateYYMMDD(document.getElementById("datepickerEnd").value);  

			this.Product.salePrice = parseFloat(this.salePrice);
			this.Product.discount = parseFloat(this.discount);
			if(document.getElementById("product_file_edit").value != "")
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

			database.ref().child(Shop).child(shopId).child("product").child(this.Product.id).set(this.Product);

			if(this.disabled == 0)
			{
				var branchProduct = this.Product;
				database.ref().child(Shop).child(shopId).child("branchStore").orderByChild("id").equalTo(this.Product.id)
				.once('value', snapshot => {

					snapshot.forEach(function(childSnapshot) {
						var ss = childSnapshot.val();
						branchProduct.branchId = ss.branchId;
						branchProduct.branchName = ss.branchName;
						database.ref().child(Shop).child(shopId).child("branchStore").child(childSnapshot.key).set(branchProduct);
					});	
				});
			}

			alert("Save successfull");

			list_product[index] = this.Product;
			table_product.clear().draw();
			var count = 1;
			for(var i in list_product)
			{	
				var product = list_product[i];
				table_product.row.add([count++, product.name, product.barcode, accounting.formatNumber(product.salePrice), accounting.formatNumber(product.discount), product.endDay,
						product.quantity1, product.importPrice1, product.categoryName]).draw();
			}
			this.closeDialog();
		},
		remove : function ()
		{

			database.ref().child(Shop).child(shopId).child("product").child(this.Product.id).remove();

			database.ref().child(Shop).child(shopId).child("branchStore").orderByChild("id").equalTo(this.Product.id)
			.once('value', snapshot => {
				snapshot.forEach(function(childSnapshot) {
					var ss = childSnapshot.val();
					database.ref().child(Shop).child(shopId).child("branchStore").child(childSnapshot.key).remove();
				});	
			});

			list_product.splice(index, 1);
			table_product.clear().draw();
			count = 1;
			for(var i in list_product)
			{	
				var product = list_product[i];
				table_product.row.add([count++, product.name, product.barcode, accounting.formatNumber(product.salePrice), accounting.formatNumber(product.discount), product.endDay,
						product.quantity1, product.importPrice1, product.categoryName]).draw();
			}

			alert("Remove successfull");
			this.closeDialog();
		}

	}
})

var app = new Vue({
	el: '#app',
	data: {
		selectedBranch: {},
	    branches: []
	},
	methods: {
		loadBranches :function (){
			var branch = {id: '0', name:'Store'};
			this.branches.push(branch);
			this.selectedBranch = branch;

			database.ref().child(Shop).child(shopId).child("branch").on('child_added', snapshot => {
				var branch  = snapshot.val();
				this.branches.push(branch);
			});
			this.loadProductList();
		},
		loadProductList: function(){
			
			table_product.clear().draw();
			list_product = [];
			var count = 1;

			if(this.selectedBranch.id == 0)
			{	
				dialogEdit.disabled = 0;
				firebase.database().ref().child(Shop).child(shopId).child("product").once('value', snapshot => {
					snapshot.forEach(function(childSnapshot) {
				      	var product  = childSnapshot.val();
						list_product.push(product);
						table_product.row.add([count++, product.name, product.barcode,  accounting.formatNumber(product.salePrice), accounting.formatNumber(product.discount), product.endDay,
							product.quantity1 + product.quantity2, accounting.formatNumber(product.importPrice1), product.categoryName]).draw();
				  	});
					/**/
				});
			}
			else
			{
				dialogEdit.disabled = 1;
				firebase.database().ref().child(Shop).child(shopId).child("branchStore").orderByChild("branchId").equalTo(this.selectedBranch.id)
				.once('value', snapshot => {
					snapshot.forEach(function(childSnapshot) {
				      	var product  = childSnapshot.val();
						list_product.push(product);
						table_product.row.add([count++, product.name, product.barcode,  accounting.formatNumber(product.salePrice), accounting.formatNumber(product.discount), product.endDay,
							product.quantity1+product.quantity2, accounting.formatNumber(product.importPrice1), product.categoryName]).draw();
				  	});
				});
			}
		}
	},
	beforeMount(){
	    this.loadBranches()
	}
})


 $( "#datepickerStart" ).datepicker();
 $( "#datepickerEnd" ).datepicker();

var index = 0;
$('#table_product tbody').on( 'click', 'tr', function (e) {
	index = table_product.row(this).data()[0]-1;
	
	dialogEdit.loadData(list_product[index]);
	$('#dialog').modal('show');
		
	//$('#wrapper').append('<div id="over"></div>');
    //$('#over').fadeIn(300);

	//dialog.dialog("open");

});
 


