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
      { className: "text-right", "targets": [3,5,9] },
      { className: "text-center", "targets": [4,8]}
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
	    reducePrice: '',
	    reducePriceFormat: '',
	    discount: 0,
	    newSalePrice: 0,
	    Product: {}
	},
	watch: {
	    salePriceFormat: function() {
	    	tmp = formatMoneyToInt(this.salePriceFormat);
	      	this.salePriceFormat = accounting.formatNumber(tmp);
	      	this.salePrice = tmp;
	    },
	    currentImportPriceFormat: function() {
	    	tmp = formatMoneyToInt(this.currentImportPriceFormat);
	      	this.currentImportPriceFormat = accounting.formatNumber(tmp);
	      	this.currentImportPrice = tmp;
	    },
	    oldImportPriceFormat: function() {
	    	tmp = formatMoneyToInt(this.oldImportPriceFormat);
	      	this.oldImportPriceFormat = accounting.formatNumber(tmp);
	      	this.oldImportPrice = tmp;

	    },
	    reducePriceFormat: function() {
	    	tmp = formatMoneyToInt(this.reducePriceFormat);
	    	this.reducePriceFormat = accounting.formatNumber(tmp);
	    	this.reducePrice = tmp;
	    	if(tmp == 0)
	    		this.reducePriceFormat = '';
	    }
	},
	methods: {
		onChangeDiscountAndReducePrice : function(){
			tmp = parseInt(this.salePrice*(1-this.discount/100)-this.reducePrice);
			this.newSalePrice = accounting.formatNumber(tmp);
			if(tmp < this.currentImportPrice | tmp < this.oldImportPrice)
				showToastWarning("Your new sale price less than import price");
		},
		onChangeCurrentImportPrice : function(){
			if(this.currentImportPrice > this.salePrice)
				showToastWarning("Your import price larger sale price");

		},
		onChangeOldImportPrice: function(){
			if(this.oldImportPrice > this.salePrice)
				showToastWarning("Your import price larger sale price");

		},
		setProductInfo : function(){
			this.Product.quantity1 = parseInt(this.Product.quantity1);
			this.Product.quantity2 = parseInt(this.Product.quantity2);
			this.Product.salePrice = parseFloat(this.salePrice);
			this.Product.importPrice1 = parseInt(this.currentImportPrice);
			this.Product.importPrice2 = parseInt(this.oldImportPrice);	
		},
		setChangeProductInfo : function(){
			this.Product.discount = parseInt(this.discount);
			
			this.Product.reducePrice = parseInt(this.reducePrice);

			startD = document.getElementById("datepickerStart").value;
			if(startD != '')
				this.Product.startDate = formatDateMMDDYYtoYYMMDD(startD);

			endD = document.getElementById("datepickerEnd").value;
			if(endD != '')
				this.Product.endDate = formatDateMMDDYYtoYYMMDD(endD);
		},

		loadData : function (product){
			JsBarcode('#barcode' , product.barcode);
			
			this.Product = product;
			this.Product1 = product;
			this.discount = product.discount;
			this.salePrice = product.salePrice;
			this.salePriceFormat = accounting.formatNumber(product.salePrice);
			this.currentImportPrice = product.importPrice1;
			this.currentImportPriceFormat = accounting.formatNumber(product.importPrice1);
			this.oldImportPrice = product.importPrice2;
			this.oldImportPriceFormat = accounting.formatNumber(product.importPrice2);
			this.reducePrice = product.reducePrice;
			this.reducePriceFormat = accounting.formatNumber(product.reducePrice);

			document.getElementById("datepickerStart").value = '';
			document.getElementById("datepickerEnd").value = '';

			if(product.startDate != '')
				document.getElementById("datepickerStart").value = formatDateYYMMDDtoMMDDYY(product.startDate);
			if(product.endDate != '')
				document.getElementById("datepickerEnd").value = formatDateYYMMDDtoMMDDYY(product.endDate);

			firebase.database().ref().child(Shop).child(shopId).child("category").on('child_added', snapshot => {
				var category  = snapshot.val();
				this.categories.push(category);
				if(category.id == product.categoryId)
					this.selectedCategory = category;
			});

			tmp = parseInt(this.salePrice*(1-this.discount/100) - this.reducePrice);
			this.newSalePrice = accounting.formatNumber(tmp);

			if(app.selectedBranch.id == 1)
			{
				firebase.database().ref().child(Shop).child(shopId).child("branchStore").orderByChild("id").equalTo(this.Product.id).on('child_added', snapshot => {
			      	if(snapshot.child("discount").val() != product.discount){
			      		this.discount = '';
			      		this.newSalePrice = '';
			      	}
		      		if(snapshot.child("reducePrice").val() != product.reducePrice)
		      		{
		      			this.reducePrice = '';
		      			this.reducePriceFormat = '';
		      			this.newSalePrice = '';
		      		}
		      		if(snapshot.child("startDate").val() != product.startDate)
		      			document.getElementById("datepickerStart").value = '';
	      			if(snapshot.child("endDate").val() != product.endDate)
		      			document.getElementById("datepickerEnd").value = '';			
				  
				});
			}

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
			if(this.Product.startDate > this.Product.endDate)
				showToastWarning("Start date discount before end date discount");

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
				var branchProduct = {
			    	id: this.Product.id,
			    	name: this.Product.name,
					barcode: this.Product.barcode,
					categoryName: this.Product.categoryName,
					categoryId : this.Product.categoryId,
					salePrice: this.Product.salePrice,
					productDescription: this.Product.productDescription,
					discount: 0,
					reducePrice: 0,
					startDate: '',
					endDate: '',
					image: this.Product.image,
			    	state: 'Active'
			    }

			    if(this.discount != ''){
					branchProduct.discount = parseInt(this.discount);
					this.Product.discount = this.discount;
			    }
				if(this.reducePrice != ''){
					branchProduct.reducePrice = parseInt(this.reducePrice);
					this.Product.reducePrice = this.reducePrice;
				}

				startD = document.getElementById("datepickerStart").value;
				if(startD != ''){
					branchProduct.startDate = formatDateMMDDYYtoYYMMDD(startD);
					this.Product.startDate = formatDateMMDDYYtoYYMMDD(startD);
				}

				endD = document.getElementById("datepickerEnd").value;
				if(endD != ''){
					branchProduct.endDate = formatDateMMDDYYtoYYMMDD(endD);
					this.Product.endDate = formatDateMMDDYYtoYYMMDD(endD); 
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
						if(branchProduct.discount == 0)
							branchProduct.discount = ss.discount;
						if(branchProduct.reducePrice == 0)
							branchProduct.reducePrice = ss.reducePrice;
						if(branchProduct.startDate == '')
							branchProduct.startDate = ss.startDate;
						if(branchProduct.endDate == '')
							branchProduct.endDate = ss.endDate;

						database.ref().child(Shop).child(shopId).child("branchStore").child(childSnapshot.key).set(branchProduct);
					});	
				});

				database.ref().child(Shop).child(shopId).child("product").child(this.Product.id).set(this.Product);
			}
			else
			{
				this.setChangeProductInfo();
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
				table_product.row.add([count++, addHyperlink(product.name), product.barcode,  accounting.formatNumber(product.salePrice), product.discount,accounting.formatNumber(product.reducePrice), product.startDate,product.endDate,
						product.quantity1 + product.quantity2, accounting.formatNumber(product.importPrice1), product.categoryName, branchName]).draw();
			}
			this.closeDialog();
		},
		showConfirmDialog: function(){
			$('#confirmDialog').modal('show');
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
			var count = 1;
			for(var i in list_product)
			{	
				var product = list_product[i];
				branchName = "Store";
				if(app.selectedBranch.id !=1)
					branchName = product.branchName;
				table_product.row.add([count++, addHyperlink(product.name), product.barcode,  accounting.formatNumber(product.salePrice), product.discount,accounting.formatNumber(product.reducePrice), product.startDate,product.endDate,
						product.quantity1 + product.quantity2, accounting.formatNumber(product.importPrice1), product.categoryName, branchName]).draw();
			}

			showToastSuccess('Remove successfull !!!');
			$('#confirmDialog').modal('hide');
			this.closeDialog();
		},
		getBarcodeNumber: function(){
			$('#barcodeNumberDialog').modal('show');

		},
		printBarcode: function (barcodeNumber){

			var img = document.getElementById("barcode");
			var canvas = document.createElement("canvas");

		    canvas.width = img.width;
		    canvas.height = img.height;
		    var ctx = canvas.getContext("2d");

		    ctx.drawImage(img, 0, 0);

		    var dataURL = canvas.toDataURL("image/jpeg");
			var doc = new jsPDF();
			doc.setFontSize(10);

			col = parseInt(barcodeNumber / 5);
			m = 5;
			page = parseInt(barcodeNumber / 65)+1;
			
			for(p = 0; p < page; p++)
			{
				if(p > 0)
					doc.addPage();
				x = 8;
				y = 8;
				w = 38;
				h = 21;
				mx = 3;
				n = 13;
				if(p == page-1)
					n = (col-13*p)+1;

				for(i = 0; i < n; i++)
				{
					x = 8;
					if(n < 13 & i == n-1)
					{
						m = barcodeNumber % 5;
					}
					for(j = 0; j < m; j++)
					{
						//doc.text(x + w*j + mx, y + h*i, "" + this.Product.name);
						doc.addImage(dataURL, 'PNG', x + w*j, y + h*i, 37, 15);
						doc.text(x + w*j + mx, y + h*i+17, "$" + accounting.formatNumber(this.Product.salePrice));
						x++;
						
					}
					y++;
				}
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

var barcodeNumberDialog = new Vue({
	el: '#barcodeNumberDialog',
	data: {
		barcodeNumber: 0
	},
	methods: {
		printBarcode: function(){
			dialogEdit.printBarcode(this.barcodeNumber);
			this.barcodeNumber = 0;
			$('#barcodeNumberDialog').modal('hide');
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
			var branch = {id: '0', name:'Overview'};
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
					table_product.row.add([count++, addHyperlink(product.name, all), product.barcode,  accounting.formatNumber(product.salePrice), product.discount +'%', accounting.formatNumber(product.reducePrice), product.startDate,product.endDate,
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
					table_product.row.add([count++, addHyperlink(product.name, all), product.barcode,  accounting.formatNumber(product.salePrice), product.discount+'%', accounting.formatNumber(product.reducePrice), product.startDate,product.endDate,
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
					table_product.row.add([count++, addHyperlink(product.name, all), product.barcode,  accounting.formatNumber(product.salePrice), product.discount+'%', accounting.formatNumber(product.reducePrice), product.startDate,product.endDate,
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
				document.getElementById("discountId").style.backgroundColor = '#CCC';
				document.getElementById("reducePriceFormatId").style.backgroundColor = '#CCC';
				document.getElementById("datepickerStart").style.backgroundColor = '#CCC';
				document.getElementById("datepickerEnd").style.backgroundColor = '#CCC';
				dialogEdit.disabled = 0;
				this.loadProductStore(1);
			}
			else
			{
				document.getElementById("discountId").style.backgroundColor = '#FFF';
				document.getElementById("reducePriceFormatId").style.backgroundColor = '#FFF';
				document.getElementById("datepickerStart").style.backgroundColor = '#FFF';
				document.getElementById("datepickerEnd").style.backgroundColor = '#FFF';
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

});
 


