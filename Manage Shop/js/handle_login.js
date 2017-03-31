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
            if(user.password != password)
              alert("Wrong password");
            else
            {
              setCookie("shopId", user.shopId);
              window.location.href='report_revenue.html?preUrl='+window.location.href;
              
            }
          });
          
      });  	
    }
  }
})