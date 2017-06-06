var shopId = getCookie("shopId");
if(shopId == null)
	window.location.href='login.html?preUrl='+window.location.href;
document.getElementById("user").innerHTML = "<i class=\"fa fa-user\"></i> "+ getCookie("username") +"<b class=\"caret\"></b>";
var Shop = "Shop";
var database = firebase.database();
var storage = firebase.storage(); 

var list_invoice = [];

var states = ['Paid', 'Canceled'];
var paymentType = ['Cash', 'Payoo'];

$( "#datepickerStart").datepicker();
$( "#datepickerEnd").datepicker();

var list_importBill = [];
$('#table_invoice').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [3,4,5]},
    ],
    "order": [[ 1, "desc" ]]
});

$('#table_invoiceDetail').DataTable({
    "columnDefs": [
      { className: "text-right", "targets": [3,4,5,6] },

    ]
});

var table_invoice = $('#table_invoice').DataTable();
var table_invoiceDetail = $('#table_invoiceDetail').DataTable();
var count = 1;
var index = 0;

var currentDate = getCurrentDate();


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


function loadAllInvoice(startDate, endDate)
{
	startDate = startDate+' 00:00:00';
    endDate = endDate + ' 24:00:00';
	count = 1;
	index = 0;
	table_invoice.clear().draw();
	list_invoice = [];
	firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startDate).endAt(endDate).on('child_added', snapshot => {
		
		var invoice  = snapshot.val();
		list_invoice.push(invoice);
		table_invoice.row.add([addHyperlink(invoice.sequenceNo), invoice.time, invoice.customerName, accounting.formatNumber(invoice.salePriceTotal), paymentType[invoice.paymentMethod], invoice.branchName, invoice.employeeName, states[invoice.state-1]]).draw();
		
	});
}

function loadInvoiceFollowBranch(startDate, endDate, selectedBranch)
{

	startDate = startDate+' 00:00:00';
    endDate = endDate + ' 24:00:00';
	count = 1;
	index = 0;
	table_invoice.clear().draw();
	list_invoice = [];

	firebase.database().ref().child(Shop).child(shopId).child("invoice").orderByChild("time").startAt(startDate).endAt(endDate).on('child_added', snapshot => {
		var invoice  = snapshot.val();
		if(invoice.branchId == selectedBranch.id)
		{
			list_invoice.push(invoice);
			table_invoice.row.add([addHyperlink(invoice.sequenceNo), invoice.time, invoice.customerName, accounting.formatNumber(invoice.salePriceTotal),paymentType[invoice.paymentMethod], invoice.branchName, invoice.employeeName, states[invoice.state-1]]).draw();
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
            loadAllInvoice(formatDateMMDDYYtoYYMMDD(startDate), formatDateMMDDYYtoYYMMDD(endDate));
        else
            loadInvoiceFollowBranch(formatDateMMDDYYtoYYMMDD(startDate), formatDateMMDDYYtoYYMMDD(endDate), app.selectedBranch);
    }
}

loadAllInvoice(currentDate, currentDate);

var dialogEdit = new Vue({
	el: '#invoiceInfo',
	data: {
		Invoice: {}
	},
	methods: {
		loadData :function (invoice){
			this.Invoice = invoice;
			this.Invoice.salePriceTotal =  accounting.formatNumber(this.Invoice.salePriceTotal);
			stt = 1;
			table_invoiceDetail.clear().draw();

			for(i = 1; i < invoice.product.length; i++)
			{
				invoiceDetail = invoice.product[i];
				table_invoiceDetail.row.add([stt++, invoiceDetail.barcode, invoiceDetail.name, invoiceDetail.quantity1+invoiceDetail.quantity2, accounting.formatNumber(invoiceDetail.salePrice), invoiceDetail.discount + '%', accounting.formatNumber(invoiceDetail.reducePrice)]).draw();
			}
		}
	}
})


$('#table_invoice tbody').on( 'click', 'tr', function (e) {
	index = table_invoice.row(this)[0][0];
	
	dialogEdit.loadData(list_invoice[index]);

	$('#dialog').modal('show');
		
	//$('#wrapper').append('<div id="over"></div>');
    //$('#over').fadeIn(300);

	//dialog.dialog("open");

});

document.getElementById("datepickerStart").value = formatDateYYMMDDtoMMDDYY(currentDate);
document.getElementById("datepickerEnd").value = formatDateYYMMDDtoMMDDYY(currentDate);
