/**
 * Created by Mike on 10-Apr-17.
 */

const DATA_SELECTION_GRID = document.getElementById("dataSelectionGrid");

function changeLayoutVisibility(opacity = 1.0) {
    document.getElementById("dataSelectionView").style.opacity = opacity;
}

/**
 * basic functions
 */

function addColumn(columnId) {
    if (getColumn(columnId)) {
        console.log(`columnId : ${columnId} is already existing!`);
        return;
    }

    let col = document.createElement("div");
    col.setAttribute("id", `col_${columnId}`);
    col.classList.add("col-md-2");
    return DATA_SELECTION_GRID.appendChild(col);
}

function getColumn(columnId) {
    return document.getElementById(`col_${columnId}`);
}

function removeColumn(columnId) {
    let element = getColumn(columnId);
    return DATA_SELECTION_GRID.removeChild(element);
}

function addHeadItemToColumn(columnId, content) {
    let item = addItemToColumn(columnId, content);
    item.classList.add("column-head");
    return item;
}

function addItemToColumn(columnId, content) {
    let column = getColumn(columnId);
    let item = document.createElement("div");
    item.classList.add("row", "align-items-center");

    if (typeof content === "string") {
        item.innerHTML = content;
    } else {
        item.appendChild(content);
    }

    return column.appendChild(item);
}

/**
 * property column functions
 */

function addPropertyColumn() {
    addColumn("properties");
    addHeadItemToColumn("properties", "Properties");
}

function removePropertyColumn() {
    return removeColumn("properties");
}

function addPropertyItem(property) {
    let item = addItemToColumn("properties", property);
    item.onclick = function (event) {
        let cssText = null;
        if (!item.style.cssText) {
            cssText = "border-top: 3px solid #ff8c00; border-bottom: 3px solid #ff8c00;"
        }
        item.style.cssText = cssText;

        highlightSelectedPropertyRow(property, cssText);
        updateSelectedPropertySet(property);
    };
    return item;
}

/**
 * cohort column functions
 */

function drawCohortColumn(columnId, columnName, columnColor) {
    let column = addColumn(columnId);
    let item = addHeadItemToColumn(columnId, columnName);
    item.classList.add("justify-content-center");
    item.style.cssText = `color: ${columnColor}`;
    return column;
}

function removeCohortColumn(columnId) {
    return removeColumn(columnId);
}

function drawCohortColumnItem(columnId, itemId, content) {
    let item = addItemToColumn(columnId, content);
    item.classList.add("justify-content-center");
    item.setAttribute("id", itemId);
    return item;
}

/**
 * create availability bar
 */

function createDataAvailabilityBar(baseWidth, baseHeight, width, height) {
    let ns = "http://www.w3.org/2000/svg";

    let svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", `${baseWidth}`);
    svg.setAttribute("height", `${baseHeight}`);
    svg.style.cssText = "background: #d3d3d3";

    let rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("width", `${width}`);
    rect.setAttribute("height", `${height}`);
    rect.setAttribute("fill", "#5cb3fd");
    svg.appendChild(rect);

    return svg;
}

/**
 * event handler
 */

function highlightSelectedPropertyRow(property, cssText, columnId) {
    let container = DATA_SELECTION_GRID;
    if (columnId) {
        container = getColumn(columnId);
    }

    let divs = container.getElementsByTagName("div");
    for (let d of divs) {
        if (d.id.includes(`+${property}`)) {
            d.style.cssText = cssText;
        }
    }
}