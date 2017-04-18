/**
 * Created by Mike on 17-Apr-17.
 */

function updateDataAnalysingView(cohortCollection, propertyCollection) {
    if (cohortCollection.size === 0 || propertyCollection.size === 0) {
        clearBoxPlot();
        return;
    }

    initChart();

    let dataArray = null;
    let title = "";
    if (propertyCollection.size === 1) {
        let property = propertyCollection.values().next().value;
        dataArray = composeDataArraysByCohorts(cohortCollection, property);
        title = `Property : ${property}`;
    } else {
        dataArray = composeDataArraysByProperties(cohortCollection, propertyCollection);
        title = `Multiple Cohorts`;
    }
    drawBoxPlot(dataArray, title);
}

function composeDataArraysByProperties(cohortCollection, propertyCollection) {
    let dataArray = [];
    for (let p of propertyCollection) {
        let array = [p];
        for (let c of cohortCollection.keys()) {
            let a = composeDataArray(c.cohort.dataset, p);
            Array.prototype.push.apply(array, a);
        }
        dataArray.push(array);
    }

    return dataArray;
}

function composeDataArraysByCohorts(cohortCollection, property) {
    let dataArray = [];
    for (let c of cohortCollection.keys()) {
        let array = composeDataArray(c.cohort.dataset, property);
        array.unshift(c.nodeConfig.baseGroupId.replace(/base/i, '').replace(/-/i, ' '));
        dataArray.push(array);
    }

    return dataArray;
}

function composeDataArray(dataset, property) {
    let dataArray = [];
    for (let p of dataset) {
        let v = p.data.get(property);
        dataArray.push(Number(v));
    }
    return dataArray;
}
