/**
 * Created by Mike on 05-Apr-17.
 */

const svgId = "dataQueryingSVG";
const svgWidth = 1400;
const svgHeight = 500;

const rectInterspace = 20;

const BASE_COHORT_NODE = {x: 50, y: 70, id: "baseCohortNode", text: "All Patients"};
const DIVIDER = {y1: BASE_COHORT_NODE.y, y2: 300};

function initDrawing() {
    d3.select("#dataQueryingView").append("svg").attr("id", svgId).attr("width", svgWidth).attr("height", svgHeight)
        .attr("viewbox", "0 0 400 400");
}

function drawCohortGroup(cohortGroupId, clientRect) {
    let cohortGroupText = getCohortGroupName(cohortGroupId);

    appendGroup(cohortGroupId);
    drawDivider(cohortGroupId, calculateDividerClientRectLeft());
    let input = appendInput(cohortGroupId, clientRect.left, clientRect.top - 40, cohortGroupText);
    input.on("blur", () => onCohortGroupInputChangeHandler(input, cohortGroupId));
}

function drawBaseNodeGroup(cohortNode) {
    drawCohortGroup(cohortNode.cohort.groupId, cohortNode.nodeConfig.clientRect);
    appendGroup(cohortNode.nodeConfig.nodeGroupId, cohortNode.cohort.groupId);
    drawCohortNodeElements(cohortNode);
}

function drawCohortNodeGroup(cohortNode) {
    appendGroup(cohortNode.nodeConfig.nodeGroupId, cohortNode.cohort.groupId);
    drawPath(cohortNode.nodeConfig.nodeGroupId, cohortNode.nodeConfig.clientRect);
    drawCohortNodeElements(cohortNode);
}

function drawCohortNodeElements(cohortNode) {
    let nodeConfig = cohortNode.nodeConfig;

    let nodeElement = drawRect(nodeConfig.nodeGroupId, nodeConfig.id, nodeConfig.clientRect);
    nodeElement.on("mouseout", hideNavIcons).on("mouseover", () => onCohortNodeMouseOverHandler(cohortNode))
        .on("click", () => onCohortNodeClickHandler(cohortNode));


    let textElement = drawText(nodeConfig.nodeGroupId, nodeConfig.text, nodeConfig.clientRect);
    textElement.on("mouseout", hideNavIcons).on("mouseover", () => onCohortNodeMouseOverHandler(cohortNode))
        .on("click", () => onCohortNodeClickHandler(cohortNode));
}

function appendGroup(groupName, parentGroupName = svgId, cssClass = "node") {
    let g = trimAllWhiteSpace(groupName);
    return getGroup(parentGroupName).append("g").attr("class", cssClass).attr("id", g);
}

function getGroup(groupName) {
    let g = trimAllWhiteSpace(groupName);
    return d3.select(`#${g}`);
}

function appendInput(groupId, x, y, text) {
    return getGroup(groupId).append("foreignObject").attr("x", x).attr("y", y)
        .append("xhtml:body").append("xhtml:input").attr("type", "text").attr("placeholder", text);
}

function drawRect(groupId, id, clientRect) {
    return getGroup(groupId).append("rect").attr("id", id).attr("x", clientRect.left).attr("y", clientRect.top)
        .attr("width", clientRect.width).attr("height", clientRect.height);
}

function drawText(groupId, text, clientRect) {
    return getGroup(groupId).append("text").text(text.toLowerCase())
        .attr("x", clientRect.left + clientRect.width / 2).attr("y", clientRect.top + clientRect.height / 2);
}

function drawPath(groupId, clientRect) {
    let d = composePathD(clientRect.left, clientRect.top - rectInterspace, clientRect.left, clientRect.top, clientRect.width);
    return getGroup(groupId).append("path").attr("d", d);
}

function composePathD(parentX, parentY, x, y, w) {
    return `M ${parentX},${parentY}  H ${parentX + w}  L ${x + w},${y}  H ${x}  Z`;
}

function drawDivider(groupId, x) {
    return getGroup(groupId).append("line").attr("x1", x).attr("y1", DIVIDER.y1).attr("x2", x).attr("y2", DIVIDER.y2);
}

/**
 * event handlers
 */
function onCohortNodeClickHandler(cohortNode) {
    if (isCohortNodeSelected(cohortNode.cohort)) {
        markElement(cohortNode.nodeConfig.id, null);
        removeCohortFromDataSelection(cohortNode.cohort);
        return;
    }

    let nodeColor = getCohortNodeColor(cohortNode.cohort.groupId);
    try {
        addCohortNodeToDataSelection(cohortNode.cohort, nodeColor);
    } catch (e) {
        if (e instanceof DuplicateError) {
            alert(e.message);
            return;
        }
        throw e;
    }
    markElement(cohortNode.nodeConfig.id, `fill: ${nodeColor}`);
}
function onCohortNodeMouseOverHandler(cohortNode) {
    if (isQueryContainerVisible()) {
        return;
    }

    setSelectedCohortNode(cohortNode);
    updateNavRect(cohortNode.nodeConfig.clientRect);
    displayTriangleIcon();

    if (!isBaseCohortNode(cohortNode.nodeConfig.id)) {
        displayClosingIcon();
    }
}

function onCohortGroupInputChangeHandler(/*inputElement, cohortGroupId*/) {
    //let text = inputElement.property("value");
    // TODO change cohortGroupID of the complete cohort group
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

function isBaseCohortNode(nodeId) {
    return nodeId === BASE_COHORT_NODE.id
}

function getCohortNodeColor(cohortGroupId) {
    let c = getSelectedCohortNodeCountByCohortGroupId(cohortGroupId);

    switch (c) {
        case 0:
            return "#ffc100";
        case 1:
            return "#81d8d0";
        case 2:
            return "#dda0da";
        case 3:
            return "#ffafaf";
        case 4:
            return "#ffc0cb";
        default:
            console.log(`Undefined number: ${c}`);
    }
}