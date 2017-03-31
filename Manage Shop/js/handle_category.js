var shopId = getCookie("shopId");
var Shop = "Shop";
var database = firebase.database(); 

var row = "";
database.ref().child(Shop).child(shopId).child("category").on('child_added', snapshot => {
	var category  = snapshot.val();
	row = "<tr><td>" + category.name + "</td><td>" + category.categoryDescription + "</td>" + "<td><button type=\"button\" class=\"btn btn-sm btn-success\">Edit</button></td>"+"</tr>"; 
  	$( row ).appendTo( "#list_category tbody" );
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
		var key = database.ref().child(Shop).child(shopId).child("category").push().key;
		category.id = key;
		database.ref().child(Shop).child(shopId).child("category").child(key).set(category);
		alert("Add successfull");
	}
};

