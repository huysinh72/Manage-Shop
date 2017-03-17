var database = firebase.database(); 

var row = "";

firebase.database().ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("provider").on('child_added', snapshot => {
	var provider  = snapshot.val();
  	row = "<tr><td>" + provider.name + "</td><td>" + provider.phone + "</td><td>" + provider.email + "</td><td>" + provider.address 
  	+ "</td><td>" + provider.providerDescription + "</td>" + "<td><button type=\"button\" class=\"btn btn-sm btn-success\">Edit</button></td>"+"</tr>"; 
  	$( row ).appendTo( "#list_provider tbody" );

  // ...
});

function addClick()
{
	var provider = {
		id : "",
		name : document.getElementById("provider_name").value,
		phone : document.getElementById("provider_phone").value,
		email : document.getElementById("provider_email").value,
		address : document.getElementById("provider_address").value,
		providerDescription : document.getElementById("provider_description").value
	}

	if(provider.name == "" | provider.phone == "" | provider.email == "" )
		alert("Miss information");
	else {
		var key = database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("provider").push().key;
		provider.id = key;
		database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("provider").child(key).set(provider);
		alert("Add successfull");
	}
};

