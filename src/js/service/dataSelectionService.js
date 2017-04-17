/**
 * Created by Mike on 12-Apr-17.
 */

const SELECTED_COHORT_MAP = new Map();
function updateDataSelectionView(cohortNode) {
    let cssText = null;
    if (SELECTED_COHORT_MAP.has(cohortNode)) {
        removeCohortColumn(SELECTED_COHORT_MAP.get(cohortNode));
        removeCohortFromSelection(cohortNode);
    } else {
        let baseGroupId = cohortNode.nodeConfig.baseGroupId;
        let columnId = getColumnId(baseGroupId);
        addCohortToSelection(cohortNode, columnId);

        let columnColor = getColumnColor(columnId);
        addCohortColumn(baseGroupId, columnId, columnColor);
        addCohortColumnItems(columnId, cohortNode.cohort.dataset);
        highlightCohortColumnItems(columnId);
        cssText = `fill: ${columnColor}`;
    }

    notifyDataAnalysingViewOnChange();
    markElement(cohortNode.nodeConfig.id, cssText);
}

function addCohortToSelection(cohortNode, columnId) {
    SELECTED_COHORT_MAP.set(cohortNode, columnId);
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

    changeLayoutVisibility(1.0);
}

function removeCohortFromSelection(cohortNode) {
    SELECTED_COHORT_MAP.delete(cohortNode);
    if (SELECTED_COHORT_MAP.size === 0) {
        hideGrid();
        clearSelectedPropertySet();
    }
}

function hideGrid() {
    removePropertyColumn();
    changeLayoutVisibility(null);
}

function addCohortColumn(baseGroupId, columnId, columnColor) {
    let columnName = baseGroupId.replace(/base/i, '').replace(/-/i, ' ');
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
 * property row selection changes
 */

const SELECTED_PROPERTY_SET = new Set();
let selectedProperty = null;
function updateSelectedPropertySet(property) {
    if (SELECTED_PROPERTY_SET.has(property)) {
        SELECTED_PROPERTY_SET.delete(property);
        selectedProperty = null;
    } else {
        SELECTED_PROPERTY_SET.add(property);
        selectedProperty = property;
    }

    notifyDataAnalysingViewOnChange();
}

function clearSelectedPropertySet() {
    SELECTED_PROPERTY_SET.clear();
    selectedProperty = null;
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
    updateDataAnalysingView(SELECTED_COHORT_MAP, selectedProperty);
}

/**
 * util functions
 */

function getColumnId(baseGroupId) {
    let count = 0;
    for (let id of SELECTED_COHORT_MAP.values()) {
        if (id.includes(baseGroupId)) {
            count++;
        }
    }

    if (count > 0) {
        return `${baseGroupId}_${count}`;
    }

    return baseGroupId;
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