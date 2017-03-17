var database = firebase.database(); 

var select = document.getElementById("product_category");

firebase.database().ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("category").on('child_added', snapshot => {
	var category  = snapshot.val();
	//alert(category.name);
  	select.appendChild(new Option(category.name, category.id));
});



function addCategoryClick()
{
	var category = {
		id : "",
		name: document.getElementById("category_name").value,
		categoryDescription: document.getElementById("category_description").value
	};

	if(category.name == "")
		alert("Miss information");
	else {
		var database = firebase.database(); 
		var key = database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("category").push().key;
		category.id = key;
		database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("category").child(key).set(category);
		alert("Add successfull");
	}
};

var image = "";
function addFileClick()
{
	var input = document.getElementById("product_file");
   	if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#product_image').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }

   	image = input.files[0];
}

function addProductClick()
{
	var product = {
		id : "",
		name: document.getElementById("product_name").value,
		barcode: document.getElementById("product_barcode").value,
		interestRate: parseInt(document.getElementById("product_interestRate").value),
		category: document.getElementById("product_category").options[document.getElementById("product_category").selectedIndex].text,
		idCategory : document.getElementById("product_category").value,
		price: 0,
		productDescription: document.getElementById("product_description").value,
		quantity: 0,
		imageName: image.name
	};

	if(product.name == "" | product.barcode == "" | product.category == "" | product.productDescription == "" | product.imageName == "")
		alert("Miss information");
	else {
		
		//upload data
		var database = firebase.database(); 
		var key = database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("product").push().key;
		product.id = key;
		database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("product").child(key).set(product);

		//upload image
		var storage = firebase.storage();
   		var uploadTask = storage.ref().child('images/-KegQMCMVg-RqDX8_mA-/'+ image.name).put(image);

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

		alert("Add successfull");
	}
};