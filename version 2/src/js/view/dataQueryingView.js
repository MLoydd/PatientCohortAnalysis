/**
 * Created by Mike on 05-Apr-17.
 */

const RECT_INTERSPACE = 10;
const BASE_COHORT_NODE = {id: "baseCohortNode", text: "All Patients"};

function addCohortGroupColumn(cohortGroupId) {
    let id = trimAllWhiteSpace(cohortGroupId);
    return d3.select("#dataQueryingGrid").append("div").attr("id", id).attr("class", "col-2");
}

function getCohortGroupColumn(cohortGroupId) {
    let id = trimAllWhiteSpace(cohortGroupId);
    return d3.select(`#${id}`);
}

function addSVGToColumn(cohortGroupId) {
    let col = getCohortGroupColumn(cohortGroupId);
    col.append("svg").attr("id", `svg_${cohortGroupId}`).style("width", "100%").style("height", "100%");
}

function getCohortGroupSVG(cohortGroupId) {
    let id = trimAllWhiteSpace(cohortGroupId);
    return d3.select(`#svg_${id}`);
}

function drawCohortGroup(cohortGroupId) {
    addCohortGroupColumn(cohortGroupId);
    addSVGToColumn(cohortGroupId);
}

function addNodeGroupToCohortGroup(groupName, parentGroupName, cssClass = "node") {
    let id = trimAllWhiteSpace(groupName);
    return getCohortGroupSVG(parentGroupName).append("g").attr("class", cssClass).attr("id", id);
}

function drawBaseNodeGroup(cohortNode) {
    drawCohortGroup(cohortNode.cohort.groupId);
    addNodeGroupToCohortGroup(cohortNode.nodeConfig.nodeGroupId, cohortNode.cohort.groupId);
    drawCohortNodeElements(cohortNode);
}

function drawCohortNodeGroup(cohortNode) {
    addNodeGroupToCohortGroup(cohortNode.nodeConfig.nodeGroupId, cohortNode.cohort.groupId);
    drawLinkPath(cohortNode.nodeConfig.nodeGroupId, cohortNode.nodeConfig.clientRect);
    drawCohortNodeElements(cohortNode);
}

function drawCohortNodeElements(cohortNode) {
    let nodeConfig = cohortNode.nodeConfig;

    drawBaseRectOutline(nodeConfig.nodeGroupId, nodeConfig.clientRect);
    drawRect(nodeConfig.nodeGroupId, nodeConfig.id, nodeConfig.clientRect);
    drawText(nodeConfig.nodeGroupId, nodeConfig.text, nodeConfig.clientRect);

    drawBottomTriangle(nodeConfig.nodeGroupId, nodeConfig.clientRect)
        .on("click", () => onBottomTriangleClickHandler(cohortNode));

    addRightTriangle(cohortNode);

    if (!isBaseCohortNode(nodeConfig.id)) {
        drawCloseIcon(nodeConfig.nodeGroupId, nodeConfig.clientRect).on("click", () => {
            removeCohortNodeAndItsDependencies(cohortNode);
        }).on("mouseover", () => {
            changeStrokeOpacityOfCohortNodeDescendantsCloseIcon(cohortNode, 1.0);
        }).on("mouseout", () => {
            changeStrokeOpacityOfCohortNodeDescendantsCloseIcon(cohortNode, null);
        });
    }

    addCohortNodeToSelection(cohortNode);
}

function isBaseCohortNode(nodeId) {
    return nodeId === BASE_COHORT_NODE.id;
}

function getNodeGroup(groupName) {
    let g = trimAllWhiteSpace(groupName);
    return d3.select(`#${g}`);
}

function drawBaseRectOutline(nodeGroupId, clientRect) {
    return getNodeGroup(nodeGroupId).append("rect").attr("x", clientRect.left).attr("y", clientRect.top)
        .attr("width", RANGE.max).attr("height", clientRect.height).style("fill", "#efefef");
}

function drawRect(nodeGroupId, id, clientRect) {
    return getNodeGroup(nodeGroupId).append("rect").attr("id", id).attr("x", clientRect.left).attr("y", clientRect.top)
        .attr("width", clientRect.width).attr("height", clientRect.height);
}

function drawText(nodeGroupId, text, clientRect) {
    return getNodeGroup(nodeGroupId).append("text").text(text)
        .attr("x", clientRect.left + 10).attr("y", clientRect.top + clientRect.height / 2);
}

function addRightTriangle(cohortNode) {
    drawRightTriangle(cohortNode.nodeConfig.nodeGroupId, cohortNode.nodeConfig.clientRect)
        .on("click", () => onRightTriangleClickHandler(cohortNode));
}

function drawRightTriangle(nodeGroupId, clientRect) {
    let x1 = clientRect.left + RANGE.max;
    let y1 = clientRect.top + clientRect.height;
    let x2 = clientRect.left + RANGE.max;
    let y2 = clientRect.top;
    let x3 = clientRect.left + RANGE.max + 20;
    let y3 = clientRect.top + clientRect.height / 2;

    let p = `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
    return getNodeGroup(nodeGroupId).append("polygon").attr("points", p).attr("class", "rightTriangle");
}

function removeRightTriangle(nodeGroupId) {
    getNodeGroup(nodeGroupId).select(".rightTriangle").remove();
}

function drawBottomTriangle(nodeGroupId, clientRect) {
    let x1 = clientRect.left + RANGE.max / 2 - 30;
    let y1 = clientRect.top + clientRect.height;
    let x2 = clientRect.left + RANGE.max / 2 + 30;
    let y2 = clientRect.top + clientRect.height;
    let x3 = clientRect.left + RANGE.max / 2;
    let y3 = clientRect.top + clientRect.height + 30;

    let p = `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
    return getNodeGroup(nodeGroupId).append("polygon").attr("points", p).attr("class", "bottomTriangle");
}

