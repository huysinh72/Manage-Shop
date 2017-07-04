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
$('#table_branch_transactions').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [1, 2, 3, 4, 5, 6]},
    ],
    "order": [[ 0, "desc" ]]
});


var table_branch_transactions = $('#table_branch_transactions').DataTable();

var transactions = [];
var startDate = formatDateYYMMDDtoMMDDYY(currentDay);
var endDate = formatDateYYMMDDtoMMDDYY(currentDay);

function getState(state)
{
    if(state == 2)
        return "Unassign";
    else 
        return "Assigned";
}

function loadtransaction(startDate, endDate)
{
    transactions = [];
    
    firebase.database().ref().child(Shop).child(shopId).child("notification").orderByChild("time").startAt(startDate + ' 00:00:00').endAt(endDate + '24:00:00').once('value', snapshot => {
        snapshot.forEach(function(childSnapshot) {
    
            if(childSnapshot.child("state").val() == 4 | childSnapshot.child("state").val() == 2)
            {
                transaction = childSnapshot.val();
                
                transactions.push(transaction);
            }
        });

        table_branch_transactions.clear().draw();
        for(i = 0; i < transactions.length; i++)
            table_branch_transactions.row.add([transactions[i].time, transactions[i].descript, transactions[i].from, transactions[i].to, transactions[i].product,transactions[i].quantity, transactions[i].acceptedQuantity, getState(transactions[i].state)]).draw();

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
        loadtransaction(formatDateMMDDYYtoYYMMDD(startDate), formatDateMMDDYYtoYYMMDD(endDate))
}

document.getElementById("datepickerStart").value = formatDateYYMMDDtoMMDDYY(currentDay);
document.getElementById("datepickerEnd").value = formatDateYYMMDDtoMMDDYY(currentDay);
loadtransaction(currentDay, currentDay);

function exportExcel()
{
    data = [];
    for(i = 0; i < transactions.length; i++)
    {
        em = {};
        em.Time = transactions[i].time;
        em.From = transactions[i].from;
        em.To = transactions[i].to;
        em.Product = transactions[i].product;
        em.Quantity = transactions[i].acceptedQuantity;
        em.State = getState(transactions[i].state);
        data.push(em);

    }
    var filename = '"Transaction report - ' + getCookie("shopName") + ' - ' + startDate + ' - ' + endDate +'.xlsx"';
    alasql('SELECT * INTO XLSX('+ filename +',{headers:true}) FROM ?',[data]);
}
