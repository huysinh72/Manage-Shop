var shopId = getCookie("shopId");
var Shop = "Shop";
var database = firebase.database();
var storage = firebase.storage(); 

var list_employee = [];
var table_employee = $('#table_employee').DataTable();
var count = 1;

firebase.database().ref().child(Shop).child(shopId).child("employee").on('child_added', snapshot => {
	var employee  = snapshot.val();
  	list_employee.push(employee);
	table_employee.row.add([count++, employee.name, employee.username, employee.phone, employee.address, employee.branchName, employee.type, employee.state]).draw();
});

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
	    	birthday: '',
	    	phone: '',
	    	address: '',
	    	username: '',
	    	password: '',
	    	branchId: '',
	    	branchName: '',
	    	type: '',
	    	image: '',
	    	state: 'Action'
	    }
	},
	methods: {
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

		addEmployee: function (){
			this.Employee.branchId = this.selectedBranch.id;
			this.Employee.branchName = this.selectedBranch.name;
			this.Employee.type = this.selectedType;

			
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

			if(this.Employee.type == 'Manager')
			{
				database.ref().child(Shop).child(shopId).child("branch").child(this.selectedBranch.id).child("managerId").set(this.Employee.id);
				database.ref().child(Shop).child(shopId).child("branch").child(this.selectedBranch.id).child("managerName").set(this.Employee.name);
			}

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
			alert("Add successfull");
		}
	},
	beforeMount(){
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
	    states:['Action', 'Stop'],
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
			database.ref().child(Shop).child(shopId).child("branch").on('child_added', snapshot => {
				var branch  = snapshot.val();
				this.branches.push(branch);

				if(branch.id == employee.branchId)
				{
					this.selectedBranch = branch;
				}
			});

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
		saveChange : function (){
						
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

				if(this.Employee.type  == 'Manager')
				{
					database.ref().child(Shop).child(shopId).child("branch").child(this.Employee.branchId).child("managerId").set("");
					database.ref().child(Shop).child(shopId).child("branch").child(this.Employee.branchId).child("managerName").set("");
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
					database.ref().child(Shop).child(shopId).child("branch").child(this.selectedBranch.id).child("managerId").set("");
					database.ref().child(Shop).child(shopId).child("branch").child(this.selectedBranch.id).child("managerName").set("");
				}
			}

			console.log('')
			database.ref().child(Shop).child(shopId).child("employee").child(this.Employee.id).set(this.Employee);

			alert("Save successfull")
			this.closeDialog();
		}

	}
})


$('#table_employee tbody').on( 'click', 'tr', function (e) {
	index = table_employee.row(this).data()[0]-1;
	
	dialogEdit.loadData(list_employee[index]);

	$('#dialog').modal('show');
		
	//$('#wrapper').append('<div id="over"></div>');
    //$('#over').fadeIn(300);

	//dialog.dialog("open");

});

