var shopId = getCookie("shopId");
if(shopId == null)
	window.location.href='login.html?preUrl='+window.location.href;
document.getElementById("user").innerHTML = "<i class=\"fa fa-user\"></i> "+ getCookie("username") +"<b class=\"caret\"></b>";
var Shop = "Shop";
var database = firebase.database();
var storage = firebase.storage();  

var list_customer = [];
var list_pointLevel = [];

$('#table_customer').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [4]}]
});

$('#table_point_level').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [0,1]}]
});

var table_customer = $('#table_customer').DataTable();
var table_point_level = $('#table_point_level').DataTable();
var count = 1;

firebase.database().ref().child(Shop).child(shopId).child("customer").on('child_added', snapshot => {
	var customer  = snapshot.val();
	customer.id  = snapshot.key;
  	list_customer.push(customer);
	table_customer.row.add([count++, addHyperlink(customer.name), customer.phone, customer.email, customer.point]).draw();
});

firebase.database().ref().child(Shop).child(shopId).child("pointLevel").on('child_added', snapshot => {
	var pointLevel = snapshot.val();
	list_pointLevel.push(pointLevel);
	table_point_level.row.add([accounting.formatNumber(pointLevel.price), pointLevel.point]).draw();
});

var dialogEdit = new Vue({
	el: '#dialog',
	data: {
	    Customer: {},
	    image: {}
	},
	methods: {
		loadData :function (customer){
			this.Customer = customer;
			$('#customer_image_edit').attr('src', '../image/noimageavailable.png');
			storage.ref().child('images/'+ shopId+'/Customer/'+ this.Customer.imageName).getDownloadURL().then(function(url) {
				var xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';
				xhr.onload = function(event) {
				   	var blob = xhr.response;
				};
				xhr.open('GET', url);
				xhr.send();

				// Or inserted into an <img> element:
				var img = document.getElementById('customer_image_edit');
				img.src = url;
			}).catch(function(error) {
				  // Handle any errors
			});
		},
		onFileChange : function (){
			var input = document.getElementById("customer_file_edit");
		   	if (input.files && input.files[0]) {
		        var reader = new FileReader();

		        reader.onload = function (e) {
		            $('#customer_image_edit').attr('src', e.target.result);
		        }

		        reader.readAsDataURL(input.files[0]);
		    }

		   	this.image = input.files[0];
		},
		closeDialog : function (){
			$('#dialog').modal('hide');
		},
		reload : function () {
			
			table_customer.clear().draw();
			count = 1;
			for(var i in list_customer)
			{	
				var customer = list_customer[i];
				table_customer.row.add([count++, addHyperlink(customer.name), customer.phone, customer.email, customer.point]).draw();
			}
		},
		saveChange : function (){
			if(document.getElementById("customer_image_edit").value != "")
			{
				this.Customer.imageName = this.image.name;

		   		var uploadTask = storage.ref().child('images/'+ shopId+'/Customer/'+ this.Customer.imageName).put(this.image);

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

			}

			database.ref().child(Shop).child(shopId).child("customer").child(this.Customer.id).set(this.Customer);
			list_customer[index] = this.Customer;
			this.reload();

			showToastSuccess('Save successfull !!');
			this.closeDialog();
		},
		showConfirmDialog: function(){
			$('#confirmDialog').modal('show');
		},
		remove : function() {
			database.ref().child(Shop).child(shopId).child("customer").child(this.Customer.id).remove();

			list_customer.splice(index, 1);
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

$('#table_customer tbody').on( 'click', 'tr', function (e) {
	index = table_customer.row(this).data()[0]-1;
	
	dialogEdit.loadData(list_customer[index]);

	$('#dialog').modal('show');
	
});


var dialogAddPointLevel = new Vue({
	el: '#dialogAddPointLevel',
	data: {
		PointLevel:{
			price:'',
			point:''
		}
	},
	methods: {
		addPointLevel: function(){
			this.PointLevel.price = parseInt(this.PointLevel.price);
			this.PointLevel.point = parseInt(this.PointLevel.point);
			this.PointLevel.key = database.ref().child(Shop).child(shopId).child("pointLevel").push().key;
			database.ref().child(Shop).child(shopId).child("pointLevel").child(this.PointLevel.key).set(this.PointLevel);
			showToastSuccess('Add successfull !!');
			$('#dialogAddPointLevel').modal('hide');
		},
	}
})

function showDialogAddPointLevel()
{
	dialogAddPointLevel.PointLevel.price = '';
	dialogAddPointLevel.PointLevel.point = '';
	$('#dialogAddPointLevel').modal('show');
}


var dialogEditPointLevel = new Vue({
	el: '#dialogEditPointLevel',
	data: {
		PointLevel:{
			price:'',
			point:''
		}
	},
	methods: {
		loadData: function(pointLevel)
		{
			this.PointLevel = pointLevel;
		},
		reload : function () {
			
			table_point_level.clear().draw();
			count = 1;
			for(var i in list_pointLevel)
			{	
				var pointLevel = list_pointLevel[i];
				table_point_level.row.add([accounting.formatNumber(pointLevel.price), pointLevel.point]).draw();
			}
		},
		saveChangePointLevel: function(){
			database.ref().child(Shop).child(shopId).child("pointLevel").child(this.PointLevel.key).set(this.PointLevel);
			this.reload();
			showToastSuccess('Save successfull !!');
			$('#dialogEditPointLevel').modal('hide');
		},
		remove :function(){
			database.ref().child(Shop).child(shopId).child("pointLevel").child(this.PointLevel.key).remove();
			list_pointLevel.splice(index, 1);
			this.reload();

			showToastSuccess('Remove successfull !!');
			$('#dialogEditPointLevel').modal('hide');
		}
	}
})


$('#table_point_level tbody').on( 'click', 'tr', function (e) {
	index = table_point_level.row(this)[0][0];
	dialogEditPointLevel.loadData(list_pointLevel[index]);
	$('#dialogEditPointLevel').modal('show');
});
