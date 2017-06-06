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

          snapshot.forEach(function(childSnapshot) {
            var user  = childSnapshot.val();
            if(user.password != SHA256(password)){
              alert(SHA256(password));
              showToastWarning("Wrong password");
            }
            else
            {
              setCookie("username", user.name);
              setCookie("shopId", user.shopId);
              setCookie("shopName", user.shopName);
              window.location.href='report_today.html?preUrl='+window.location.href;
              
            }
          });
          
      });  	
    }
  }
})