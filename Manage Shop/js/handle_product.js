var shopId = getCookie("shopId");
if(shopId == null)
	window.location.href='login.html?preUrl='+window.location.href;
document.getElementById("user").innerHTML = "<i class=\"fa fa-user\"></i> "+ getCookie("username") +"<b class=\"caret\"></b>";

var Shop = "Shop";
var database = firebase.database(); 
var storage = firebase.storage();

var list_product = [];


$('#table_product').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [3,8] },
      { className: "text-center", "targets": [4,7]}

    ]
});

var table_product = $('#table_product').DataTable();
var index = 0;

var dialogEdit = new Vue({
	el: '#dialog',
	data: {
		disabled: 0,
		selectedCategory: {},
	    categories: [],
	    image: null,
	    salePrice: '',
	    salePriceFormat: '',
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
	    currentImportPrice: function() {
	      	this.currentImportPriceFormat = accounting.formatNumber(this.currentImportPrice, 2);
	    },
	    oldImportPrice: function() {
	      	this.oldImportPriceFormat = accounting.formatNumber(this.oldImportPrice, 2);
	    }
	},
	methods: {
		setProductInfo : function(){
			this.Product.startDate = formatDateMMDDYYtoYYMMDD(document.getElementById("datepickerStart").value);
			this.Product.endDate = formatDateMMDDYYtoYYMMDD(document.getElementById("datepickerEnd").value);  

			this.Product.salePrice = parseFloat(this.salePrice);
			this.Product.importPrice1 = parseInt(this.currentImportPrice);
			this.Product.importPrice2 = parseInt(this.oldImportPrice);
			this.Product.quantity1 = parseInt(this.Product.quantity1);
			this.Product.quantity2 = parseInt(this.Product.quantity2);
			this.Product.discount = parseInt(this.Product.discount);

		},

		loadData :function (product){
			JsBarcode('#barcode' , product.barcode);
			this.Product = product;
			this.Product.discount = parseInt(product.discount);
			this.salePrice = product.salePrice;
			this.salePriceFormat = accounting.formatNumber(product.salePrice);
			this.currentImportPrice = product.importPrice1;
			this.currentImportPriceFormat = accounting.formatNumber(product.importPrice1, 2);
			this.oldImportPrice = product.importPrice2;
			this.oldImportPriceFormat = accounting.formatNumber(product.importPrice2, 2);

			document.getElementById("datepickerStart").value = formatDateYYMMDDtoMMDDYY(product.startDate);
			document.getElementById("datepickerEnd").value = formatDateYYMMDDtoMMDDYY(product.endDate);

			firebase.database().ref().child(Shop).child(shopId).child("category").on('child_added', snapshot => {
				var category  = snapshot.val();
				this.categories.push(category);
				if(category.id == product.categoryId)
					this.selectedCategory = category;

			});

			$('#product_image_edit').attr('src', '../image/noimageavailable.png');

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
		saveChange : function (){

			this.setProductInfo();

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

			if(this.disabled == 0)
			{
				
				database.ref().child(Shop).child(shopId).child("product").child(this.Product.id).set(this.Product);

				var branchProduct = {
			    	id: this.Product.id,
			    	name: this.Product.name,
					barcode: this.Product.barcode,
					categoryName: this.Product.categoryName,
					categoryId : this.Product.categoryId,
					salePrice: this.Product.salePrice,
					productDescription: this.Product.productDescription,
					discount: this.Product.discount,
					startDate: this.Product.startDate,
					endDate: this.Product.endDate,
					image: this.Product.image,
			    	state: 'Active'
			    }

			    

				database.ref().child(Shop).child(shopId).child("branchStore").orderByChild("id").equalTo(this.Product.id)
				.once('value', snapshot => {

					snapshot.forEach(function(childSnapshot) {
						var ss = childSnapshot.val();
						branchProduct.saleQuantity = ss.saleQuantity;
						branchProduct.branchId = ss.branchId;
						branchProduct.branchName = ss.branchName;
						branchProduct.quantity1 = ss.quantity1;
						branchProduct.quantity2 = ss.quantity2;
						branchProduct.importPrice1 = ss.importPrice1;
						branchProduct.importPrice2 = ss.importPrice2;
						database.ref().child(Shop).child(shopId).child("branchStore").child(childSnapshot.key).set(branchProduct);
					});	
				});
			}
			else
			{
				var branchProduct = this.Product;
				branchProduct.saleQuantity = list_product[index].saleQuantity;
				database.ref().child(Shop).child(shopId).child("branchStore").child(list_product[index].key).set(branchProduct);
			}

			showToastSuccess('Save successfull !!!');

			list_product[index] = this.Product;
			table_product.clear().draw();
			var count = 1;

			for(var i in list_product)
			{	
				var product = list_product[i];
				branchName = "Store";
				if(app.selectedBranch.id !=1)
					branchName = product.branchName;
				table_product.row.add([count++, addHyperlink(product.name), product.barcode,  accounting.formatNumber(product.salePrice), product.discount,product.startDate,product.endDate,
						product.quantity1 + product.quantity2, accounting.formatNumber(product.importPrice1), product.categoryName, branchName]).draw();
			}
			this.closeDialog();
		},
		showConfirmDialog: function(){
			$('#confirmDialog').modal('show');
		},
		remove : function ()
		{
			/*database.ref().child(Shop).child(shopId).child("product").child(this.Product.id).remove();

			database.ref().child(Shop).child(shopId).child("branchStore").orderByChild("id").equalTo(this.Product.id)
			.once('value', snapshot => {
				snapshot.forEach(function(childSnapshot) {
					var ss = childSnapshot.val();
					database.ref().child(Shop).child(shopId).child("branchStore").child(childSnapshot.key).remove();
				});	
			});

			list_product.splice(index, 1);
			table_product.clear().draw();
			var count = 1;
			for(var i in list_product)
			{	
				var product = list_product[i];
				table_product.row.add([count++, product.name, product.barcode,  accounting.formatNumber(product.salePrice), product.discount,product.startDate,product.endDate,
						product.quantity1 + product.quantity2, accounting.formatNumber(product.importPrice1), product.categoryName, branchName]).draw();
			}*/

			showToastSuccess('Remove successfull !!!');
			$('#confirmDialog').modal('hide');
			this.closeDialog();
		},
		printBarcode: function (){

			var img = document.getElementById("barcode");
			var canvas = document.createElement("canvas");

		    canvas.width = img.width;
		    canvas.height = img.height;
		    var ctx = canvas.getContext("2d");

		    ctx.drawImage(img, 0, 0);

		    var dataURL = canvas.toDataURL("image/jpeg");
			var doc = new jsPDF();
			doc.setFontSize(10);

			x = 8;
			y = 8;
			w = 38;
			h = 21;
			mx = 3;
			for(i = 0; i < 13; i++)
			{
				x = 8;
				for(j = 0; j < 5; j++)
				{
					//doc.text(x + w*j + mx, y + h*i, "" + this.Product.name);
					doc.addImage(dataURL, 'PNG', x + w*j, y + h*i, 37, 15);
					doc.text(x + w*j + mx, y + h*i+17, "$" + accounting.formatNumber(this.Product.salePrice));
					x++;
					
				}
				y++;
			}
			
			doc.output("dataurlnewwindow");
		}

	}
})

var confirmDialog = new Vue({
	el: '#confirmDialog',
	methods: {
		remove: function(){
			dialogEdit.remove();
		}
	}
})

var count;

var app = new Vue({
	el: '#app',
	data: {
		selectedBranch: {},
	    branches: []
	},
	methods: {
		loadBranches :function (){
			var branch = {id: '0', name:'All'};
			this.branches.push(branch);
			this.selectedBranch = branch;

			var branch = {id: '1', name:'Store'};
			this.branches.push(branch);

			database.ref().child(Shop).child(shopId).child("branch").on('child_added', snapshot => {
				var branch  = snapshot.val();
				this.branches.push(branch);
			});
			this.loadProductList();
		},

		loadProductStore: function(all){
			firebase.database().ref().child(Shop).child(shopId).child("product").once('value', snapshot => {
				snapshot.forEach(function(childSnapshot) {
			      	var product  = childSnapshot.val();
					list_product.push(product);
					table_product.row.add([count++, addHyperlink(product.name, all), product.barcode,  accounting.formatNumber(product.salePrice), product.discount +'%', product.startDate,product.endDate,
						product.quantity1 + product.quantity2, accounting.formatNumber(product.importPrice1), product.categoryName, "Store"]).draw();
			  	});
				
			});
		},
		loadProductAllBranch: function(all){
			firebase.database().ref().child(Shop).child(shopId).child("branchStore").orderByChild("branchName").once('value', snapshot => {
				snapshot.forEach(function(childSnapshot) {
			      	var product  = childSnapshot.val();
			      	product.key = childSnapshot.key;
					list_product.push(product);
					table_product.row.add([count++, addHyperlink(product.name, all), product.barcode,  accounting.formatNumber(product.salePrice), product.discount+'%', product.startDate,product.endDate,
						product.quantity1+product.quantity2, accounting.formatNumber(product.importPrice1), product.categoryName, product.branchName]).draw();
			  	});
			});
		},

		loadProductBranch: function(all){
			firebase.database().ref().child(Shop).child(shopId).child("branchStore").orderByChild("branchId").equalTo(this.selectedBranch.id)
			.once('value', snapshot => {
				snapshot.forEach(function(childSnapshot) {
			      	var product  = childSnapshot.val();
			      	product.key = childSnapshot.key;
					list_product.push(product);
					table_product.row.add([count++, addHyperlink(product.name, all), product.barcode,  accounting.formatNumber(product.salePrice), product.discount+'%', product.startDate,product.endDate,
						product.quantity1+product.quantity2, accounting.formatNumber(product.importPrice1), product.categoryName, product.branchName]).draw();
			  	});
			});
		},


		loadProductList: function(){
			
			table_product.clear().draw();
			list_product = [];
			count = 1;
			if(this.selectedBranch.id == 0)
			{
				this.loadProductStore(0);
				this.loadProductAllBranch(0);
			}
			else
			if(this.selectedBranch.id == 1)
			{
				dialogEdit.disabled = 0;
				this.loadProductStore(1);
			}
			else
			{
				dialogEdit.disabled = 1;
				this.loadProductBranch(1);
			}
			
		}
	},
	beforeMount(){
	    this.loadBranches()
	}
})


 $( "#datepickerStart" ).datepicker();
 $( "#datepickerEnd" ).datepicker();


$('#table_product tbody').on( 'click', 'tr', function (e) {
	if(app.selectedBranch.id != 0)
	{
		index = table_product.row(this).data()[0]-1;
		dialogEdit.loadData(list_product[index]);
		$('#dialog').modal('show');
	}
		
	//$('#wrapper').append('<div id="over"></div>');
    //$('#over').fadeIn(300);

	//dialog.dialog("open");

});
 


