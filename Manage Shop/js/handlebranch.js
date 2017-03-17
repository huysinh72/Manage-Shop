var database = firebase.database(); 

var row = "";
//database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("Branch")
firebase.database().ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("Branch").on('child_added', snapshot => {
	var branch  = snapshot.val();
  	row = "<tr><td>" + branch.name + "</td><td>" + branch.address + "</td><td>" + branch.phone + "</td><td>" + branch.manager + "</td>" + "<td><button type=\"button\" class=\"btn btn-sm btn-success\">Edit</button></td>"+"</tr>"; 
  	$( row ).appendTo( "#list_branch tbody" );
  // ...
});

function addClick()
{
	var branch = {
		id : "",
		name : document.getElementById("form_branch_name").value,
		address : document.getElementById("form_branch_address").value,
		phone : document.getElementById("form_branch_phone").value,
		manager : document.getElementById("form_branch_manager").value
	};

	if(branch.name == "" | branch.address == "" | branch.phone == "" )
		alert("Miss information");
	else {
		var database = firebase.database(); 
		var key = database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("branch").push().key;
		branch.id = key;
		database.ref().child("CuaHang").child("-KegQMCMVg-RqDX8_mA-").child("branch").child(key).set(branch);
		alert("Add successfull");
	}
};

