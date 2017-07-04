
$(function() {

    Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            branch: 'Chi nhánh 1',
            capital: 105000000,
            revenue: 148000000,
            profit: 53060000
        }, {
            branch: 'Chi nhánh 2',
            capital: 115000000,
            revenue: 168000000,
            profit: 71370000
        }, {
            branch: 'Chi nhánh 3',
            capital: 109100000,
            revenue: 178000000,
            profit: 61750000
        }, {
            branch: 'Chi nhánh 4',
            capital: 109100000,
            revenue: 178000000,
            profit: 61750000
        }, {
            branch: 'Chi nhánh 5',
            capital: 109100000,
            revenue: 178000000,
            profit: 61750000
       
        }],
        xkey: 'branch',
        ykeys: ['capital','revenue','profit' ],
        labels: ['Capital','Revenue','Profit'],
        barRatio: 0.4,
        xLabelAngle: 35,
        barColors: ['#337ab7', '#5cb85c', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
        hideHover: 'auto',
        resize: true
    });

});
