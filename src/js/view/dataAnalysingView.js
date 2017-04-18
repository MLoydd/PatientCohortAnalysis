/**
 * Created by Mike on 16-Apr-17.
 */

google.charts.load('current', {'packages': ['corechart']});

let chart = null;
function initChart() {
    if (!chart) {
        chart = new google.visualization.LineChart(document.getElementById('dataAnalysingView'));
    }
}

function clearBoxPlot() {
    if (chart) {
        chart.clearChart();
    }
}

function drawBoxPlot(dataArray, title) {

    const OPTIONS = {
        title: `Box Plot on ${title}`,
        height: 750,
        legend: {position: 'none'},
        hAxis: {gridlines: {color: '#fff'}},
        lineWidth: 0,
        tooltip: {isHtml: true},
        series: [{'color': '#D3362D'}],
        intervals: {barWidth: 1, boxWidth: 1, lineWidth: 2, style: 'boxes'},
        interval: {
            max: {style: 'bars', fillOpacity: 1, color: '#777'},
            min: {style: 'bars', fillOpacity: 1, color: '#777'}
        }
    };

    const data = new google.visualization.DataTable();
    data.addColumn('string', 'domain');
    data.addColumn('number', 'Max Value');
    data.addColumn('number', 'Min Value');
    data.addColumn('number', 'First Quartile');
    data.addColumn('number', 'Median Value');
    data.addColumn('number', 'Third Quartile');
    data.addColumn({id: 'max', type: 'number', role: 'interval'});
    data.addColumn({id: 'min', type: 'number', role: 'interval'});
    data.addColumn({id: 'firstQuartile', type: 'number', role: 'interval'});
    data.addColumn({id: 'median', type: 'number', role: 'interval'});
    data.addColumn({id: 'thirdQuartile', type: 'number', role: 'interval'});

    for (let a of dataArray) {
        let row = composeBoxPlotRowArray(a);
        data.addRow(row);
    }

    chart.draw(data, OPTIONS);
}

/**
 * Takes an array of input data and returns an array of the input data with the box plot
 * interval data appended to one row.
 */
function composeBoxPlotRowArray(dataArray) {

    let domain = dataArray.shift();
    let arr = dataArray.sort(function (a, b) {
        return a - b;
    });

    let max = arr[arr.length - 1];
    let min = arr[0];
    let median = getMedian(arr);

    // First Quartile is the median from lowest to overall median.
    let firstQuartile = getMedian(arr.slice(0, 4));

    // Third Quartile is the median from the overall median to the highest.
    let thirdQuartile = getMedian(arr.slice(3));

    return [domain, max, min, firstQuartile, median, thirdQuartile, max, min, firstQuartile, median, thirdQuartile];
}

/*
 * Takes an array and returns the median value.
 */
function getMedian(array) {
    let length = array.length;

    /* If the array is an even length the median is the average of the two
     * middle-most values. Otherwise the median is the middle-most value.
     */
    if (length % 2 === 0) {
        let midUpper = length / 2;
        let midLower = midUpper - 1;

        return (array[midUpper] + array[midLower]) / 2;
    } else {
        return array[Math.floor(length / 2)];
    }
}