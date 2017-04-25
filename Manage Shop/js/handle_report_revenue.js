var shopId = getCookie("shopId");
if(shopId == null)
    window.location.href='login.html?preUrl='+window.location.href;
var Shop = "Shop";
var database = firebase.database();

var currentDay = getCurrentDate();

function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  var date1 = new Date(a);
    var date2 = new Date(b);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

  return diffDays+1;
}

var revenues = [];
var startDate = formatDateYYMMDDtoMMDDYY(currentDay);
var endDate = formatDateYYMMDDtoMMDDYY(currentDay);



function loadRevenue(startDate, endDate, diffDate)
{

    revenues = [];
    sd = startDate;
    while(diffDate > 0)
    {
        revenue = {};
        revenue.Time = sd;
        revenue.Revenue = 0;
        revenue.Invoice = 0;
        revenues.push(revenue);
        sd = getNextDay(sd);
        diffDate --;
    }

    startDate = startDate+' 00:00:00';
    endDate = endDate + ' 24:00:00';
    firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startDate).endAt(endDate).once('value', snapshot => {
        snapshot.forEach(function(childSnapshot) {
            
            for(i = 0; i < revenues.length; i++)
                if(revenues[i].Time == childSnapshot.child("time").val().substr(0, 10))
                {
                    revenues[i].Revenue += childSnapshot.child("salePriceTotal").val();
                    revenues[i].Invoice ++;
                    break;
                }
        });


        for(i = 0; i < revenues.length; i++)
            revenues[i].Time = formatDateChart(revenues[i].Time);

        revenueBar.setData(revenues);
    });
}

function searchRevenue()
{
    startDate = document.getElementById("datepickerStart").value;
    endDate = document.getElementById("datepickerEnd").value;


    if(startDate == '' | endDate == '')
        showToastWarning("You have not entered a date yet!");
    else
    if(formatDateMMDDYYtoYYMMDD(startDate) > formatDateMMDDYYtoYYMMDD(endDate))
        showToastWarning("Start date must be before end date!");
    else
        loadRevenue(formatDateMMDDYYtoYYMMDD(startDate), formatDateMMDDYYtoYYMMDD(endDate),  dateDiffInDays(startDate, endDate))
   
}


 $( "#datepickerStart" ).datepicker();
 $( "#datepickerEnd" ).datepicker();


document.getElementById("datepickerStart").value = startDate;
document.getElementById("datepickerEnd").value = endDate;
loadRevenue(currentDay, currentDay, 1);

var revenueBar = Morris.Line({
        // ID of the element in which to draw the chart.
    element: 'morris-line-chart-revenue',
    // Chart data records -- each entry in this array corresponds to a point on
    // the chart.
    data: [{
        Time: '',
        Revenue: 0
    } ],
    // The name of the data record attribute that contains x-visitss.
    xkey: 'Time',
    // A list of names of data record attributes that contain y-visitss.
    ykeys: ['Revenue'],
    // Labels for the ykeys -- will be displayed when you hover over the
    // chart.
    labels: ['Revenue'],
    // Disables line smoothing
    smooth: false,
    lineWidth: 5,
    lineColors: ['#5cb85c', '#337ab7', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
    pointFillColors: ['#337ab7'],
    pointSize: 7,
    parseTime: false,
    resize: true
});
   
function exportExcel()
{
    
    var filename = '"Revenue report - ' + getCookie("shopName") + ' - ' + startDate + ' - ' + endDate +'.xlsx"';
    alasql('SELECT * INTO XLSX('+ filename +',{headers:true}) FROM ?',[revenues]);
}

