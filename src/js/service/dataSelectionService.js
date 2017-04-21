/**
 * Created by Mike on 12-Apr-17.
 */

const SELECTED_COHORT_MAP = new Map();
function updateDataSelectionView(cohort) {
    if (SELECTED_COHORT_MAP.has(cohort)) {
        columnId = removeCohortFromSelectionView(cohort);
        return null;
    }

    columnId = addCohortToSelectionView(cohort);
    highlightCohortColumnItems(columnId);
    return `fill: ${getColumnColor(columnId)}`;
}

/**
 * add cohort to selection view functions
 */
function addCohortToSelectionView(cohort) {
    let cohortGroupId = cohort.groupId;
    let columnId = getColumnId(cohortGroupId);
    let columnColor = getColumnColor(columnId);

    addCohortToSelectedCohortMap(cohort, columnId);
    addCohortColumn(cohortGroupId, columnId, columnColor);
    addCohortColumnItems(columnId, cohort.dataset);

    notifyDataAnalysingViewOnChange();

    return columnId;
}

function addCohortToSelectedCohortMap(cohort, columnId) {
    SELECTED_COHORT_MAP.set(cohort, columnId);
    if (SELECTED_COHORT_MAP.size === 1) {
        showGrid();
    }
}

function showGrid() {
    addPropertyColumn();

    let properties = getProperties();
    for (let p of properties) {
        addPropertyItem(p);
    }

    changeDataSelectionViewVisibility(1.0);
}

function addCohortColumn(cohortGroupId, columnId, columnColor) {
    let columnName = cohortGroupId.replace(/cohort/i, '').replace(/-/i, ' ');
    return drawCohortColumn(columnId, columnName, columnColor);
}

function addCohortColumnItems(columnId, dataset) {
    let map = calculateAvailabilityOfEachProperty(dataset);
    for (let [k, v] of map) {
        let width = 150 * v / dataset.size;
        let rect = createDataAvailabilityBar(150, 25, width, 25);
        drawCohortColumnItem(columnId, `${columnId}+${k}`, rect);
    }
}

function calculateAvailabilityOfEachProperty(dataset) {
    let map = new Map();
    for (let p of dataset) {
        for (let [k, v] of p.data) {
            let c = map.get(k);
            if (!c) {
                c = 0;
            }

            if (v) {
                c++;
            }
            map.set(k, c);
        }
    }

    return map;
}

/**
 * remove cohort from selection view functions
 */
function removeCohortFromSelectionView(cohort) {
    let columnId = SELECTED_COHORT_MAP.get(cohort);
    removeCohortColumn(columnId);
    removeCohortFromSelectedCohortMap(cohort);
    notifyDataAnalysingViewOnChange();

    return columnId;
}

function removeCohortFromSelectedCohortMap(cohort) {
    SELECTED_COHORT_MAP.delete(cohort);
    if (SELECTED_COHORT_MAP.size === 0) {
        SELECTED_PROPERTY_SET.clear();
        hideGrid();
    }
}

function hideGrid() {
    if (isDataSelectionViewVisible()) {
        removePropertyColumn();
        changeDataSelectionViewVisibility(null);
    }
}

/**
 * property row selection changes
 */

const SELECTED_PROPERTY_SET = new Set();
function updateSelectedPropertySet(property) {
    if (SELECTED_PROPERTY_SET.has(property)) {
        SELECTED_PROPERTY_SET.delete(property);
    } else {
        SELECTED_PROPERTY_SET.add(property);
    }

    notifyDataAnalysingViewOnChange();
}

function highlightCohortColumnItems(columnId) {
    if (SELECTED_PROPERTY_SET.size === 0) {
        return;
    }

    let cssText = "border-top: 3px solid #ff8c00; border-bottom: 3px solid #ff8c00;";
    for (let p of SELECTED_PROPERTY_SET) {
        highlightSelectedPropertyRow(p, cssText, columnId);
    }
}


/**
 * notification to DataAnalysingService
 */

function notifyDataAnalysingViewOnChange() {
    updateDataAnalysingView(SELECTED_COHORT_MAP, SELECTED_PROPERTY_SET);
}

/**
 * util functions
 */

function getColumnId(cohortGroupId) {
    let count = 0;
    for (let id of SELECTED_COHORT_MAP.values()) {
        if (id.includes(cohortGroupId)) {
            count++;
        }
    }

    if (count > 0) {
        return `${cohortGroupId}_${count}`;
    }

    return cohortGroupId;
}

function getColumnColor(columnId) {
    if (!columnId) {
        return;
    }

    let split = columnId.split("_");
    if (split.length === 1) {
        return "#22f2f2";
    }

    let num = split[1];
    switch (num) {
        case "1":
            return "#8a6d3b";
        case "2":
            return "#f7ecb5";
        case "3":
            return "#dda0dd";
        case "4":
            return "#ffc0cb";
        default:
            console.log(`Undefined number: ${num}`);
    }
}