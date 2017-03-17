
//Branch
var Branch = {
	id : "",
	name : "",
	address : "",
	phone : "",
	manager : ""
};

//Category
var Category = {
	id: "",
	name: "",
	categoryDescription: ""
}

// Product
var Product = {
	id : "",
	name: "",
	barcode: "",
	category: "",
	interestRate: "",
	idCategory : "",
	price: 0,
	productDescription: "",
	quantity: "",
	linkImage: ""
}

// Provider
var Provider = {
	id : "",
	name : "",
	phone : "",
	email : "",
	address : "",
	providerDescription : ""
}

// ImportBill
var ImportBill = {
	id : "",
	productId : "",
	productName : "",
	price : "",
	quantity : "",
	time : "",
	providerId : "",
	providerName : ""
}

var sum = 0;
		firebase.database().ref().child("CuaHang").child(keyStore).child("sumProduct").once('value', snapshot => {
			sum = snapshot.val();
		});

		database.ref().child("CuaHang").child(keyStore).child("sumProduct").set(sum+1);