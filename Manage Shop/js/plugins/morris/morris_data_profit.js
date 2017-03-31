
$(function() {

    Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            month: 'Month 1',
            capital: 105000000,
            revenue: 148000000,
            profit: 53060000
        }, {
            month: 'Month 2',
            capital: 115000000,
            revenue: 168000000,
            profit: 71370000
        }, {
            month: 'Month 3',
            capital: 109100000,
            revenue: 178000000,
            profit: 61750000
        }, {
            month: 'Month 4',
            capital: 0,
            revenue: 0,
            profit: 0
        }, {
            month: 'Month 5',
            capital: 0,
            revenue: 0,
            profit: 0
        }, {
            month: 'Month 6',
            capital: 0,
            revenue: 0,
            profit: 0
        }, {
            month: 'Month 7',
            capital: 0,
            revenue: 0,
            profit: 0
        }, {
            month: 'Month 8',
            capital: 0,
            revenue: 0,
            profit: 0
        }, {
            month: 'Month 9',
            capital: 0,
            revenue: 0,
            profit: 0
         }, {
            month: 'Month 10',
            capital: 0,
            revenue: 0,
            profit: 0
        }, {
            month: 'Month 11',
            capital: 0,
            revenue: 0,
            profit: 0
        }, {
            month: 'Month 12',
            capital: 0,
            revenue: 0,
            profit: 0
        }],
        xkey: 'month',
        ykeys: ['capital','revenue','profit' ],
        labels: ['Capital','Revenue','Profit'],
        barRatio: 0.4,
        xLabelAngle: 35,
        barColors: ['#337ab7', '#5cb85c', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
        hideHover: 'auto',
        resize: true
    });

});
