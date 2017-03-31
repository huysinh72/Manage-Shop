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


function formatDateMMDDYYtoYYMMDD (date)
{
	return date.slice(6, 10) + '/' + date.slice(0, 2) + '/' + date.slice(3, 5);
}

function formatDateYYMMDDtoMMDDYY (date)
{
	return date.slice(5, 7) + '/' + date.slice(8, 10) + '/' + date.slice(0, 4);
}