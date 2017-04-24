/**
 * Created by Mike on 17-Apr-17.
 */

let COHORT_MAP = new Map();
let PROPERTY_SET = new Set();

function updateDataAnalysingView(cohortNodeMap, propertySet) {
    if (cohortNodeMap.size === 0 || propertySet.size === 0) {
        hideAnalysingView();
        return;
    }

    COHORT_MAP = new Map(cohortNodeMap.entries());
    PROPERTY_SET = new Set(propertySet.values());

    showAnalysingView();
}

function getBoxPlotChartData() {
    let dataArray = null;
    let title = null;
    if (PROPERTY_SET.size === 1) {
        let property = PROPERTY_SET.values().next().value;
        dataArray = composeDataArraysByCohorts(COHORT_MAP, property);
        title = `Property : ${property}`;
    }

    if (PROPERTY_SET.size > 1) {
        dataArray = composeDataArraysByProperties(COHORT_MAP, PROPERTY_SET);
        title = `Multiple Cohorts`;
    }
    drawBoxPlotChart(dataArray, title);
}

function getScatterPlotChartData() {
    if (PROPERTY_SET.size !== 2) {
        throw new ChartDataError("Scatter Plot Chart can only be shown when two variables are selected!");
    }

    let properties = PROPERTY_SET.values();
    let propertyX = properties.next().value;
    let propertyY = properties.next().value;
    let dataArray = composeDataArraysForScatterPlot(COHORT_MAP, propertyX, propertyY);
    drawScatterPlotChart(dataArray, propertyX, propertyY);
}

/**
 * box plot chart functions
 */
function composeDataArraysByProperties(cohortNodeMap, propertySet) {
    const array = [];
    for (let p of propertySet) {
        let arr = [p];
        for (let c of cohortNodeMap.keys()) {
            let a = composeDataArrayWithOneProperty(c.dataset, p);
            Array.prototype.push.apply(arr, a);
        }
        array.push(arr);
    }

    const dataArray = [];
    for (let a of array) {
        let row = composeBoxPlotRowArray(a);
        dataArray.push(row);
    }

    return dataArray;
}

function composeDataArraysByCohorts(cohortNodeMap, property) {
    const array = [];
    for (let c of cohortNodeMap.keys()) {
        let a = composeDataArrayWithOneProperty(c.dataset, property);
        a.unshift(getCohortGroupName(c.groupId));
        array.push(a);
    }

    const dataArray = [];
    for (let a of array) {
        let row = composeBoxPlotRowArray(a);
        dataArray.push(row);
    }

    return dataArray;
}

// Takes an array of input data and
// returns an array of the input data with the box plot interval data appended to one row.
function composeBoxPlotRowArray(dataArray) {
    let domain = dataArray.shift();
    let arr = dataArray.sort(function (a, b) {
        return a - b;
    });

    let max = arr[arr.length - 1];
    let min = arr[0];
    let median = getMedian(arr);

    let arrMedian = Math.round(arr.length / 2);
    // First Quartile is the median from lowest to overall median.
    let firstQuartile = getMedian(arr.slice(0, arrMedian));

    // Third Quartile is the median from the overall median to the highest.
    let thirdQuartile = getMedian(arr.slice(arrMedian));

    return [domain, max, min, firstQuartile, median, thirdQuartile, max, min, firstQuartile, median, thirdQuartile];
}

/**
 * scatter plot chart functions
 */
function composeDataArraysForScatterPlot(cohortNodeMap, propertyX, propertyY) {
    const dataArray = [];
    for (let c of cohortNodeMap.keys()) {
        let a = composeDataArrayWithTwoProperty(c.dataset, propertyX, propertyY);
        Array.prototype.push.apply(dataArray, a);
    }

    return dataArray;
}

/**
 * util functions
 */
function composeDataArrayWithOneProperty(dataset, property) {
    const dataArray = [];
    for (let p of dataset) {
        let v = p.data.get(property);
        dataArray.push(v);
    }
    return dataArray;
}

function composeDataArrayWithTwoProperty(dataset, propertyX, propertyY) {
    const dataArray = [];
    for (let p of dataset) {
        let x = p.data.get(propertyX);
        let y = p.data.get(propertyY);
        dataArray.push([x, y]);
    }
    return dataArray;
}

// Takes an ascending sorted array and returns the median value.
function getMedian(array) {
    let length = array.length;

    /* If the array is an even length the median is the average of the two middle-most values.
     * Otherwise the median is the middle-most value.
     */
    if (length % 2 === 0) {
        let midUpper = length / 2;
        let midLower = midUpper - 1;

        return (array[midUpper] + array[midLower]) / 2;
    }

    return array[Math.floor(length / 2)];
}