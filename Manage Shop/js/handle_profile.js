var shopId = getCookie("shopId");
if(shopId == null)
	window.location.href='login.html?preUrl='+window.location.href;
document.getElementById("user").innerHTML = "<i class=\"fa fa-user\"></i> "+ getCookie("username") +"<b class=\"caret\"></b>";

var Shop = "Shop";
var database = firebase.database();
var us = {}
var app = new Vue({
	el: '#app',
	data: {
		User: {
			name: '',
			email: '',
			password: '',
			phone: '',
			shopName: '',
			shopId: ''
		},
		password: '',
		newPassword: '',
		confirmPassword: '',
		key: ''
	},
	methods: {
		loadUser: function(){
			firebase.database().ref().child("User").orderByChild("shopId").equalTo(shopId).on('child_added', snapshot => {

				key = snapshot.key;
				this.User = snapshot.val();	
				
			});  	
		},
		saveChange: function(){
			if(this.password != '' && this.newPassword != '' && this.confirmPassword != '')
			{
				if(this.password != this.User.password)
					showToastWarning("Your old password was wrong");
				else
				if(this.newPassword != this.confirmPassword)
					showToastWarning("Your confirm password do not match");
				else
				{
					this.User.password = this.password;
					firebase.database().ref().child("User").child(key).set(this.User);
					showToastSuccess("Save change sucessfull");
				}
			}
			else
			if(this.password == '' && this.newPassword == '' && this.confirmPassword == '')
			{
				firebase.database().ref().child("User").child(key).set(this.User);
				showToastSuccess("Save change sucessfull");
			}
			else
				showToastWarning("You need enter more information");
		}
	},
	beforeMount(){
		this.loadUser();
	}
})