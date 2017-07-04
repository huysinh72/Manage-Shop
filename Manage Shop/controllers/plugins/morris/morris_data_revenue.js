
$(function() {

    Morris.Bar({
        element: 'morris-bar-chart-branch',
        data: [{
            branch: 'Chi Nhanh 1',
            revenue: 1306
        }, {
            branch: 'Chi Nhanh 2',
            revenue: 1137
        }, {
            branch: 'Chi Nhanh 3',
            revenue: 2175
        }, {
            branch: 'Chi Nhanh 4',
            revenue: 3800
        }, {
            branch: 'Chi Nhanh 5',
            revenue: 655
        }],
        xkey: 'branch',
        ykeys: ['revenue'],
        labels: ['Revenue'],
        barRatio: 0.4,
        xLabelAngle: 35,
        hideHover: 'auto',
        barColors: ['#5cb85c', 'green', 'red', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
        resize: true
    });

    Morris.Bar({
        element: 'morris-bar-chart-product',
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
        barColors: ['#5cb85c', 'green', 'red', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
        resize: true
    });

    Morris.Line({
        // ID of the element in which to draw the chart.
        element: 'morris-line-chart-revenue',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: [{
            d: '2012-10-01',
            revenue: 802
        }, {
            d: '2012-10-02',
            revenue: 1083
        }, {
            d: '2012-10-03',
            revenue: 820
        }, {
            d: '2012-10-04',
            revenue: 839
        }, {
            d: '2012-10-05',
            revenue: 1292
        }, {
            d: '2012-10-06',
            revenue: 859
        }, {
            d: '2012-10-07',
            revenue: 790
        }, {
            d: '2012-10-08',
            revenue: 1680
        }, {
            d: '2012-10-09',
            revenue: 1592
        }, {
            d: '2012-10-10',
            revenue: 1420
        }, ],
        // The name of the data record attribute that contains x-visitss.
        xkey: 'd',
        // A list of names of data record attributes that contain y-visitss.
        ykeys: ['revenue'],
        // Labels for the ykeys -- will be displayed when you hover over the
        // chart.
        labels: ['Revenue'],
        // Disables line smoothing
        smooth: false,
        lineWidth: 5,
        lineColors: ['#5cb85c', 'green', 'red', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
        pointFillColors: ['#337ab7'],
        pointSize: 7,
        resize: true
    });
    
    // Line Chart
   
});
