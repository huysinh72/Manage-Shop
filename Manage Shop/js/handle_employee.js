var shopId = getCookie("shopId");
if(shopId == null)
	window.location.href='login.html?preUrl='+window.location.href;
var Shop = "Shop";
var database = firebase.database();
var storage = firebase.storage(); 

var list_employee = [];
var table_employee = $('#table_employee').DataTable();
var count = 1;
var index = 0;



var app = new Vue({
	el: '#app',
	data: {
		selectedBranch: {},
	    branches: [],
	    types:['Salesman', 'Manager'],
	    selectedType: 'Salesman',
	    image: null,
	    Employee: {
	    	id: '',
	    	name: '',
	    	identity: '',
	    	sex: 'Male',
	    	birthday: '',
	    	phone: '',
	    	address: '',
	    	username: '',
	    	password: '',
	    	branchId: '',
	    	branchName: '',
	    	type: '',
	    	image: '',
	    	state: 'Active'
	    }
	},
	methods: {
		loadData: function(){
			var count = 1;
			table_employee.clear().draw();
			list_employee = [];
			firebase.database().ref().child(Shop).child(shopId).child("employee").on('child_added', snapshot => {
				var employee  = snapshot.val();
			  	list_employee.push(employee);
				table_employee.row.add([count++, addHyperlink(employee.name), employee.username, employee.phone, employee.address, employee.branchName, employee.type, employee.state]).draw();
			});
		},
		loadBranches :function (){
			database.ref().child(Shop).child(shopId).child("branch").on('child_added', snapshot => {
				var branch  = snapshot.val();
				this.branches.push(branch);
				if(this.branches.length == 1)
				{
					this.selectedBranch = branch;
				}

			});
		},
		onFileChange : function (){
			var input = document.getElementById("product_file");
		   	if (input.files && input.files[0]) {
		        var reader = new FileReader();

		        reader.onload = function (e) {
		            $('#product_image').attr('src', e.target.result);
		        }

		        reader.readAsDataURL(input.files[0]);
		    }

		   	this.image = input.files[0];
		},

		pushEmployee: function (){
			if(this.image != null)
			{	
			
				this.Employee.image = this.image.name;

		   		var uploadTask = storage.ref().child('images/'+ shopId+'/Employee/'+ this.image.name).put(this.image);

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

			this.Employee.id = database.ref().child(Shop).child(shopId).child("employee").push().key;
			database.ref().child(Shop).child(shopId).child("employee").child(this.Employee.id).set(this.Employee);

			this.Employee.name = '';
			this.Employee.identity = '';
			this.Employee.birthday = '';
			this.Employee.phone = '';
			this.Employee.address = '';
			this.Employee.username = '';
			this.Employee.password = '';
			this.image = null;
			$('#product_image').attr('src', '../image/noimageavailable.png');
			document.getElementById("product_file").value = '';
			showToastSuccess('Add successfull employee !!');
		},
		addEmployee: function (){
			this.Employee.branchId = this.selectedBranch.id;
			this.Employee.branchName = this.selectedBranch.name;
			this.Employee.type = this.selectedType;
			this.Employee.birthday = formatDateMMDDYYtoYYMMDD(document.getElementById("datepickerBirthday").value);
			
			if(this.Employee.type == 'Manager')
			{
				database.ref().child(Shop).child(shopId).child("branch").orderByChild("id").equalTo(this.Employee.branchId)
				.once('value', snapshot => {
					var check = 0;
					snapshot.forEach(function(childSnapshot) {
						if(childSnapshot.child("managerId").val() != '')
							check = 1;
					});	
					if(check == 1){
						showToastWarning(this.Employee.branchName +' already have a manager!!');
					}
					else{
						database.ref().child(Shop).child(shopId).child("branch").child(this.Employee.branchId).child("managerId").set(this.Employee.id);
						database.ref().child(Shop).child(shopId).child("branch").child(this.Employee.branchId).child("managerName").set(this.Employee.name);
						this.pushEmployee();
					}
				});
				
			}else {
				this.pushEmployee();
			}
			

			
			
		}
	},
	beforeMount(){
		this.loadData();
	    this.loadBranches()
	}
})


var dialogEdit = new Vue({
	el: '#dialog',
	data: {
		selectedBranch: {},
	    branches: [],
	    types:['Salesman', 'Manager'],
	    selectedType: '',
	    states:['Active', 'Stop'],
	    selectedState: '',
	    image: {},
	    Employee: {}
	},
	methods: {
		loadData :function (employee){
			
			this.Employee = employee;
			this.selectedType = employee.type;
			this.selectedState = employee.state;
			this.branches = [];
			document.getElementById("datepickerBirthday1").value = formatDateYYMMDDtoMMDDYY(this.Employee.birthday);

			database.ref().child(Shop).child(shopId).child("branch").on('child_added', snapshot => {
				var branch  = snapshot.val();
				this.branches.push(branch);

				if(branch.id == employee.branchId)
				{
					this.selectedBranch = branch;
				}
			});
			$('#product_image_edit').attr('src', '../image/noimageavailable.png');
			storage.ref().child('images/'+ shopId+'/Employee/'+ this.Employee.image).getDownloadURL().then(function(url) {
				var xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';
				xhr.onload = function(event) {
				   	var blob = xhr.response;
				};
				xhr.open('GET', url);
				xhr.send();

				// Or inserted into an <img> element:
				var img = document.getElementById('product_image_edit');
				img.src = url;
			}).catch(function(error) {
				  // Handle any errors
			});
		},
		onFileChange : function (){
			var input = document.getElementById("product_file_edit");
		   	if (input.files && input.files[0]) {
		        var reader = new FileReader();

		        reader.onload = function (e) {
		            $('#product_image_edit').attr('src', e.target.result);
		        }

		        reader.readAsDataURL(input.files[0]);
		    }

		   	this.image = input.files[0];
		},
		closeDialog : function (){
			$('#dialog').modal('hide');
		},
		saveData: function (){
			if(document.getElementById("product_file_edit").value != "")
			{
				this.Employee.image = this.image.name;

		   		var uploadTask = storage.ref().child('images/'+ shopId+'/Employee/'+ this.image.name).put(this.image);

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

			if (this.Employee.branchId != this.selectedBranch.id)
			{
				
				if(this.selectedType == 'Manager')
				{
					database.ref().child(Shop).child(shopId).child("branch").child(this.selectedBranch.id).child("managerId").set(this.Employee.id);
					database.ref().child(Shop).child(shopId).child("branch").child(this.selectedBranch.id).child("managerName").set(this.Employee.name);
				}

				if(this.Employee.type  == 'Manager' && this.Employee.branchId != '')
				{
					database.ref().child(Shop).child(shopId).child("branch").child(this.Employee.branchId).child("managerId").set('');
					database.ref().child(Shop).child(shopId).child("branch").child(this.Employee.branchId).child("managerName").set('');
				}
				this.Employee.type = this.selectedType;
				this.Employee.branchId = this.selectedBranch.id;
				this.Employee.branchName = this.selectedBranch.name;

			}
			else
			if(this.Employee.type != this.selectedType)
			{
				this.Employee.type = this.selectedType;
				this.Employee.branchId = this.selectedBranch.id;
				this.Employee.branchName = this.selectedBranch.name;

				if(this.selectedType == 'Manager')
				{
					database.ref().child(Shop).child(shopId).child("branch").child(this.selectedBranch.id).child("managerId").set(this.Employee.id);
					database.ref().child(Shop).child(shopId).child("branch").child(this.selectedBranch.id).child("managerName").set(this.Employee.name);
				}
				else
				{
					database.ref().child(Shop).child(shopId).child("branch").child(this.selectedBranch.id).child("managerId").set('');
					database.ref().child(Shop).child(shopId).child("branch").child(this.selectedBranch.id).child("managerName").set('');
				}
			}
			this.Employee.birthday = formatDateMMDDYYtoYYMMDD(document.getElementById("datepickerBirthday1").value);
			database.ref().child(Shop).child(shopId).child("employee").child(this.Employee.id).set(this.Employee);
			app.loadData();
			showToastSuccess('Save successfull !!');
			this.closeDialog();
		},
		saveChange : function (){

			if(this.selectedType == 'Manager' && (this.Employee.branchId != this.selectedBranch.id | this.Employee.type != this.selectedType))
			{
				database.ref().child(Shop).child(shopId).child("branch").orderByChild("id").equalTo(this.selectedBranch.id)
				.once('value', snapshot => {
					var check = 0;
					snapshot.forEach(function(childSnapshot) {
						if(childSnapshot.child("managerId").val() != '')
							check = 1;
					});	
					if(check == 1){
						showToastWarning(this.Employee.branchName +' already have a manager!!');
						return;
					}else {
						this.saveData();
					}
				});

				
			}else {
				this.saveData();
			}
		},
		showConfirmDialog: function(){
			$('#confirmDialog').modal('show');
		},
		remove : function() {
			
			if(this.Employee.type == "Manager")
			{

				database.ref().child(Shop).child(shopId).child("branch").child(this.Employee.branchId).child("managerId").set('');
				database.ref().child(Shop).child(shopId).child("branch").child(this.Employee.branchId).child("managerName").set('');
			}

			database.ref().child(Shop).child(shopId).child("employee").child(this.Employee.id).remove();

			list_employee.splice(index, 1);
			table_employee.clear().draw();
			count = 1;
			for(var i in list_employee)
			{	
				var employee = list_employee[i];
				table_employee.row.add([count++, addHyperlink(employee.name), employee.username, employee.phone, employee.address, employee.branchName, employee.type, employee.state]).draw();			}

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

$("#datepickerBirthday").datepicker();
$("#datepickerBirthday1").datepicker();

$('#table_employee tbody').on( 'click', 'tr', function (e) {
	index = table_employee.row(this).data()[0]-1;
	
	dialogEdit.loadData(list_employee[index]);

	$('#dialog').modal('show');
		
	//$('#wrapper').append('<div id="over"></div>');
    //$('#over').fadeIn(300);

	//dialog.dialog("open");

});

