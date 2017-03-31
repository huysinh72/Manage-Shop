

var shopId = getCookie("shopId");
var Shop = "Shop";
var database = firebase.database();
var storage = firebase.storage(); 

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
			startDay: '',
			endDay: '',
			image: '',
	    	state: 'Action'
	    }
	},
	watch: {
	    salePrice: function() {
	      	this.salePriceFormat = accounting.formatNumber(this.salePrice, 2);
	    }
	},
	methods: {

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

			var branchProduct = {
		    	id: this.Product.id,
		    	name: this.Product.name,
				barcode: this.Product.barcode,
				categoryName: this.Product.categoryName,
				categoryId : this.Product.categoryId,
				salePrice: this.Product.salePrice,
				importPrice1: 0,
				importPrice2: 0,
				productDescription: this.Product.productDescription,
				quantity1: 0,
				quantity2: 0,
				discount: 0,
				startDay: '',
				endDay: '',
				image: this.Product.image,
		    	state: 'Action'
		    }

			database.ref().child(Shop).child(shopId).child("branch").on('child_added', snapshot => {
				var branch  = snapshot.val();
				branchProduct.saleQuantity = 0;
				branchProduct.branchId = branch.id;
				branchProduct.branchName = branch.name;
				console.log(branchProduct);
				database.ref().child(Shop).child(shopId).child("branchStore").push(branchProduct);
			});
			alert("Add successfull");

			$('#product_image').attr('src', '../image/noimageavailable.png');
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
