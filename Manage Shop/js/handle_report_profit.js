var shopId = getCookie("shopId");
if(shopId == null)
    window.location.href='login.html?preUrl='+window.location.href;
var Shop = "Shop";
var database = firebase.database();

var currentDay = getCurrentDate();
var currentMonth = getCurrentMonth();
var currentYear = getCurrentYear();
var dateOfMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var months= [];
var dates = [];
var startDate = formatDateYYMMDDtoMMDDYY(currentDay);
var endDate = formatDateYYMMDDtoMMDDYY(currentDay);

var app = new Vue({
    el: '#app',
    data: {
        times:['Date', 'Month'],
        selectedTime: '',
        
    },
    methods: {
        loadProfitDate :function()
        {
            startDate = formatDateMMDDYYtoYYMMDD(document.getElementById("datepickerStart").value);
            endDate = formatDateMMDDYYtoYYMMDD(document.getElementById("datepickerEnd").value);
    
            if(startDate > endDate)
            {    
                showToastWarning("Start date must be before end date!");
                return;
            }

            diffDate = dateDiffInDays(startDate, endDate);
           
            dates = [];
            sd = startDate;
            while(diffDate > 0)
            {
                date = {};
                date.Time = sd;
                date.Revenue = 0;
                date.Capital = 0;
                date.Profit = 0;
                date.Invoice = 0;
                dates.push(date);
                sd = getNextDay(sd);
                diffDate --;
            }
            startDate = startDate+' 00:00:00';
            endDate = endDate + ' 24:00:00';
            firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startDate).endAt(endDate).once('value', snapshot => {
                snapshot.forEach(function(childSnapshot) {
                    
                    for(i = 0; i < dates.length; i++)
                        if(dates[i].Time == childSnapshot.child("time").val().substr(0,10))
                        {
                            dates[i].Revenue += childSnapshot.child("salePriceTotal").val();
                            dates[i].Capital += childSnapshot.child("importPriceTotal").val();
                            dates[i].Invoice ++;
                            break;
                        }
                });

                profitTotal = 0;
                for(i = 0; i < dates.length; i++)
                {
                    dates[i].Time = formatDateChart(dates[i].Time);
                    dates[i].Profit = dates[i].Revenue - dates[i].Capital;
                    profitTotal += dates[i].Profit;
                }
                
                profitBar.setData(dates);
                document.getElementById("profitTotal").innerHTML  = "Profit total: <label> $"+ accounting.formatNumber(profitTotal) +"</label>";
               
            });
        },

        handleMonth: function(startDate, endDate, index)
        {
            startDate = startDate+' 00:00:00';
            endDate = endDate + ' 24:00:00';
            firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startDate).endAt(endDate).once('value', snapshot => {       
                snapshot.forEach(function(childSnapshot) {
                    
                   
                        months[index].Revenue += childSnapshot.child("salePriceTotal").val();
                        months[index].Capital += childSnapshot.child("importPriceTotal").val();
                    
                          
                });
                
                months[index].Profit = months[index].Revenue - months[index].Capital;
                months[index].Time = months[index].Time + '-' + months[index].Year;

                profitTotal = 0;

                for(i = 0; i < 12; i++)         
                    profitTotal += months[i].Profit;
                
                
                profitBar.setData(months);
                document.getElementById("profitTotal").innerHTML  = "Profit total: <label> $"+ accounting.formatNumber(profitTotal) +"</label>";
               
            });
        },

        loadProfitMonth: function()
        {

            m = currentMonth;
            y = currentYear;
            months = [];
            for(i = 12; i >=1; i --)
            {
                month = {};
                month.Time = m;
                month.Year = y;
                month.Revenue = 0;
                month.Capital = 0;
                month.Profit = 0;
                months.unshift(month); 
                m--;
                if(m == 0)
                {
                    m = 12; 
                    y --;
                }
            }

            for(i = 0; i < 12 ; i++)
            {
                if(months[i].Time < 10)
                    m = '0' + months[i].Time;

                startDate = months[i].Year  + '/'+ m + '/' + '01';
                endDate =  months[i].Year + '/' + m + '/' + dateOfMonth[months[i].Time];
                this.handleMonth(startDate, endDate, i);
                
            }
        },

        onChangeTime: function()
        {
            if(this.selectedTime == 'Date')
            {
                document.getElementById("formDay").style.display = '';
                setNowDate();
                this.loadProfitDate();
            }
            else{
                document.getElementById("formDay").style.display = 'none';
                if (this.selectedTime == 'Month')
                    this.loadProfitMonth();
            }
        },



    },
    beforeMount(){
        this.selectedTime = this.times[0];
        setNowDate();
        this.loadProfitDate();
        
    }
})

$( "#datepickerStart").datepicker();
$( "#datepickerEnd").datepicker();
setNowDate();
function setNowDate()
{
    document.getElementById("datepickerStart").value = formatDateYYMMDDtoMMDDYY(currentDay);
    document.getElementById("datepickerEnd").value = formatDateYYMMDDtoMMDDYY(currentDay);
}

var profitBar = Morris.Bar({
    element: 'morris-bar-chart',
    data: [{
        Time: '',
        Capital: 0,
        Revenue: 0,
        Profit: 0
    }],
    xkey: 'Time',
    ykeys: ['Capital','Revenue','Profit' ],
    labels: ['Capital','Revenue','Profit'],
    barRatio: 0.4,
    xLabelAngle: 35,
    barColors: ['#337ab7', '#5cb85c', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
    hideHover: 'auto',
    resize: true
});


function exportExcel()
{
    if(app.selectedTime == 'Date')
    {
        var filename = '"Profit report - ' + getCookie("shopName") + ' - ' + startDate + ' - ' + endDate +'.xlsx"';
    
        alasql('SELECT * INTO XLSX('+ filename +',{headers:true}) FROM ?',[dates]);
    }
    else
    {
        data = [];
        for(i = 0; i< months.length; i++)
        {
            m = {};
            m.Time = months[i].Time;
            m.Revenue = months[i].Revenue;
            m.Capital = months[i].Capital;
            m.Profit = months[i].Profit;
            data.push(m);

        }

        var filename = '"Profit report- ' + getCookie("shopName") + ' - Month.xlsx"';
    
        alasql('SELECT * INTO XLSX('+ filename +',{headers:true}) FROM ?',[data]);
    }
}




   
   

