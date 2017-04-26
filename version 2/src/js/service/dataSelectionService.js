/**
 * Created by Mike on 12-Apr-17.
 */

const SELECTED_COHORT_MAP = new Map();
function addCohortNodeToDataSelection(cohort, nodeColor) {
    let columnId = addCohortToSelectionGrid(cohort, nodeColor);
    updatePropertySelectionOnAddedColumn(columnId);
    return true;
}

function isBaseCohortAlreadySelected(cohort) {
    for (let c of SELECTED_COHORT_MAP.values) {
        if (c.property.toLowerCase() === cohort.property.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function updateDataSelectionView(cohort, columnColor) {
    for (let c of SELECTED_COHORT_MAP.keys()) {
        let columnId = getColumnId(cohort.groupId);
        if (c === columnId) {
            clearColumn(c);
            SELECTED_COHORT_MAP.set(columnId, cohort);
            addCohortColumnItems(c, cohort.dataset);
            notifyDataAnalysingViewOnChange();
            updatePropertySelectionOnAddedColumn();
            return;
        }
    }

    addCohortNodeToDataSelection(cohort, columnColor);
}

/**
 * add cohort to selection view functions
 */
function addCohortToSelectionGrid(cohort, nodeColor) {
    let columnId = addCohortToDataSelection(cohort);

    addCohortColumn(cohort.groupId, columnId, nodeColor);
    addCohortColumnItems(columnId, cohort.dataset);

    notifyDataAnalysingViewOnChange();

    return columnId;
}

function addCohortToDataSelection(cohort) {
    let columnId = getColumnId(cohort.groupId);
    SELECTED_COHORT_MAP.set(columnId, cohort);
    if (SELECTED_COHORT_MAP.size === 1) {
        showGrid();
    }

    return columnId;
}

function showGrid() {
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
    let columnId = getColumnId(cohort.groupId);
    removeCohortColumn(columnId);
    SELECTED_COHORT_MAP.delete(columnId);
    notifyDataAnalysingViewOnChange();

    return columnId;
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
function isCohortNodeSelected(cohort) {
    return SELECTED_COHORT_MAP.has(getColumnId(cohort.groupId));
}

function getColumnId(cohortGroupId) {
    return `col_${cohortGroupId}`;
}

/**
 * notification to DataAnalysingService
 */

function notifyDataAnalysingViewOnChange() {
    updateDataAnalysingView(SELECTED_COHORT_MAP, SELECTED_PROPERTY_SET);
}