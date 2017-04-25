var shopId = getCookie("shopId");
if(shopId == null)
    window.location.href='login.html?preUrl='+window.location.href;
var Shop = "Shop";
var database = firebase.database();

var currentDay = getCurrentDate();

$( "#datepickerStart").datepicker();
$( "#datepickerEnd").datepicker();

var list_importBill = [];
$('#table_employee').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [1,2,3, 4] },

    ]
});
var table_employee = $('#table_employee').DataTable();

var employees = [];
var startDate = formatDateYYMMDDtoMMDDYY(currentDay);
var endDate = formatDateYYMMDDtoMMDDYY(currentDay);

function loadEmployee(startDate, endDate)
{
    startDate = startDate+' 00:00:00';
    endDate = endDate + ' 24:00:00';
    employees = [];
    firebase.database().ref().child(Shop).child(shopId).child("employee").orderByChild("branchName").once('value', snapshot => {
        snapshot.forEach(function(childSnapshot) {
            employee = {};
            employee.name = childSnapshot.child("name").val();
            employee.id = childSnapshot.child("id").val();
            employee.branch = childSnapshot.child("branchName").val();
            employee.type = childSnapshot.child("type").val();
            employee.revenue = 0;
            employee.numberInvoice = 0;
            employees.push(employee); 
        });
        firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startDate).endAt(endDate).once('value', snapshot => {
            snapshot.forEach(function(childSnapshot) {

                for(i = 0; i< employees.length; i++)
                    if(childSnapshot.child("employeeId").val() == employees[i].id)
                    {
                        employees[i].revenue += childSnapshot.child("salePriceTotal").val();
                        employees[i].numberInvoice ++;
                        break;
                    }
            });

            employees.sort(function(a, b) {
                return parseFloat(b.revenue) - parseFloat(a.revenue);
            });

            table_employee.clear().draw();
            for(i = 0; i< employees.length; i++)
                table_employee.row.add([employees[i].name, employees[i].numberInvoice,  accounting.formatNumber(employees[i].revenue), employees[i].branch, employees[i].type]).draw();

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
        loadEmployee(formatDateMMDDYYtoYYMMDD(startDate), formatDateMMDDYYtoYYMMDD(endDate))
}

document.getElementById("datepickerStart").value = formatDateYYMMDDtoMMDDYY(currentDay);
document.getElementById("datepickerEnd").value = formatDateYYMMDDtoMMDDYY(currentDay);
loadEmployee(currentDay, currentDay);

function exportExcel()
{
    data = [];
    for(i = 0; i < employees.length; i++)
    {
        em = {};
        em.Employee = employees[i].name;
        em.Revenue = employees[i].revenue;
        em.Invoice = employees[i].numberInvoice;
        em.Branch = employees[i].branch;
        em.Type = employees[i].type;
        data.push(em);

    }
    var filename = '"Employee report - ' + getCookie("shopName") + ' - ' + startDate + ' - ' + endDate +'.xlsx"';
    alasql('SELECT * INTO XLSX('+ filename +',{headers:true}) FROM ?',[data]);
}
