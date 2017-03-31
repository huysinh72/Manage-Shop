
$(function() {

    Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            category: 'Iphone',
            revenue: 430613
        }, {
            category: 'Samsung',
            revenue: 313733
        }, {
            category: 'Oppo',
            revenue: 217500
        }, {
            category: 'Xaomi',
            revenue: 380000
        }, {
            category: 'Sony',
            revenue: 655000
        }],
        xkey: 'category',
        ykeys: ['revenue'],
        labels: ['Revenue'],
        barRatio: 0.4,
        xLabelAngle: 35,
        hideHover: 'auto',
        barColors: ['#5cb85c', 'green', 'red', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
        resize: true
    });

   
});
