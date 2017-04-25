var shopId = getCookie("shopId");
if(shopId == null)
    window.location.href='login.html?preUrl='+window.location.href;
var Shop = "Shop";
var database = firebase.database();

var currentDay = getCurrentDate();
var yesterday = getYesterdaysDate();


var invoiceNumber = 0;
var revenueToday = 0;
var revenueYesterday = 0;



firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(currentDay+ ' 00:00:00').endAt(currentDay+ ' 24:00:00').once('value', snapshot => {
	snapshot.forEach(function(childSnapshot) {
		invoiceNumber++;
		revenueToday += childSnapshot.child("salePriceTotal").val();

	});

	document.getElementById("invoices").innerHTML  = "<i class=\"fa fa-tags\" style=\"color: #d9534f; margin-left:5%\" ></i> " + invoiceNumber + " <sub style=\"color: #888888 \">invoices</sub>";
	document.getElementById("revenue").innerHTML = "<i class=\"fa fa-dollar\" style=\"color: #5cb85c;margin-left:5% \"></i> " + accounting.formatNumber(revenueToday) + " <sub style=\"color: #888888\">revenue</sub>";
	
	firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(yesterday+ ' 00:00:00').endAt(yesterday+ ' 24:00:00').once('value', snapshot => {
		snapshot.forEach(function(childSnapshot) {
			revenueYesterday += childSnapshot.child("salePriceTotal").val();
		});

		if(revenueYesterday != 0)
        {
    		if( revenueToday >= revenueYesterday )
    			document.getElementById("compare").innerHTML = "<i class=\"fa fa-arrow-up\" style=\"color: #337ab7; margin-left:5%\"></i> "+ 
    			(parseInt(revenueToday/revenueYesterday*100)-100) +"% <sub style=\"color: #888888\">compared to yesterday</sub>"; 
    		else
    			document.getElementById("compare").innerHTML = "<i class=\"fa fa-arrow-down\" style=\"color: #d9534f; margin-left:5%\"></i> "+ 
    			(100 - parseInt(revenueToday/revenueYesterday*100)) +"% <sub style=\"color: #888888\">compared to yesterday</sub>";
        }
        else
        if(revenueToday != 0)
            document.getElementById("compare").innerHTML = "<i class=\"fa fa-arrow-up\" style=\"color: #337ab7; margin-left:5%\"></i> "+ 
                (100) +"% <sub style=\"color: #888888\">compared to yesterday</sub>"; 

    });
	
});

branches = [];
firebase.database().ref().child(Shop).child(shopId).child("branch").once('value', snapshot => {
	snapshot.forEach(function(childSnapshot) {
		branch = {};
		branch.name = childSnapshot.child("name").val();
		branch.revenue = 0;
		branches.push(branch); 
	});
	firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(currentDay+ ' 00:00:00').endAt(currentDay+ ' 24:00:00').once('value', snapshot => {
		snapshot.forEach(function(childSnapshot) {

			for(i = 0; i< branches.length; i++)
				if(childSnapshot.child("branchName").val() == branches[i].name)
				{
					branches[i].revenue += childSnapshot.child("salePriceTotal").val();
					break;
				}
		});

		branchBar.setData(branches);
	});
});

products  = [];

firebase.database().ref().child(Shop).child(shopId).child("invoiceDetail").orderByChild("time").startAt(currentDay+ ' 00:00:00').endAt(currentDay+ ' 24:00:00').once('value', snapshot => {
    snapshot.forEach(function(childSnapshot) {  
        exist = 0;
        for(i = 0; i < products.length; i++)
            if(childSnapshot.child("name").val() == products[i].name)
            {
                exist = 1;
                products[i].revenue += childSnapshot.child("salePrice").val()*childSnapshot.child("saleQuantity").val();
                break;
            }
        if(exist ==0)
        {
            product = {};
            product.name = childSnapshot.child("name").val();
            product.revenue = childSnapshot.child("salePrice").val()*childSnapshot.child("saleQuantity").val();
            products.push(product);
        }

    });

    products.sort(function(a, b) {
        return parseFloat(b.revenue) - parseFloat(a.revenue);
    });
    
    if(products.length > 10)
    products.splice(10, products.length-10);
    
    if(products.length > 0 )
        productBar.setData(products);

});


function searchRevenue()
{
    startDate = document.getElementById("datepickerStart").value;
    endDate = document.getElementById("datepickerEnd").value;
    if(startDate == '' | endDate == '')
        showToastWarning("You have not entered a date yet!");
    if(formatDateMMDDYYtoYYMMDD(start) > formatDateMMDDYYtoYYMMDD(endDate))
        showToastWarning("Your start date and end date are not valid!");
}


var branchBar = Morris.Bar({
    element: 'morris-bar-chart-branch',
    data: [{name:0, revenue: 0}],
    xkey: 'name',
    ykeys: ['revenue'],
    labels: ['Revenue'],
    barRatio: 0.4,
    xLabelAngle: 35,
    hideHover: 'auto',
    barColors: ['#5cb85c', '#337ab7', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
    resize: true
});

var productBar = Morris.Bar({
        element: 'morris-bar-chart-product',
        data: [{
            name: '',
            revenue: 0
        }],
        xkey: 'name',
        ykeys: ['revenue'],
        labels: ['Revenue'],
        barRatio: 0.4,
        xLabelAngle: 10,
        hideHover: 'auto',
        barColors: ['#5cb85c', '#337ab7', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
        resize: true
    });

 $( "#datepickerStart" ).datepicker();
 $( "#datepickerEnd" ).datepicker();


   
   
   

