var shopId = getCookie("shopId");
if(shopId == null)
    window.location.href='login.html?preUrl='+window.location.href;
var Shop = "Shop";
var database = firebase.database();

var currentDay = getCurrentDate();

$( "#datepickerStart").datepicker();
$( "#datepickerEnd").datepicker();
$('#table_category').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [2,3,4,5] },

    ]
});
var table_category = $('#table_category').DataTable();

var categories = [];
var startDate = formatDateYYMMDDtoMMDDYY(currentDay);
var endDate = formatDateYYMMDDtoMMDDYY(currentDay);

function loadData(startDate, endDate)
{
    startDate = startDate+' 00:00:00';
    endDate = endDate + ' 24:00:00';
    
    categories = [];
    firebase.database().ref().child(Shop).child(shopId).child("category").once('value', snapshot => {
        snapshot.forEach(function(childSnapshot) {
            category = {};
            category.Category = childSnapshot.child("name").val();
            category.Revenue = 0;
            category.Capital = 0;
            category.Profit = 0;
            category.Invoice = 0;
            categories.push(category); 
        });
        firebase.database().ref().child(Shop).child(shopId).child("invoiceDetail").orderByChild("time").startAt(startDate).endAt(endDate).once('value', snapshot => {
            snapshot.forEach(function(childSnapshot) {

                for(i = 0; i< categories.length; i++)
                    if(childSnapshot.child("category").val() == categories[i].Category)
                    {
                        categories[i].Revenue += childSnapshot.child("salePrice").val();
                        categories[i].Capital += childSnapshot.child("importPrice1").val()*childSnapshot.child("quantity1").val() +
                                            childSnapshot.child("importPrice2").val()*childSnapshot.child("quantity2").val();
                        categories[i].Invoice ++;
                        break;
                    }
            });

            for(i = 0; i< categories.length; i++)
                categories[i].Profit = categories[i].Revenue - categories[i].Capital;
            count = 1;
            table_category.clear().draw();
            categories.sort(function(a, b) {
                return parseFloat(b.Revenue) - parseFloat(a.Revenue);
            });
            for(i = 0; i< categories.length; i++)
            {
                table_category.row.add([count++, categories[i].Category, accounting.formatNumber(categories[i].Capital), accounting.formatNumber(categories[i].Revenue), accounting.formatNumber(categories[i].Profit), categories[i].Invoice]).draw();
            }

            data = categories.slice(0, 10);
            categoryBar.setData(data);
        });
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
        loadData(formatDateMMDDYYtoYYMMDD(startDate), formatDateMMDDYYtoYYMMDD(endDate))
}

document.getElementById("datepickerStart").value = formatDateYYMMDDtoMMDDYY(currentDay);
document.getElementById("datepickerEnd").value = formatDateYYMMDDtoMMDDYY(currentDay);
loadData(currentDay, currentDay);

var categoryBar = Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            Category: '',
            Capital: 0,
            Revenue: 0,
            Profit: 0
        }],
        xkey: 'Category',
        ykeys: ['Capital','Revenue','Profit' ],
        labels: ['Capital','Revenue','Profit'],
        barRatio: 0.4,
        xLabelAngle: 10,
        hideHover: 'auto',
        barColors: ['#337ab7', '#5cb85c', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
        resize: true
});

function exportExcel()
{
    
    var filename = '"Category report - ' + getCookie("shopName") + ' - ' + startDate + ' - ' + endDate +'.xlsx"';
    alasql('SELECT * INTO XLSX('+ filename +',{headers:true}) FROM ?',[categories]);
}



