var database = firebase.database(); 
var User = "User";
var Shop = "Shop"; 

var app = new Vue({
  // element to mount to
  el: '#app',
  // initial data
  data: {
    User: {
      name: '',
      email: '',
      password: '',
      phone: '',
      shopName: '',
      shopId: ''

    },
    reEnterPassword: ''
  },

  methods: {
    resetForm: function () {
      this.User.name = '';
      this.User.email ='';
      this.User.password = '';
      this.User.phone = '';
      this.User.shopName = '';
      this.reEnterPassword = ''; 
    },
    createShop: function () {

    	if(this.User.name != '' && this.User.email !='' && this.User.password != '' &&
    	this.User.phone != '' && this.User.shopName != '')
    	{

        firebase.database().ref().child(User).orderByChild("email").equalTo(this.User.email).once('value', snapshot => {
          var user = snapshot.val();
          if(user != null)
          {
            alert("Your email was used");
            this.resetForm();
            return;
          }
          else
          {
            if(this.User.password != this.reEnterPassword)
            {
              alert("password not match");
              return;
            }

            var key = database.ref().child(Shop).push().key;
            this.User.shopId = key;

            database.ref().child(User).push(this.User);

            alert(this.User.shopName + " was created");
            this.resetForm();
          }
        });
    	}
    }
  }
})