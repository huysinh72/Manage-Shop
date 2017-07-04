var shopId = getCookie("shopId");
if(shopId == null)
    window.location.href='login.html?preUrl='+window.location.href;
document.getElementById("user").innerHTML = "<i class=\"fa fa-user\"></i> "+ getCookie("username") +"<b class=\"caret\"></b>";
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
                date.Invoice = 0;
                dates.push(date);
                sd = getNextDay(sd);
                diffDate --;
            }
         
            firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startDate +' 00:00:00').endAt(endDate + ' 24:00:00').once('value', snapshot => {
                snapshot.forEach(function(childSnapshot) {
                    if(childSnapshot.child("state").val() == 1)
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
                    profitTotal += dates[i].Revenue;
                }
                
                profitBar.setData(dates);
                document.getElementById("profitTotal").innerHTML  = "Revenue total: <label> $"+ accounting.formatNumber(profitTotal) +"</label>";
               
            });
        },

        handleMonth: function(startDate, endDate, index)
        {
    
            firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startDate +' 00:00:00').endAt(endDate + ' 24:00:00').once('value', snapshot => {       
                snapshot.forEach(function(childSnapshot) {
                        if(childSnapshot.child("state").val() == 1)
                        {
                            months[index].Revenue += childSnapshot.child("salePriceTotal").val();
                            months[index].Capital += childSnapshot.child("importPriceTotal").val();
                        }
                          
                });
                
                months[index].Profit = months[index].Revenue - months[index].Capital;
                months[index].Time = months[index].Time + '-' + months[index].Year;

                profitTotal = 0;

                for(i = 0; i < 12; i++)         
                    profitTotal += months[i].Revenue;
                
                
                profitBar.setData(months);
                document.getElementById("profitTotal").innerHTML  = "Revenue total: <label> $"+ accounting.formatNumber(profitTotal) +"</label>";
               
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
        forecastRevenue: function()
        {
            var forecastDates = [];
           
            startForecastDate = getBeforeDate(currentDay, 28);
            endForecastDate = getNextDate(currentDay, 6);
            dd = startForecastDate;
            while(dd <= endForecastDate)
            {
                var ob = {};
                ob.time = dd;
                ob.revenue1 = 0;
                ob.revenue2 = 0;
                ob.rate = 0;
                forecastDates.push(ob);
                dd = getNextDay(dd);
            }

            firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startForecastDate +' 00:00:00').endAt(currentDay + ' 24:00:00').once('value', snapshot => {       
                snapshot.forEach(function(childSnapshot) {
                        if(childSnapshot.child("state").val() == 1)
                        {
                            t = childSnapshot.child("time").val();
                            t = t.slice(0, 10);
                            for(i = 0; i < forecastDates.length-7; i++)
                                if(t == forecastDates[i].time)
                                {
                                    forecastDates[i].revenue1 += childSnapshot.child("salePriceTotal").val();
                                    break;
                                }
                        }    
                });

                var dataForecast = [];
                le = forecastDates.length-1;
                for(i = le; i > le-7; i--)
                {
                    rate = 1;
                    for(j = 4; j >= 1; j--)
                    {
                        if(forecastDates[i-j*7].revenue1 > 0)
                        {
                            forecastDates[i-j*7].rate = rate++;
                            forecastDates[i].rate += rate-1;
                        }
                    }

                    for(j = 4; j >= 1; j--)
                    {
                        if(forecastDates[i-j*7].revenue1 > 0)
                        {
                            forecastDates[i].revenue1 += forecastDates[i-j*7].revenue1*forecastDates[i-j*7].rate/forecastDates[i].rate;
                            forecastDates[i].revenue2 += forecastDates[i-j*7].revenue1/ forecastDates[i].rate;
                        }
                    }

                    forecastDates[i].revenue1 = parseInt(forecastDates[i].revenue1);
                    forecastDates[i].revenue2 = parseInt(forecastDates[i].revenue2);
                    dataForecast.unshift(forecastDates[i]);
                }

                for(i = 0; i< dataForecast.length; i++)
                    dataForecast[i].time = formatDateChart(dataForecast[i].time);

                forecastBar.setData(dataForecast);
            });
        }
    },
    beforeMount(){
        this.selectedTime = this.times[0];
        setNowDate();
        this.loadProfitDate();
        this.forecastRevenue();
        
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
        Revenue: 0
    }],
    xkey: 'Time',
    ykeys: ['Capital','Revenue'],
    labels: ['Capital','Revenue'],
    barRatio: 0.4,
    xLabelAngle: 50,
    barColors: ['#5cb85c', '#d9534f', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
    hideHover: 'auto',
    resize: true
});


var forecastBar = Morris.Bar({
    element: 'forecast-bar-chart',
    data: [{
        time: '',
        revenue1: 0,
        revenue2: 0,
    }],
    xkey: 'time',
    ykeys: ['revenue1', 'revenue2'],
    labels: ['Revenue by WMA', 'Revenue by SMA'],
    barRatio: 0.4,
    xLabelAngle: 50,
    barColors: ['#d9534f', '#337ab7', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
    hideHover: 'auto',
    resize: true
});

function exportExcel()
{
    if(app.selectedTime == 'Date')
    {
        var filename = '"Revenue report - ' + getCookie("shopName") + ' - ' + startDate + ' - ' + endDate +'.xlsx"';
    
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
            data.push(m);

        }

        var filename = '"Revenue report - ' + getCookie("shopName") + ' - Month.xlsx"';
    
        alasql('SELECT * INTO XLSX('+ filename +',{headers:true}) FROM ?',[data]);
    }
}




   
   

