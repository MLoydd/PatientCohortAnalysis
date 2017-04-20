/**
 * Created by Mike on 16-Apr-17.
 */

google.charts.load('current', {'packages': ['corechart']});

let boxPlotChart = null;
let scatterPlotChart = null;
function initCharts() {
    if (!boxPlotChart) {
        boxPlotChart = new google.visualization.LineChart(document.getElementById('boxPlotChart'));
    }

    if (!scatterPlotChart) {
        scatterPlotChart = new google.visualization.ScatterChart(document.getElementById('scatterPlotChart'));
    }

    let element = document.getElementById("dataAnalysingView");
    element.style.opacity = 1.0;
}

function clearCharts() {
    if (boxPlotChart) {
        boxPlotChart.clearChart();
    }

    if (scatterPlotChart) {
        scatterPlotChart.clearChart();
    }

    let element = document.getElementById("dataAnalysingView");
    element.style.opacity = 0;
}

/**
 * scatter plot chart functions
 */

function drawScatterPlotChart(dataArray, hAxis, vAxis) {

    const options = {
        title: `Comparision : ${hAxis} to ${vAxis}`,
        height: 750,
        hAxis: {title: hAxis},
        vAxis: {title: vAxis},
        tooltip: {isHtml: true},
        legend: 'none'
    };

    const data = new google.visualization.DataTable();
    data.addColumn("number", hAxis);
    data.addColumn("number", vAxis);
    data.addRows(dataArray);

    scatterPlotChart.draw(data, options);
}

/**
 * box plot chart functions
 */

function drawBoxPlotChart(dataArray, title) {

    const options = {
        title: `Box Plot on ${title}`,
        height: 750,
        hAxis: {gridlines: {color: '#fff'}},
        lineWidth: 0,
        legend: 'none',
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
    data.addRows(dataArray);

    boxPlotChart.draw(data, options);
}



