var shopId = getCookie("shopId");
if(shopId == null)
    window.location.href='login.html?preUrl='+window.location.href;
document.getElementById("user").innerHTML = "<i class=\"fa fa-user\"></i> "+ getCookie("username") +"<b class=\"caret\"></b>";
var Shop = "Shop";
var database = firebase.database();

var currentDay = getCurrentDate();
$( "#datepickerStart").datepicker();
$( "#datepickerEnd").datepicker();

var list_importBill = [];
$('#table_product').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [2,3] },

    ]
});
var table_product = $('#table_product').DataTable();

var products = [];
var startDate = formatDateYYMMDDtoMMDDYY(currentDay);
var endDate = formatDateYYMMDDtoMMDDYY(currentDay);

var app = new Vue({
    el: '#app',
    data: {
        branches:[],
        selectedBranch: null,
        
    },
    beforeMount(){
        branch = {};
        branch.name  = "All";
        this.branches.push(branch);
        this.selectedBranch = branch;

        firebase.database().ref().child(Shop).child(shopId).child("branch").on('child_added', snapshot => {
            
            branch = snapshot.val();
            this.branches.push(branch);
           
        });
    }
})

function loadBranchData(startDate, endDate)
{
    products  = [];
    startDate = startDate+' 00:00:00';
    endDate = endDate + ' 24:00:00';
    
    firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startDate).endAt(endDate).
    once('value', snapshot => {
        snapshot.forEach(function(childSnapshot) {
        if(childSnapshot.child("state").val() == 1)
        {
            invoice = childSnapshot.val();
           
            if (invoice.branchId == app.selectedBranch.id)
            for(j = 1; j < invoice.product.length; j++)
            {  

                pro = invoice.product[j];

                exist = 0;
                for(i = 0; i < products.length; i++)    
                    if(pro.name == products[i].name)
                    {
                        exist = 1;
                        products[i].revenue += pro.salePrice*(pro.quantity1+pro.quantity2);
                        products[i].capital += pro.importPrice1*pro.quantity1 + pro.importPrice2*pro.quantity2;

                        products[i].number += pro.quantity1 + pro.quantity2;
                        break;
                    }

                if(exist ==0)
                {
                    product = {};
                    product.name = pro.name;
                    product.revenue = pro.salePrice*(pro.quantity1+pro.quantity2);
                    product.capital = pro.importPrice1*pro.quantity1 + pro.importPrice2*pro.quantity2;
                    product.profit = 0;
                    product.number = pro.quantity1 + pro.quantity2;
                    products.push(product);
                }
            }
        }
        });

        if(products.length > 0)
        {
            for(i = 0; i < products.length; i++)
                products[i].profit = products[i].revenue - products[i].capital;

            products.sort(function(a, b) {
                return parseFloat(b.revenue) - parseFloat(a.revenue);
            });
            
            data = products.slice(0, 10);
            productRevennueBar.setData(data);

            products.sort(function(a, b) {
                return parseFloat(b.number) - parseFloat(a.number);
            });
            data = products.slice(0, 10);
            productNumberBar.setData(data);
           
            count = 1;
            table_product.clear().draw();
            for(i = 0; i < products.length; i++)
                table_product.row.add([count++, products[i].name, products[i].number, accounting.formatNumber(products[i].revenue)]).draw();
            
        }
        else
        {
            product = {};
            product.name = '';
            product.revenue = 0;
            product.capital = 0;
            product.profit = 0;
            product.number = 0;
            products.push(product);
            productRevennueBar.setData(products);
            productNumberBar.setData(products);
            table_product.clear().draw();
        }
    });
}

