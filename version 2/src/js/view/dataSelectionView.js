/**
 * Created by Mike on 10-Apr-17.
 */

const DATA_SELECTION_GRID = document.getElementById("dataSelectionGrid");

function showSelectionView() {
    document.getElementById("dataSelectionView").style.display = "block";
}
function hideSelectionView() {
    document.getElementById("dataSelectionView").removeAttribute("style");
}

function isDataSelectionViewVisible() {
    return document.getElementById("dataSelectionView").hasAttribute("style");
}

/**
 * basic column functions
 */

function addColumn(columnId) {
    if (isColumnIdExisting(columnId)) {
        console.log(`addColumn - columnId : ${columnId} is already existing!`);
        return;
    }

    let col = document.createElement("div");
    col.setAttribute("id", columnId);
    col.classList.add("col-md-2");
    return DATA_SELECTION_GRID.appendChild(col);
}

function removeColumn(columnId) {
    if (!isColumnIdExisting(columnId)) {
        console.log(`removeColumn - columnId : ${columnId} is not existing!`);
        return;
    }

    let element = getColumn(columnId);
    return DATA_SELECTION_GRID.removeChild(element);
}

function clearColumn(columnId) {
    if (!isColumnIdExisting(columnId)) {
        console.log(`removeColumn - columnId : ${columnId} is not existing!`);
        return;
    }

    d3.select(`#${columnId}`).selectAll(".colItem").remove();
}

function getColumn(columnId) {
    return document.getElementById(columnId);
}

function isColumnIdExisting(columnId) {
    return getColumn(columnId);
}

/**
 * basic column item functions
 */
function addHeadItemToColumn(columnId, content) {
    let item = addItemToColumn(columnId, content);
    item.classList.add("column-head");
    return item;
}

function addItemToColumn(columnId, content) {
    let item = document.createElement("div");
    item.classList.add("row", "align-items-center");

    if (typeof content === "string") {
        item.innerHTML = content;
    } else {
        item.appendChild(content);
    }

    return getColumn(columnId).appendChild(item);
}

/**
 * property column functions
 */
function addPropertyColumn() {
    addColumn("col_properties");
    addHeadItemToColumn("col_properties", "Properties");
}

function addPropertyItem(property) {
    let item = addItemToColumn("col_properties", property);
    item.setAttribute("id", `properties+${property}`);
    item.onclick = event => onPropertyItemClick(property);
}

function onPropertyItemClick(property) {
    if (isPropertySelected(property)) {
        unhighlightPropertyRow(property);
        removePropertyFromPropertySet(property);
        return;
    }

    highlightPropertyRow(property);
    addPropertyToPropertySet(property);
}

/**
 * cohort column functions
 */
function drawCohortColumn(columnId, columnName, columnColor) {
    let column = addColumn(columnId);
    let item = addHeadItemToColumn(columnId, columnName);
    item.classList.add("justify-content-center");
    item.style.cssText = `background-color: ${columnColor}; border-left: 0.5px solid #ffffff;`;
    return column;
}

function removeCohortColumn(columnId) {
    return removeColumn(columnId);
}

function drawCohortColumnItem(columnId, itemId, width) {
    let rect = createDataAvailabilityBar(150, 25, width, 25);

    let item = addItemToColumn(columnId, rect);
    item.classList.add("justify-content-center", "colItem");
    item.setAttribute("id", itemId);
    return item;
}

function updateCohortColumn(columnId, itemId, width) {
    let rect = createDataAvailabilityBar(150, 25, width, 25);

    clearColumn(columnId);
}

/**
 * create availability bar
 */
function createDataAvailabilityBar(baseWidth, baseHeight, width, height) {
    let ns = "http://www.w3.org/2000/svg";

    let svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", `${baseWidth}`);
    svg.setAttribute("height", `${baseHeight}`);
    svg.style.cssText = "background: #afafaf";

    let rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("width", `${width}`);
    rect.setAttribute("height", `${height}`);
    rect.setAttribute("fill", "#11a1f1");
    svg.appendChild(rect);

    return svg;
}

/**
 * util functions
 */
function highlightColumnItems(columnId, property) {
    let container = getColumn(columnId);
    highlightPropertyRow(property, container);
}

function highlightPropertyRow(property, container = DATA_SELECTION_GRID) {
    let cssText = "background-color: #ffffbf;";
    updatePropertyRowOnSelectionChange(container, property, cssText);
}

function unhighlightPropertyRow(property, container = DATA_SELECTION_GRID) {
    updatePropertyRowOnSelectionChange(container, property, null);
}

function updatePropertyRowOnSelectionChange(container, property, cssText) {
    let divs = container.getElementsByTagName("div");
    for (let d of divs) {
        let split = d.id.split("+");
        if (split.length > 1) {
            if (split[1] === property) {
                d.style.cssText = cssText;
            }
        }
    }
}