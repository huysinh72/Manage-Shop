var keyStore =  "-KegQMCMVg-RqDX8_mA-";

var database = firebase.database(); 

var select_product = document.getElementById("select_product");
var list_product = [];
firebase.database().ref().child("CuaHang").child(keyStore).child("product").on('child_added', snapshot => {
    var product  = snapshot.val();
 	list_product.push(product);
    select_product.appendChild(new Option(product.name, list_product.length-1));
});

var select_provider = document.getElementById("select_provider");

firebase.database().ref().child("CuaHang").child(keyStore).child("provider").on('child_added', snapshot => {
    var provider  = snapshot.val();
    select_provider.appendChild(new Option(provider.name, provider.id));
});

firebase.database().ref().child("CuaHang").child(keyStore).child("importBill").on('child_added', snapshot => {
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
		var key = database.ref().child("CuaHang").child(keyStore).child("importBill").push().key;
		importBill.id = key;
		database.ref().child("CuaHang").child(keyStore).child("importBill").child(key).set(importBill);

		database.ref().child("CuaHang").child(keyStore).child("product").child(importBill.productId).child("quantity").set(list_product[product_index].quantity + importBill.quantity);

		database.ref().child("CuaHang").child(keyStore).child("product").child(importBill.productId).child("price").set(importBill.price*(1 + list_product[product_index].interestRate));


		alert("Add successfull");
	}
};

