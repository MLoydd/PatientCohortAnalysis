/**
 * Created by Mike on 05-Apr-17.
 */

const RECT_INTERSPACE = 10;
const BASE_COHORT_NODE = {id: "baseCohortNode", text: "All Patients"};

function addCohortGroupColumn(cohortGroupId) {
    let id = trimAllWhiteSpace(cohortGroupId);
    return d3.select("#dataQueryingGrid").append("div").attr("id", id).attr("class", "col-2 cohortQueryColumn");
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

    addTriangleDown(cohortNode);
    addTriangleRight(cohortNode);

    if (!isCoreBaseCohortNode(nodeConfig.id)) {
        drawCloseIcon(nodeConfig.nodeGroupId, nodeConfig.clientRect)
            .on("click", () => removeCohortNodeAndItsDependencies(cohortNode))
            .on("mouseover", () => changeStrokeOpacityOfCohortNodeDescendantsCloseIcon(cohortNode, 1.0))
            .on("mouseout", () => changeStrokeOpacityOfCohortNodeDescendantsCloseIcon(cohortNode, null));
    }
}

function isCoreBaseCohortNode(nodeId) {
    return nodeId === BASE_COHORT_NODE.id;
}

function getNodeGroup(groupName) {
    let g = trimAllWhiteSpace(groupName);
    return d3.select(`#${g}`);
}

function drawBaseRectOutline(nodeGroupId, clientRect) {
    return getNodeGroup(nodeGroupId).append("rect").attr("x", clientRect.left).attr("y", clientRect.top)
        .attr("width", RANGE.max).attr("height", clientRect.height).style("fill", "#f7f7f7");
}

function drawRect(nodeGroupId, id, clientRect) {
    return getNodeGroup(nodeGroupId).append("rect").attr("id", id).attr("x", clientRect.left).attr("y", clientRect.top)
        .attr("width", clientRect.width).attr("height", clientRect.height);
}

function drawText(nodeGroupId, text, clientRect) {
    return getNodeGroup(nodeGroupId).append("text").text(text)
        .attr("x", clientRect.left + 10).attr("y", clientRect.top + clientRect.height / 2);
}

function addTriangleRight(cohortNode) {
    drawTriangleRight(cohortNode.nodeConfig.nodeGroupId, cohortNode.nodeConfig.clientRect)
        .on("click", () => onRightTriangleClickHandler(cohortNode));
}

function drawTriangleRight(nodeGroupId, clientRect) {
    let x1 = clientRect.left + RANGE.max;
    let y1 = clientRect.top + clientRect.height;
    let x2 = clientRect.left + RANGE.max;
    let y2 = clientRect.top;
    let x3 = clientRect.left + RANGE.max + 20;
    let y3 = clientRect.top + clientRect.height / 2;

    let p = `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
    return getNodeGroup(nodeGroupId).append("polygon").attr("points", p).attr("class", "rightTriangle");
}

function removeTriangleRight(nodeGroupId) {
    getNodeGroup(nodeGroupId).select(".rightTriangle").remove();
}

function addTriangleDown(cohortNode) {
    drawTriangleDown(cohortNode.nodeConfig.nodeGroupId, cohortNode.nodeConfig.clientRect)
        .on("click", () => onBottomTriangleClickHandler(cohortNode));
}

function drawTriangleDown(nodeGroupId, clientRect) {
    let x1 = clientRect.left + RANGE.max / 2 - 30;
    let y1 = clientRect.top + clientRect.height;
    let x2 = clientRect.left + RANGE.max / 2 + 30;
    let y2 = clientRect.top + clientRect.height;
    let x3 = clientRect.left + RANGE.max / 2;
    let y3 = clientRect.top + clientRect.height + 30;

    let p = `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
    return getNodeGroup(nodeGroupId).append("polygon").attr("points", p).attr("class", "bottomTriangle");
}

