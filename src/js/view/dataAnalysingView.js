/**
 * Created by Mike on 16-Apr-17.
 */

google.charts.load('current', {'packages': ['corechart']});

let boxPlotChart = null;
let scatterPlotChart = null;

window.onload = () => {
    boxPlotChart = new google.visualization.LineChart(document.getElementById('chart'));
    scatterPlotChart = new google.visualization.ScatterChart(document.getElementById('chart'));
};

function showAnalysingView() {
    clearCharts();
    if (document.getElementById("boxPlotBtn").disabled === true) {
        showBoxPlotChart();
    } else {
        showScatterPlotChart();
    }

    document.getElementById("dataAnalysingView").style.display = "block";
}

function hideAnalysingView() {
    clearCharts();
    document.getElementById("dataAnalysingView").removeAttribute("style");
}

function showBoxPlotChart() {
    document.getElementById("boxPlotBtn").disabled = true;
    document.getElementById("scatterPlotBtn").disabled = false;
    clearCharts();

    getBoxPlotChartData();
}

function showScatterPlotChart() {
    document.getElementById("scatterPlotBtn").disabled = true;
    document.getElementById("boxPlotBtn").disabled = false;
    clearCharts();

    try {
        getScatterPlotChartData();
    } catch (e) {
        if (e instanceof ChartDataError) {
            document.getElementById("chartMessage").innerHTML = e.message;
        }
    }
}

function clearCharts() {
    boxPlotChart.clearChart();
    scatterPlotChart.clearChart();
    document.getElementById("chartMessage").innerHTML = "";
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