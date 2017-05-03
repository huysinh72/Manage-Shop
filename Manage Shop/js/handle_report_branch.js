var shopId = getCookie("shopId");
if(shopId == null)
    window.location.href='login.html?preUrl='+window.location.href;
document.getElementById("user").innerHTML = "<i class=\"fa fa-user\"></i> "+ getCookie("username") +"<b class=\"caret\"></b>";

var Shop = "Shop";
var database = firebase.database();

var currentDay = getCurrentDate();

$( "#datepickerStart").datepicker();
$( "#datepickerEnd").datepicker();

$('#table_branch').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [1, 2, 3, 4] },

    ]
});
var table_branch = $('#table_branch').DataTable();
var branches = [];
var startDate = formatDateYYMMDDtoMMDDYY(currentDay);
var endDate = formatDateYYMMDDtoMMDDYY(currentDay);

function loadProfit(startDate, endDate)
{
    startDate = startDate+' 00:00:00';
    endDate = endDate + ' 24:00:00';
    branches = [];
    firebase.database().ref().child(Shop).child(shopId).child("branch").once('value', snapshot => {
        snapshot.forEach(function(childSnapshot) {
            branch = {};
            branch.Branch = childSnapshot.child("name").val();
            branch.Revenue = 0;
            branch.Capital = 0;
            branch.Profit = 0;
            branch.Invoice = 0;
            branches.push(branch); 
        });
        firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startDate).endAt(endDate).once('value', snapshot => {
            snapshot.forEach(function(childSnapshot) {

                for(i = 0; i< branches.length; i++)
                    if(childSnapshot.child("branchName").val() == branches[i].Branch)
                    {
                        branches[i].Revenue += childSnapshot.child("salePriceTotal").val();
                        branches[i].Capital += childSnapshot.child("importPriceTotal").val();
                        branches[i].Invoice ++;
                        break;
                    }
            });
            table_branch.clear().draw();
            for(i = 0; i< branches.length; i++)
            {
                branches[i].Profit = branches[i].Revenue - branches[i].Capital;
                table_branch.row.add([branches[i].Branch, accounting.formatNumber(branches[i].Revenue), accounting.formatNumber(branches[i].Capital), accounting.formatNumber(branches[i].Profit), branches[i].Invoice]).draw();
            }



            branchBar.setData(branches);
        });
    });
}

function searchProfit()
{
    startDate = document.getElementById("datepickerStart").value;
    endDate = document.getElementById("datepickerEnd").value;


    if(startDate == '' | endDate == '')
        showToastWarning("You have not entered a date yet!");
    else
    if(formatDateMMDDYYtoYYMMDD(startDate) > formatDateMMDDYYtoYYMMDD(endDate))
        showToastWarning("Start date must be before end date!");
    else
        loadProfit(formatDateMMDDYYtoYYMMDD(startDate), formatDateMMDDYYtoYYMMDD(endDate))
}

document.getElementById("datepickerStart").value = formatDateYYMMDDtoMMDDYY(currentDay);
document.getElementById("datepickerEnd").value = formatDateYYMMDDtoMMDDYY(currentDay);
loadProfit(currentDay, currentDay);

var branchBar = Morris.Bar({
    element: 'morris-bar-chart',
    data: [{
        Branch: '',
        Capital: 0,
        Revenue: 0,
        Profit: 0
    }],
    xkey: 'Branch',
    ykeys: ['Capital','Revenue','Profit' ],
    labels: ['Capital','Revenue','Profit'],
    barRatio: 0.4,
    xLabelAngle: 10,
    barColors: ['#337ab7', '#5cb85c', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
    hideHover: 'auto',
    resize: true
});

function exportExcel()
{
    
    var filename = '"Branch report - ' + getCookie("shopName") + ' - ' + startDate + ' - ' + endDate +'.xlsx"';
    alasql('SELECT * INTO XLSX('+ filename +',{headers:true}) FROM ?',[branches]);
}


