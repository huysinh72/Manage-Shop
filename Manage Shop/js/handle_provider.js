var shopId = getCookie("shopId");
var Shop = "Shop";
var database = firebase.database(); 

var list_provider = [];
var table_provider = $('#table_provider').DataTable();
var count = 1;

firebase.database().ref().child(Shop).child(shopId).child("provider").on('child_added', snapshot => {
	var provider  = snapshot.val();
  	list_provider.push(provider);
	table_provider.row.add([count++, provider.name, provider.phone, provider.email, provider.address, provider.providerDescription]).draw();
});

var app = new Vue({
	el: '#app',
	data: {
	    Provider: {
	    	id: '',
	    	name: '',
	    	phone: '',
	    	email: '',
	    	address: '',
	    	providerDescription: ''
	    }
	},
	methods: {
		addProvider: function (){
			this.Provider.id = database.ref().child(Shop).child(shopId).child("provider").push().key;
			database.ref().child(Shop).child(shopId).child("provider").child(this.Provider.id).set(this.Provider);

			this.Provider.name = '';
			this.Provider.phone = '';
			this.Provider.address = '';
			this.Provider.email = '';
			this.Provider.providerDescription = '';
		
			alert("Add successfull");
		}
	}
})


var dialogEdit = new Vue({
	el: '#dialog',
	data: {
	    Provider: {}
	},
	methods: {
		loadData :function (provider){
			this.Provider = provider;
		},
		closeDialog : function (){
			$('#dialog').modal('hide');
		},
		reload : function () {
			list_provider[index] = this.Provider;
			table_provider.clear().draw();
			count = 1;
			for(var i in list_provider)
			{	
				var provider = list_provider[i];
				table_provider.row.add([count++, provider.name, provider.phone, provider.email, provider.address, provider.providerDescription]).draw();
			}
		},
		saveChange : function (){		
			database.ref().child(Shop).child(shopId).child("provider").child(this.Provider.id).set(this.Provider);

			this.reload();

			alert("Save successfull");
			this.closeDialog();
		},
		remove : function() {

			database.ref().child(Shop).child(shopId).child("provider").child(this.Provider.id).remove();

			list_provider.splice(index, 1);
			table_provider.clear().draw();
			count = 1;
			for(var i in list_provider)
			{	
				var provider = list_provider[i];
				table_provider.row.add([count++, provider.name, provider.phone, provider.email, provider.address, provider.providerDescription]).draw();
			}

			alert("Remove successfull");
			this.closeDialog();
		}

	}
})

$('#table_provider tbody').on( 'click', 'tr', function (e) {
	index = table_provider.row(this).data()[0]-1;
	
	dialogEdit.loadData(list_provider[index]);

	$('#dialog').modal('show');
		
	//$('#wrapper').append('<div id="over"></div>');
    //$('#over').fadeIn(300);

	//dialog.dialog("open");

});
