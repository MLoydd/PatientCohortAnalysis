/**
 * Created by Mike on 17-Apr-17.
 */

function updateDataAnalysingView(selectedCohortMap, property) {
    if (selectedCohortMap.size === 0 || !property) {
        clearBoxPlot();
        return;
    }

    let maxSize = 0;
    let dataArray = [];
    for (let c of selectedCohortMap.keys()) {
        let array = [c.nodeConfig.baseGroupId.replace(/base/i, '').replace(/-/i, ' ')];

        let dataset = c.cohort.dataset;
        for (let p of dataset) {
            let v = p.data.get(property);
            array.push(parseInt(v));
        }

        if (array.length > maxSize) {
            maxSize = array.length;
        }

        dataArray.push(array);
    }

    drawBoxPlot(dataArray, maxSize);
}
