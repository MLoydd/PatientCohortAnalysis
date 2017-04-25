/**
 * Created by Mike on 05-Apr-17.
 */

const rectInterspace = 30;

const BASE_COHORT_NODE = {x: 50, y: 70, id: "baseCohortNode", text: "All Patients"};
const DIVIDER = {y1: BASE_COHORT_NODE.y, y2: 300};

function addCohortGroupColumn(cohortGroupId) {
    let id = trimAllWhiteSpace(cohortGroupId);
    return d3.select("#dataQueryingGrid").append("div").attr("id", id).attr("class", "col-md-2");
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
    drawPath(cohortNode.nodeConfig.nodeGroupId, cohortNode.nodeConfig.clientRect);
    drawCohortNodeElements(cohortNode);
}

function drawCohortNodeElements(cohortNode) {
    let nodeConfig = cohortNode.nodeConfig;

    drawRect(nodeConfig.nodeGroupId, nodeConfig.id, nodeConfig.clientRect);
    drawText(nodeConfig.nodeGroupId, nodeConfig.text, nodeConfig.clientRect);

    let bottomTriangle = drawBottomTriangle(nodeConfig.nodeGroupId, nodeConfig.clientRect);
    bottomTriangle.on("click", () => onBottomTriangleClickHandler(cohortNode));

    if (isBaseCohortNode(nodeConfig.id)) {
        let rightTriangle = drawRightTriangle(nodeConfig.nodeGroupId, nodeConfig.clientRect);
        rightTriangle.on("click", () => onRightTriangleClickHandler(cohortNode));
    }

    addCohortNodeToSelection(cohortNode);
}

function isBaseCohortNode(nodeId) {
    return nodeId.includes(`${BASE_COHORT_NODE.id}`)
}

function getNodeGroup(groupName) {
    let g = trimAllWhiteSpace(groupName);
    return d3.select(`#${g}`);
}

function drawRect(nodeGroupId, id, clientRect) {
    return getNodeGroup(nodeGroupId).append("rect").attr("id", id).attr("x", clientRect.left).attr("y", clientRect.top)
        .attr("width", clientRect.width).attr("height", clientRect.height);
}

function drawText(nodeGroupId, text, clientRect) {
    return getNodeGroup(nodeGroupId).append("text").text(text)
        .attr("x", clientRect.left + 10).attr("y", clientRect.top + clientRect.height / 2);
}

function drawRightTriangle(nodeGroupId, clientRect) {
    let x1 = clientRect.left + clientRect.width;
    let y1 = clientRect.top + clientRect.height;
    let x2 = clientRect.left + clientRect.width;
    let y2 = clientRect.top;
    let x3 = clientRect.left + clientRect.width + 20;
    let y3 = clientRect.top + clientRect.height / 2;

    let p = `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
    return getNodeGroup(nodeGroupId).append("polygon").attr("points", p).style("fill", "#5cb85c").attr("class", "rightTriangle");
}

function removeRightTriangle(nodeGroupId) {
    getNodeGroup(nodeGroupId).select(".rightTriangle").remove();
}

function drawBottomTriangle(nodeGroupId, clientRect) {
    let x1 = clientRect.left + clientRect.width / 2 - 30;
    let y1 = clientRect.top + clientRect.height;
    let x2 = clientRect.left + clientRect.width / 2 + 30;
    let y2 = clientRect.top + clientRect.height;
    let x3 = clientRect.left + clientRect.width / 2;
    let y3 = clientRect.top + clientRect.height + 30;

    let p = `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
    return getNodeGroup(nodeGroupId).append("polygon").attr("points", p).style("fill", "#5cb85c").attr("class", "bottomTriangle");
}

function removeBottomTriangle(nodeGroupId) {
    getNodeGroup(nodeGroupId).select(".bottomTriangle").remove();
}

function drawPath(nodeGroupId, clientRect) {
    let d = composePathD(clientRect.left, clientRect.top - rectInterspace, clientRect.left, clientRect.top, clientRect.width);
    return getNodeGroup(nodeGroupId).append("path").attr("d", d);
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

    let nodeColor = getCohortNodeColor(cohortNode.cohort.groupId);
    updateDataSelectionView(cohortNode.cohort, nodeColor);
    markElement(cohortNode.nodeConfig.id, `fill: ${nodeColor}`);
}

function onRightTriangleClickHandler(cohortNode) {
    let newCohortNode = getBaseCohortNode();
    drawBaseNodeGroup(newCohortNode);
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

function removeCohortNodeFromQueryingView(groupId) {
    let group = document.getElementById(groupId);
    group.parentNode.removeChild(group);
}

function getCohortNodeColor(cohortGroupId) {
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