var database = firebase.database();
var User = "User";
var Shop = "Shop"; 

var app = new Vue({
  // element to mount to
  el: '#app',
  // initial data
  data: {
    email:'',
    password:''
  },
  methods: {
    login: function (password) {

      firebase.database().ref().child(User).orderByChild("email").equalTo(this.email).once('value', snapshot => {
          check = 0;
          snapshot.forEach(function(childSnapshot) {
            check = 1;
            var user  = childSnapshot.val();
            if(user.password != SHA256(password)){
              showToastWarning("Your password was wrong");
            }
            else
            {
              setCookie("username", user.name);
              setCookie("shopId", user.shopId);
              setCookie("shopName", user.shopName);
              window.location.href='report_today.html?preUrl='+window.location.href;
              
            }
          });
          if (check == 0)
            showToastWarning("Your email was wrong");
          
      });  	
    }
  }
})