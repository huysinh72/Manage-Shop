var keyStore = "-KegQMCMVg-RqDX8_mA-";
var database = firebase.database(); 

var row = "";

var count = 0;
var sum = 0;

firebase.database().ref().child("CuaHang").child(keyStore).child("sumProduct").once('value', snapshot => {
	sum  = snapshot.val();
});

//database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("Branch")
firebase.database().ref().child("CuaHang").child(keyStore).child("product").on('child_added', snapshot => {
	var product  = snapshot.val();
	count ++;
	row = "<tr><td>" + product.name + "</td><td>" + product.price + "</td><td>" +  product.quantity + "</td><td>" + 
	product.category + "</td>" + "<td><button type=\"button\" class=\"btn btn-sm btn-success\">Edit</button></td>"+"</tr>"; 
	$( row ).appendTo( "#datatable-list-product tbody" );
	if (count == sum)
	{
		$('#datatable-list-product').DataTable({
            responsive: true
        });
	}
});

/*var timer = setTimeout(waitLoad, 3000);

function waitLoad()
{
	$(document).ready(function() {
        $('#datatable-list-product').DataTable({
            responsive: true
        });
    });
}

 

/*function importClick()
{
	var branch = {
		id : "",
		name : document.getElementById("form_branch_name").value,
		address : document.getElementById("form_branch_address").value,
		phone : document.getElementById("form_branch_phone").value,
		manager : document.getElementById("form_branch_manager").value
	};

	if(branch.name == "" | branch.address == "" | branch.phone == "" | branch.manager == "")
		alert("Miss information");
	else {
		var database = firebase.database(); 
		var key = database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("branch").push().key;
		branch.id = key;
		database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("branch").child(key).set(branch);
		alert("Add successfull");
	}
};*/

