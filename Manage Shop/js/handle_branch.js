var shopId = getCookie("shopId");
if(shopId == null)
	window.location.href='login.html?preUrl='+window.location.href;
	
var Shop = "Shop";
var database = firebase.database(); 

var list_branch = [];
var table_branch = $('#table_branch').DataTable();
var count = 1;

firebase.database().ref().child(Shop).child(shopId).child("branch").on('child_added', snapshot => {
	var branch  = snapshot.val();
  	list_branch.push(branch);
	table_branch.row.add([count++, addHyperlink(branch.name), branch.address, branch.phone, branch.managerName]).draw();
  
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
		addBranch: function (){
			this.Branch.id = database.ref().child(Shop).child(shopId).child("branch").push().key;
			database.ref().child(Shop).child(shopId).child("branch").child(this.Branch.id).set(this.Branch);
			
			var branchProduct = {
				branchId: this.Branch.id,
				branchName: this.Branch.name,
				importPrice1: 0,
				importPrice2: 0,
				quantity1: 0,
				quantity2: 0,
				saleQuantity: 0
		    }

			database.ref().child(Shop).child(shopId).child("product").once('value', snapshot => {
				snapshot.forEach(function(childSnapshot) {
					var product = childSnapshot.val();
					branchProduct.id = product.id;
			    	branchProduct.name = product.name;
					branchProduct.barcode = product.barcode;
					branchProduct.categoryName = product.categoryName;
					branchProduct.categoryId = product.categoryId;
					branchProduct.salePrice = product.salePrice;
					branchProduct.productDescription = product.productDescription;
					branchProduct.image = product.image;
					branchProduct.state = product.state;
					branchProduct.discount = product.discount;
					branchProduct.startDate = product.startDate;
					branchProduct.endDate = product.endDate;
				   
					branchProduct.key = database.ref().child(Shop).child(shopId).child("branchStore").push().key;
					console.log(branchProduct);
					database.ref().child(Shop).child(shopId).child("branchStore").child(branchProduct.key).set(branchProduct);
				});
			});
			showToastSuccess('Add successfull branch !!');
			this.Branch.name = '';
			this.Branch.address = '';
			this.Branch.phone = '';
		}
	}
})

var dialogEdit = new Vue({
	el: '#dialog',
	data: {
	    Branch: {}
	},
	methods: {
		loadData :function (branch){
			this.Branch = branch;
		},
		closeDialog : function (){
			$('#dialog').modal('hide');
		},
		reload :function () {
			
			table_branch.clear().draw();
			count = 1;
			for(var i in list_branch)
			{	
				var branch = list_branch[i];
				table_branch.row.add([count++, addHyperlink(branch.name), branch.address, branch.phone, branch.managerName]).draw();
			}
		},
		saveChange :function (){		
			database.ref().child(Shop).child(shopId).child("branch").child(this.Branch.id).set(this.Branch);

			list_branch[index] = this.Branch;
			this.reload();

			showToastSuccess('Save successfull !!');
			this.closeDialog();
		},
		showConfirmDialog: function(){
			$('#confirmDialog').modal('show');
		},
		remove :function() {
			database.ref().child(Shop).child(shopId).child("branch").child(this.Branch.id).remove();
			
			database.ref().child(Shop).child(shopId).child("employee").orderByChild("branchId").equalTo(this.Branch.id)
			.once('value', snapshot => {
				snapshot.forEach(function(childSnapshot) {
					database.ref().child(Shop).child(shopId).child("employee").child(childSnapshot.key).child("branchId").set('');
					database.ref().child(Shop).child(shopId).child("employee").child(childSnapshot.key).child("branchName").set('');
				});	
			});
		
			list_branch.splice(index, 1);
			this.reload();

			showToastSuccess('Remove successfull !!');
			$('#confirmDialog').modal('hide');
			this.closeDialog();
		}

	}
})

var confirmDialog = new Vue({
	el: '#confirmDialog',
	methods: {
		remove: function(){
			dialogEdit.remove();
		}
	}
})

$('#table_branch tbody').on( 'click', 'tr', function (e) {
	index = table_branch.row(this).data()[0]-1;
	
	dialogEdit.loadData(list_branch[index]);

	$('#dialog').modal('show');
		
	//$('#wrapper').append('<div id="over"></div>');
    //$('#over').fadeIn(300);

	//dialog.dialog("open");

});