function removeBottomTriangle(nodeGroupId) {
    getNodeGroup(nodeGroupId).select(".bottomTriangle").remove();
}

function drawCloseIcon(nodeGroupId, clientRect) {
    let d = `M 225,${clientRect.top + 15} L 235,${clientRect.top + 25} M 235,${clientRect.top + 15} L225,${clientRect.top + 25}`;
    return getNodeGroup(nodeGroupId).append("path").attr("d", d).attr("id", `closeIcon_${nodeGroupId}`).attr("class", "close-x");
}

function drawLinkPath(nodeGroupId, clientRect) {
    let d = composePathD(clientRect.left, clientRect.top - RECT_INTERSPACE, clientRect.left, clientRect.top, clientRect.width);
    return getNodeGroup(nodeGroupId).append("path").attr("d", d).attr("class", "nodeLink");
}

function composePathD(parentX, parentY, x, y, w) {
    return `M ${parentX},${parentY}  H ${parentX + w}  L ${x + w},${y}  H ${x}  Z`;
}

/**
 * event handlers
 */
function addCohortNodeToSelection(cohortNode) {
    if (selectedCohortNode) {
        markElement(selectedCohortNode.nodeConfig.id, null);
    }

    let nodeColor = getCohortGroupColor(cohortNode.cohort.groupId);
    updateDataSelectionView(cohortNode.cohort, nodeColor);
    markElement(cohortNode.nodeConfig.id, `fill: ${nodeColor}`);
}

function onRightTriangleClickHandler(cohortNode) {
    if (cohortNode.nodeConfig.id.includes("_baseCohortNode")) {
        copyBaseCohortNode();
    } else {
        copyCohortGroup(cohortNode);
    }
    removeRightTriangle(cohortNode.nodeConfig.nodeGroupId);
}

let selectedCohortNode = null;
function onBottomTriangleClickHandler(cohortNode) {
    selectedCohortNode = cohortNode;
    displayQueryContainer(cohortNode.cohort.groupId, cohortNode.nodeConfig.clientRect);
}

function queryInputFieldKeyDownHandler() {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case "Enter":
            if (event.currentTarget === inputProperty) {
                inputQuery.focus();
                break;
            }
            if (event.currentTarget === inputQuery) {
                applyFilterOnClickHandler();
            }
            break;
        case "Escape":
            resetQueryElements();
            break;
        default:
            return; // Quit when this doesn't handle the key event.
    }

    event.preventDefault(); // Cancel the default action to avoid it being handled twice
}

function applyFilterOnClickHandler() {
    if (!validateQueryInputFields()) {
        return;
    }

    let property = inputProperty.value.trim().toLowerCase();
    let query = inputQuery.value.trim().toLowerCase();
    try {
        queryCohort(selectedCohortNode, property, query);
    } catch (e) {
        if (e instanceof PropertyInputError) {
            alert(e.message);
            inputProperty.style.cssText = "border-color: #ff0000";
        }

        if (e instanceof QueryInputError) {
            alert(e.message);
            inputQuery.style.cssText = "border-color: #ff0000";
        }
        return;
    }
    removeBottomTriangle(selectedCohortNode.nodeConfig.nodeGroupId);
    resetQueryElements();
}

/**
 * util functions
 */
function markElement(elementId, cssText) {
    let element = document.getElementById(elementId);
    if (element) {
        element.style.cssText = cssText;
    }
}

function changeStrokeOpacityOfCohortNodeDescendantsCloseIcon(cohortNode, strokeOpacity) {
    let n = cohortNode.next;
    while (n) {
        document.getElementById(`closeIcon_${n.nodeConfig.nodeGroupId}`).style.strokeOpacity = strokeOpacity;
        n = n.next;
    }
}

function removeCohortNodeFromQueryingView(groupId) {
    let group = document.getElementById(groupId);
    group.parentNode.removeChild(group);
}

function getCohortGroupColor(cohortGroupId) {
    let split = cohortGroupId.split("-");

    switch (Number(split[1])) {
        case 0:
            return "#81d8d0";
        case 1:
            return "#ffc100";
        case 2:
            return "#dda0da";
        case 3:
            return "#ffafaf";
        case 4:
            return "#ffc0cb";
        default:
            return "#c9c9ff";
    }
}

function addItemToPropertiesInformationColumn(propertyName, type) {
    let row = d3.select("#col_propertiesInformation").append("div").attr("class", "row align-items-center");
    row.append("div").attr("class", "col-7").html(propertyName);

    let item = row.append("div").attr("class", "col-5 columnPropertyType");
    item.append("span").attr("class", "dataTypeTooltip").html(type)
        .append("span").attr("class", "tooltipText").html(getToolTipText(type));

    let dropdown = item.append("span").attr("class", "dropdownSelection");
    let icon = dropdown.append("img").attr("src", "img/dropdown_icon.svg").attr("class", "dropdownIcon");
    dropdown.append("div").attr("id", "dropdownBlock").attr("class", "dropdown-content")
        .append("span").html(getOtherTypes(type));
    icon.on("click", () => {
        document.getElementById("dropdownBlock").classList.toggle("show");
    })
}

function getToolTipText(type) {
    switch (type) {
        case "number":
            return `possible filter operators:<br>< x, <= x, >= x, > x, = x, x - y<br>e.g. <= 40, 30 - 60`;
        case "string":
            return `possible filter operators:<br>use plain text without any operators`;
        default:
            return "undefined";
    }
}

function getOtherTypes(type) {
    if (type === "number") {
        return "string";
    }
    return "number";
}