function removeTriangleDown(nodeGroupId) {
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
function addCohortNodeToSelection(cohortNode, prevCohortNode) {
    if (prevCohortNode) {
        markElement(prevCohortNode.nodeConfig.id, null);
    }

    let nodeColor = getCohortGroupColor();
    updateDataSelectionView(cohortNode.cohort, nodeColor);
    markElement(cohortNode.nodeConfig.id, `fill: ${nodeColor}`);
}

function onRightTriangleClickHandler(cohortNode) {
    if (isBaseCohortNode(cohortNode.nodeConfig.id)) {
        copyBaseCohortNode(cohortNode.cohort.dataset);
        //removeTriangleRight(cohortNode.nodeConfig.nodeGroupId);
        return;
    }

    copyCohortGroup(cohortNode);
}

function isBaseCohortNode(nodeId) {
    return nodeId.includes(BASE_COHORT_NODE.id);
}

function onBottomTriangleClickHandler(cohortNode) {
    displayQueryContainer(cohortNode);
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

let selectedCohortNode = null;
function applyFilterOnClickHandler() {
    if (!validateQueryInputFields()) {
        return;
    }

    let cohortNode = selectedCohortNode;
    let property = inputProperty.value.trim().toLowerCase();
    let query = inputQuery.value.trim().toLowerCase();
    try {
        queryCohort(cohortNode, property, query);
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
    removeTriangleDown(cohortNode.nodeConfig.nodeGroupId);
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

function getCohortGroupColor() {
    return "#2fbfff";
}

function addItemToPropertiesInformationColumn(parameterName, type) {
    let row = d3.select("#col_propertiesInformation").append("div").attr("class", "row align-items-center");
    row.append("div").attr("class", "col-7").html(parameterName);

    let parameterValueSet = getValueSetOfParameter(parameterName);
    let item = row.append("div").attr("class", "col-5 columnPropertyType");
    item.append("span").attr("class", "dataTypeSpan").attr("title", getToolTipText(type, parameterValueSet)).html(type);

    if (type !== "string" && type !== "ordinal") {
        return;
    }

    item.append("span").attr("class", "dropdownSelection")
        .append("img").attr("src", "img/dropdown_icon.svg").attr("title", "click to change the data type to ordinal")
        .attr("class", "dropdownIcon").on("click", () => {

        document.getElementById("modalHeader").innerHTML = parameterName;
        (document.getElementsByClassName("modal-close")[0]).onclick = () => closeModal();

        //let parameterValueSet = getValueSetOfParameter(parameterName);
        for (let value of parameterValueSet) {
            let dragItem = document.createElement("div");
            dragItem.classList.add("dragItem");
            dragItem.setAttribute("draggable", true);
            dragItem.appendChild(document.createTextNode(value));
            dragItem.setAttribute("id", `modal-${parameterName}_${value}`);
            dragItem.ondragstart = (event) => event.dataTransfer.setData("text", event.target.id);

            let dropItem = document.createElement("div");
            dropItem.classList.add("dropField");
            dropItem.ondrop = (event) => {
                event.preventDefault();
                let id = event.dataTransfer.getData("text");
                let element = document.getElementById(id);

                element.parentNode.appendChild(event.target);
                event.currentTarget.appendChild(element);
                event.target.style.border = null;
            };
            dropItem.ondragover = (event) => event.preventDefault();
            dropItem.ondragenter = (event) => event.target.style.border = "1px inset #0000af";
            dropItem.ondragleave = (event) => event.target.style.border = null;
            dropItem.appendChild(dragItem);
            document.getElementById("modalBody").appendChild(dropItem);
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            if (event.target === document.getElementById("modalContainer")) {
                closeModal();
            }
        };

        document.getElementById("modelButton").onclick = (event) => {
            let childNodes = document.getElementById("modalBody").childNodes;
            let values = new Set();
            for (let n of childNodes) {
                values.add(n.textContent);
            }
            setValuesOfParameter(parameterName, values);
            updatePropertiesColumn();
            updateParameterColumn();
            closeModal();
        };

        document.getElementById("modalContainer").style.display = "block";
    });
}

function closeModal() {
    document.getElementById("modalContainer").style = null;
    d3.select("#modalBody").selectAll("*").remove();
}

function updatePropertiesColumn() {
    d3.select("#col_propertiesInformation").selectAll("*").remove();
    populatePropertiesInformationColumn();
}

function getToolTipText(type, values) {
    switch (type) {
        case "number":
            return `possible filter operators:\n< x ; <= x ; >= x ; > x ; = x ; x - y\ne.g. <= 40 ; 30 - 60`;
        case "date":
            return `possible filter operators: x - y\ne.g. 1.1.1970 - 12.12.2012 ; 1970 - 2012`;
        case "ordinal":
            let a = Array.from(values);
            return `available values:\n${a.join(` ; `)}`;
        case "string":
            return `possible filter operators:\nuse plain text without any operators`;
        default:
            return "undefined";
    }
}