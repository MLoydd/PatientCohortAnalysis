/**
 * Created by Mike on 16-Apr-17.
 */

google.charts.load('current', {'packages': ['corechart']});

const OPTIONS = {
    title: 'Box Plot',
    height: 500,
    legend: {position: 'none'},
    hAxis: {gridlines: {color: '#fff'}},
    lineWidth: 0,
    series: [{'color': '#D3362D'}],
    intervals: {barWidth: 1, boxWidth: 1, lineWidth: 2, style: 'boxes'},
    interval: {max: {style: 'bars', fillOpacity: 1, color: '#777'}, min: {style: 'bars', fillOpacity: 1, color: '#777'}}
};

let chart = null;

function clearBoxPlot() {
    if (!chart) {
        return;
    }
    //const chart = new google.visualization.LineChart(document.getElementById('dataAnalysingView'));
    chart.clearChart();
}

function drawBoxPlot(dataArray, maxSize) {

    const data = new google.visualization.DataTable();
    data.addColumn('string', 'x');
    for (let i = 1; i < maxSize; i++) {
        data.addColumn('number', `series${i}`);
    }

    data.addColumn({id: 'max', type: 'number', role: 'interval'});
    data.addColumn({id: 'min', type: 'number', role: 'interval'});
    data.addColumn({id: 'firstQuartile', type: 'number', role: 'interval'});
    data.addColumn({id: 'median', type: 'number', role: 'interval'});
    data.addColumn({id: 'thirdQuartile', type: 'number', role: 'interval'});

    data.addRows(getBoxPlotValues(dataArray, maxSize, maxSize + 1, maxSize + 2, maxSize + 3, maxSize + 4));

    chart = new google.visualization.LineChart(document.getElementById('dataAnalysingView'));
    chart.draw(data, OPTIONS);
}

/**
 * Takes an array of input data and returns an array of the input data with the box plot
 * interval data appended to each row.
 */
function getBoxPlotValues(array, indexMax, indexMin, indexFirstQuartile, indexMedian, indexThirdQuartile) {

    for (let d of array) {
        let arr = d.slice(1).sort(function (a, b) {
            return a - b;
        });

        let max = arr[arr.length - 1];
        let min = arr[0];
        let median = getMedian(arr);

        // First Quartile is the median from lowest to overall median.
        let firstQuartile = getMedian(arr.slice(0, 4));

        // Third Quartile is the median from the overall median to the highest.
        let thirdQuartile = getMedian(arr.slice(3));

        d[indexMax] = max;
        d[indexMin] = min;
        d[indexFirstQuartile] = firstQuartile;
        d[indexMedian] = median;
        d[indexThirdQuartile] = thirdQuartile;
    }

    return array;
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