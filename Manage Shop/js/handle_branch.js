var shopId = getCookie("shopId");
var Shop = "Shop";
var database = firebase.database(); 

var list_branch = [];
var table_branch = $('#table_branch').DataTable();
var count = 1;

firebase.database().ref().child(Shop).child(shopId).child("branch").on('child_added', snapshot => {
	var branch  = snapshot.val();
  	list_branch.push(branch);
	table_branch.row.add([count++, branch.name, branch.address, branch.phone, branch.managerName]).draw();
  
});

var app = new Vue({
	el: '#app',
	data: {
		Branch:{
			id: '',
			name: '',
			address: '',
			phone: '',
			managerName: '',
			managerId: ''
		}
	},
	methods: {
		addCategory: function (){
			this.Branch.id = database.ref().child(Shop).child(shopId).child("branch").push().key;
			database.ref().child(Shop).child(shopId).child("branch").child(this.Branch.id).set(this.Branch);
			alert("Add successfull");
			this.Branch.name = '';
			this.Branch.address = '';
			this.Branch.phone = '';
		}
	}
})