function loadAllData(startDate, endDate){
    products  = [];
    startDate = startDate+' 00:00:00';
    endDate = endDate + ' 24:00:00';
    firebase.database().ref().child(Shop).child(shopId).child("invoiceDetail").orderByChild("time").startAt(startDate).endAt(endDate).once('value', snapshot => {
        snapshot.forEach(function(childSnapshot) {
        if(childSnapshot.child("state").val() == 0)
        {  
            exist = 0;
            for(i = 0; i < products.length; i++)
                if(childSnapshot.child("name").val() == products[i].name)
                {

                    exist = 1;
                    products[i].revenue += childSnapshot.child("salePrice").val()*childSnapshot.child("saleQuantity").val();
                    products[i].capital += childSnapshot.child("importPrice1").val()*childSnapshot.child("quantity1").val() +
                                            childSnapshot.child("importPrice2").val()*childSnapshot.child("quantity2").val();
                    products[i].number += childSnapshot.child("saleQuantity").val();
                    
                    break;
                }
            if(exist ==0)
            {

                product = {};
                product.name = childSnapshot.child("name").val();
                product.revenue = childSnapshot.child("salePrice").val()*childSnapshot.child("saleQuantity").val();
                product.capital = childSnapshot.child("importPrice1").val()*childSnapshot.child("quantity1").val() +
                                            childSnapshot.child("importPrice2").val()*childSnapshot.child("quantity2").val();
                product.profit = 0;
                product.number = childSnapshot.child("saleQuantity").val();
                products.push(product);
            }
        }
        });

        if(products.length > 0)
        {
            
            products.sort(function(a, b) {
                return parseFloat(b.revenue) - parseFloat(a.revenue);
            });
            
            data = products.slice(0, 10);
            productRevennueBar.setData(data);

            products.sort(function(a, b) {
                return parseFloat(b.number) - parseFloat(a.number);
            });
            data = products.slice(0, 10);
            productNumberBar.setData(data);
           
            count = 1;
            table_product.clear().draw();
            for(i = 0; i < products.length; i++)
                table_product.row.add([count++, products[i].name, products[i].number, accounting.formatNumber(products[i].revenue)]).draw();

        }
        else
        {
            product = {};
            product.name = '';
            product.revenue = 0;
            product.capital = 0;
            product.profit = 0;
            product.number = 0;
            products.push(product);
            productRevennueBar.setData(products);
            productNumberBar.setData(products);
            table_product.clear().draw();
        }
    });
}

function searchFollowDate()
{
    startDate = document.getElementById("datepickerStart").value;
    endDate = document.getElementById("datepickerEnd").value;


    if(startDate == '' | endDate == '')
        showToastWarning("You have not entered a date yet!");
    else
    if(formatDateMMDDYYtoYYMMDD(startDate) > formatDateMMDDYYtoYYMMDD(endDate))
        showToastWarning("Start date must be before end date!");
    else
    {
        if(app.selectedBranch.name == 'All')
            loadAllData(formatDateMMDDYYtoYYMMDD(startDate), formatDateMMDDYYtoYYMMDD(endDate));
        else
            loadBranchData(formatDateMMDDYYtoYYMMDD(startDate), formatDateMMDDYYtoYYMMDD(endDate));
    }
}

document.getElementById("datepickerStart").value = formatDateYYMMDDtoMMDDYY(currentDay);
document.getElementById("datepickerEnd").value = formatDateYYMMDDtoMMDDYY(currentDay);
loadAllData(currentDay, currentDay);


var productRevennueBar = Morris.Bar({
    element: 'morris-bar-chart-revenue',
    data: [{
        name: '',
        revenue: 0
    }],
    xkey: 'name',
    ykeys: ['revenue'],
    labels: ['Revenue'],
    axes: true,
    barRatio: 0.4,
    xLabelAngle: 70,
    hideHover: 'auto',
    xLabelMargin: 20, 
    barColors: ['#5cb85c', '#5cb85c', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
    resize: true
});

var productNumberBar = Morris.Bar({
    element: 'morris-barr-chart-number',
    data: [{
        name: '',
        number: 0
    }],
    xkey: 'name',
    ykeys: ['number'],
    labels: ['Number'],
    barRatio: 0.4,
    xLabelAngle: 70,
    hideHover: 'auto',
    barColors: ['#5cb85c', '#5cb85c', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
    resize: true
});


function exportExcel()
{   
    data = [];
    for(i = 0; i < products.length; i++)
    {
        em = {};
        em.Product = products[i].name;
        em.Revenue = products[i].revenue;
        em.Capital = products[i].capital;
        em.Profit = products[i].profit;
        em.Number = products[i].number;
        data.push(em);

    }
    if( app.selectedBranch.name == 'All')
        filename = '"Product report - ' + getCookie("shopName") + ' - ' + startDate + ' - ' + endDate +'.xlsx"';
    else
        filename = '"Product report - ' + getCookie("shopName") + ' - ' + app.selectedBranch.name +' - ' + startDate + ' - ' + endDate +'.xlsx"';
    alasql('SELECT * INTO XLSX('+ filename +',{headers:true}) FROM ?',[data]);
}


   
   

