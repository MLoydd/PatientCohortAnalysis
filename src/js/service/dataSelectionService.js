/**
 * Created by Mike on 12-Apr-17.
 */

const SELECTED_COHORT_MAP = new Map();
function addCohortNodeToDataSelection(cohort, nodeColor) {
    let columnId = addCohortToSelectionGrid(cohort, nodeColor);
    updatePropertySelectionOnAddedColumn(columnId);
}

/**
 * add cohort to selection view functions
 */
function addCohortToSelectionGrid(cohort, nodeColor) {
    let cohortGroupId = cohort.groupId;
    let columnId = addCohortToDataSelection(cohort);

    addCohortColumn(cohortGroupId, columnId, nodeColor);
    addCohortColumnItems(columnId, cohort.dataset);

    notifyDataAnalysingViewOnChange();

    return columnId;
}

function addCohortToDataSelection(cohort) {
    let columnId = getColumnId(cohort.groupId);
    SELECTED_COHORT_MAP.set(cohort, columnId);
    if (SELECTED_COHORT_MAP.size === 1) {
        showGrid();
    }

    return columnId;
}

function showGrid() {
    addPropertyColumn();

    let properties = getAnalysableProperties();
    for (let p of properties) {
        addPropertyItem(p);
    }

    showSelectionView();
}

function addCohortColumn(cohortGroupId, columnId, columnColor) {
    let columnName = getCohortGroupName(cohortGroupId);
    return drawCohortColumn(columnId, columnName, columnColor);
}

function addCohortColumnItems(columnId, dataset) {
    let map = calculateAvailabilityOfEachProperty(dataset);
    for (let [k, v] of map) {
        let width = 150 * v / dataset.size;
        drawCohortColumnItem(columnId, `${columnId}+${k}`, width);
    }
}

function calculateAvailabilityOfEachProperty(dataset) {
    let properties = getAnalysableProperties();
    let map = new Map();
    for (let p of dataset) {
        for (let [k, v] of p.data) {
            if (!properties.has(k)) {
                continue;
            }

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
function removeCohortFromDataSelection(cohort) {
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
        hideSelectionView();
    }
}

/**
 * property selection changes
 */
const SELECTED_PROPERTY_SET = new Set();
function addPropertyToPropertySet(property) {
    SELECTED_PROPERTY_SET.add(property);
    notifyDataAnalysingViewOnChange();
}

function removePropertyFromPropertySet(property) {
    SELECTED_PROPERTY_SET.delete(property);
    notifyDataAnalysingViewOnChange();
}

function isPropertySelected(property) {
    return SELECTED_PROPERTY_SET.has(property);
}

function updatePropertySelectionOnAddedColumn(columnId) {
    if (SELECTED_PROPERTY_SET.size === 0) {
        return;
    }

    for (let p of SELECTED_PROPERTY_SET) {
        highlightColumnItems(columnId, p);
    }
}

/**
 * util functions
 */
function getSelectedCohortNodeCountByCohortGroupId(cohortGroupId) {
    let count = 0;
    for (let c of SELECTED_COHORT_MAP.keys()) {
        if (c.groupId === cohortGroupId) {
            count++;
        }
    }
    return count;
}

function isCohortNodeSelected(cohort) {
    return SELECTED_COHORT_MAP.has(cohort);
}

function getColumnId(cohortGroupId) {
    let c = getSelectedCohortNodeCountByCohortGroupId(cohortGroupId);
    return `${cohortGroupId}_${c}`;
}

/**
 * notification to DataAnalysingService
 */

function notifyDataAnalysingViewOnChange() {
    updateDataAnalysingView(SELECTED_COHORT_MAP, SELECTED_PROPERTY_SET);
}