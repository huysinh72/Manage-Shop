//Some handle function



function showToastSuccess(content)
{
	$.toast({
		heading: 'SUCCESS',
	    text: content,
	    position: 'top-center',
	    icon: 'success',
	    loaderBg: '#337ab7' 
	});
}

function showToastWarning(content)
{
	$.toast({
		heading: 'WARNING',
	    text: content,
	    position: 'top-center',
	    icon: 'warning',
	    loaderBg: '#337ab7' 
	});
}

function getCurrentDate()
{
	var dateObj = new Date();
	var month = dateObj.getUTCMonth() + 1; 
	var day = dateObj.getUTCDate();
	var year = dateObj.getUTCFullYear();
	if(month < 10)
		month = "0" + month;
	if(day < 10)
		day = "0" + day;

	newdate = year + "/" + month + "/" + day;
	return newdate;
};

function getCurrentMonth()
{
	var dateObj = new Date();
	var month = dateObj.getUTCMonth() + 1; 
	return month;
}

function getCurrentYear()
{
	var dateObj = new Date();
	var year = dateObj.getUTCFullYear();
	return year;
}

function getYesterdaysDate() {
    var date = new Date();
    date.setDate(date.getDate()-1);
    month = (date.getMonth()+1);
    day = date.getDate();
   if(month < 10)
		month = "0" + month;
	if(day < 10)
		day = "0" + day;

    return date.getFullYear() + '/' + month + '/' + day;
}

function getBeforeDate(d, b) {
    var date = new Date(d);
    date.setDate(date.getDate()-b);
    month = (date.getMonth()+1);
    day = date.getDate();
   if(month < 10)
		month = "0" + month;
	if(day < 10)
		day = "0" + day;

    return date.getFullYear() + '/' + month + '/' + day;
}

function getNextDate(d, b)
{
	var date = new Date(d);
	date.setDate(date.getDate()+b);
	month = (date.getMonth()+1);
    day = date.getDate();
    if(month < 10)
		month = "0" + month;
	if(day < 10)
		day = "0" + day;

    return date.getFullYear()+ '/'+ month + '/' + day;

}

function getNextDay(d)
{
	var date = new Date(d);
	date.setDate(date.getDate()+1);
	month = (date.getMonth()+1);
    day = date.getDate();
   if(month < 10)
		month = "0" + month;
	if(day < 10)
		day = "0" + day;

    return date.getFullYear()+ '/'+ month + '/' + day;

}

function formatDateChart(d)
{
	var date = new Date(d);
	month = (date.getMonth()+1);
    day = date.getDate();
   if(month < 10)
		month = "0" + month;
	if(day < 10)
		day = "0" + day;

    return date.getFullYear() + '-' + month + '-' + day;
}

function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
	var date1 = new Date(a);
	var date2 = new Date(b);
	var timeDiff = Math.abs(date2.getTime() - date1.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

  	return diffDays+1;
}

function getCurrentDateAndTime() {
    var date = new Date();
    month = (date.getMonth()+1);
    day = date.getDate();
   if(month < 10)
		month = "0" + month;
	if(day < 10)
		day = "0" + day;

    return date.getFullYear() + '/' + month + '/' + day + ' ' + date.getHours()+ ':'+date.getMinutes()+':'+date.getSeconds();
}

function getCurrentTime(){
	var date = new Date();
	return date.getHours()+ ':'+date.getMinutes()+':00';
}

function getNumberBarcode(barcode)
{	
	var ss = ''+ barcode;

	if(ss.length < 5)
	{
		var n = 5-ss.length;
		for(i = 0; i < n; i++)
			ss = '0' + ss;
	}

	return 'SP'+ss;
}

function generateListBarcode(n)
{
	database.ref().child(Shop).child(shopId).child("productNumber")
		.once('value', snapshot => {
			var list_barcode = [];
			for(i=1; i <= n; i++)
			{
				var barcode = getNumberBarcode(snapshot.val()+i);	
				list_barcode.push(barcode);
			}
			
			return list_barcode;
		});
}

function formatDateMMDDYYtoYYMMDD (date)
{
	return date.slice(6, 10) + '/' + date.slice(0, 2) + '/' + date.slice(3, 5);
}

function formatDateYYMMDDtoMMDDYY (date)
{
	return date.slice(5, 7) + '/' + date.slice(8, 10) + '/' + date.slice(0, 4);
}

function addHyperlink(name)
{
	if (app.selectedBranch.id != 0)
		return '<a>'+ name +'</a>';
	else
		return name;
}

function addHyperlink(name, check)
{
	if (check != 0)
		return '<a>'+ name +'</a>';
	else
		return name;
}

function formatMoneyToInt(money)
{
	return money.replace(/,/g,'');
}