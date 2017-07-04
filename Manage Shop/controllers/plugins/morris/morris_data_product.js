
$(function() {

    Morris.Bar({
        element: 'morris-bar-chart-profit',
        data: [{
            product: 'Iphone 1',
            profit: 1306
        }, {
            product: 'Iphone 2',
            profit: 1137
        }, {
            product: 'Iphone 3',
            profit: 2175
        }, {
            product: 'Iphone 4',
            profit: 3800
        }, {
            product: 'Iphone 5',
            profit: 655
        }, {
            product: 'Iphone 6',
            profit: 1137
        }, {
            product: 'Iphone 7',
            profit: 2175
        }, {
            product: 'Iphone 8',
            profit: 3800
        }, {
            product: 'Iphone 9',
            profit: 655
        }],
        xkey: 'product',
        ykeys: ['profit'],
        labels: ['Profit'],
        barRatio: 0.4,
        xLabelAngle: 35,
        hideHover: 'auto',
        barColors: ['#5cb85c', '#5cb85c', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
        resize: true
    });

    Morris.Bar({
        element: 'morris-bar-chart-revenue',
        data: [{
            product: 'Iphone 1',
            revenue: 1306
        }, {
            product: 'Iphone 2',
            revenue: 1137
        }, {
            product: 'Iphone 3',
            revenue: 2175
        }, {
            product: 'Iphone 4',
            revenue: 3800
        }, {
            product: 'Iphone 5',
            revenue: 655
        }, {
            product: 'Iphone 6',
            revenue: 1137
        }, {
            product: 'Iphone 7',
            revenue: 2175
        }, {
            product: 'Iphone 8',
            revenue: 3800
        }, {
            product: 'Iphone 9',
            revenue: 655
        }],
        xkey: 'product',
        ykeys: ['revenue'],
        labels: ['Revenue'],
        barRatio: 0.4,
        xLabelAngle: 35,
        hideHover: 'auto',
        barColors: ['#5cb85c', '#5cb85c', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
        resize: true
    });

    Morris.Bar({
        element: 'morris-barr-chart-number',
        data: [{
            product: 'Iphone 1',
            number: 25
        }, {
            product: 'Iphone 2',
            number: 11
        }, {
            product: 'Iphone 3',
            number: 21
        }, {
            product: 'Iphone 4',
            number: 24
        }, {
            product: 'Iphone 5',
            number: 47
        }, {
            product: 'Iphone 6',
            number: 11
        }, {
            product: 'Iphone 7',
            number: 21
        }, {
            product: 'Iphone 8',
            number: 38
        }, {
            product: 'Iphone 9',
            number: 45
        }],
        xkey: 'product',
        ykeys: ['number'],
        labels: ['Number'],
        barRatio: 0.4,
        xLabelAngle: 35,
        hideHover: 'auto',
        barColors: ['#5cb85c', '#5cb85c', '#d9534f', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
        resize: true
    });

    
        
    // Line Chart
   
});
