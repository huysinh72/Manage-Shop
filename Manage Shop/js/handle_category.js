var shopId = getCookie("shopId");
if(shopId == null)
	window.location.href='login.html?preUrl='+window.location.href;
var Shop = "Shop";
var database = firebase.database(); 

var table_employee = $('#table_category').DataTable();
var count = 1;
database.ref().child(Shop).child(shopId).child("category").on('child_added', snapshot => {
	var category  = snapshot.val();
	table_employee.row.add([count++, category.name, category.categoryDescription]).draw();

});

var app = new Vue({
	el: "#app",
	data: {
		Category : {
			id : '',
			name: '',
			categoryDescription: ''
		}
	},
	methods: {
		addCategory: function (){
			this.Category.id = database.ref().child(Shop).child(shopId).child("category").push().key;
			database.ref().child(Shop).child(shopId).child("category").child(this.Category.id).set(this.Category);
			this.Category.name = '';
			this.Category.categoryDescription = '';
			showToastSuccess('Add successfull category !!');
		}
	}
})


