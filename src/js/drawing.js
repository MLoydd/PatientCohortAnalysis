/**
 * Created by Mike on 13-Mar-17.
 */

let margin = {top: 1, right: 1, bottom: 6, left: 1};
//let height = 1500 - margin.top - margin.bottom;

let drawingSpecs = {
    nodeHeight: 30,
    nodeHeightHalf: 15,
    propertyNameWidth: 150,
    propertyDistance: 100,
    nodeArea: {x1: 200, width: 1000},
    propertyLine: {x1: 175, x2: 1225}
};

function initDrawing(svgWidth, svgHeight) {
    d3.select("#chart")
        .append("svg").attr("id", "svg").attr("width", svgWidth - margin.left - margin.right)
        .attr("height", svgHeight - margin.top - margin.bottom).attr("viewbox", "0 0 400 400")
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function getSVGCoordinates() {
    return document.getElementById("svg").getBoundingClientRect();
}


/**
 * scaling
 */

let scale = d3.scaleLinear();
function setCustomScale(domainArray, rangeArray) {
    scale.domain(domainArray).range(rangeArray);
}

function calculateNodeWidth(quantity) {
    return scale(quantity);
}


/**
 * property creation
 */

let propertyArray = [];
function addNewProperty(propertyName) {
    if (isPropertyExisting(propertyName)) {
        return;
    }

    propertyArray.push(propertyName);

    let y = calculatePropertyLinePositionY(propertyName);

    let g = d3.select("#svg").append("g").attr("class", "node").attr("id", trimAllWhiteSpace(propertyName));
    drawText(g, propertyName, drawingSpecs.propertyNameWidth, y, "end", "central");
    appendLine(g, drawingSpecs.propertyLine.x1, y, drawingSpecs.propertyLine.x2, y);
}

function calculatePropertyLinePositionY(propertyName) {
    return drawingSpecs.nodeHeightHalf + (propertyArray.length - 1) * drawingSpecs.propertyDistance;
}

function isPropertyExisting(propertyName) {
    for (let i in propertyArray) {
        if (propertyArray[i].toLowerCase() == propertyName.toLowerCase()) {
            console.log("Property is existing: " + propertyName);
            return true;
        }
    }

    return false;
}

function hasPropertyCohortNodes(property) {
    for(let [key, cohort] of cohortNodeMap) {
        if(cohort.property == property) {
            return true;
        }
    }
    return false;
}

function removeProperty(property) {
    propertyArray = propertyArray.filter(function (obj) {
        return obj != property;
    })
}

/**
 * node creation
 */

function addNewCohortNode(propertyName, query, dataset, parentCohortNodeId, overlapDataMap) {
    let g = d3.select("#" + trimAllWhiteSpace(propertyName));
    let propertyLinePosY = g.select("line").property("y1").baseVal.value;

    let parentCohortNode = cohortNodeMap.get(parentCohortNodeId);

    let width = calculateNodeWidth(dataset.length);
    console.log("nodeWidth: " + width);
    let xPos = calculateNodeStartingPosition(g, parentCohortNode, propertyName, width);
    let yPos = propertyLinePosY - drawingSpecs.nodeHeightHalf;

    let nodeXCenter = xPos + width / 2;
    let nodeYCenter = propertyLinePosY;
    let id = composeNodeId(parentCohortNode, propertyName, query);

    let node = drawRect(g, id, xPos, yPos, width, drawingSpecs.nodeHeight);
    drawText(g, query, nodeXCenter, nodeYCenter, "middle", "central");
    drawPath(g, parentCohortNode, xPos, yPos, width, overlapDataMap);

    let cohortNode = addToCohortNodeMap(id, propertyName, query, parentCohortNode, dataset, xPos, yPos, width, overlapDataMap);
    node.on("mouseout", hideCohortNodeElements).on("mouseover", function () {
        displayCohortNodeElements(cohortNode);
    });
}

function composeNodeId(parentCohortNode, propertyName, query) {
    if (!parentCohortNode) {
        return trimAllWhiteSpace(propertyName + "-" + query);
    }

    return trimAllWhiteSpace(propertyName + "-" + query + "_" + parentCohortNode);
}

let cohortNodeMap = new Map();
function addToCohortNodeMap(cohortNodeId, property, query, parentCohortNode, dataset, xPos, yPos, width, overlapDataMap) {
    if (cohortNodeMap.has(cohortNodeId)) {
        alert("This cohort already exists!");
        return cohortNodeMap.get(cohortNodeId);
    }

    let cohort = {};
    cohort.id = cohortNodeId;
    cohort.property = property;
    cohort.query = query;
    cohort.parentId = parentCohortNode ? parentCohortNode.id : null;
    cohort.dataset = dataset;
    cohort.xPos = xPos;
    cohort.yPos = yPos;
    cohort.width = width;
    cohort.overlapDataMap = overlapDataMap;
    cohortNodeMap.set(cohortNodeId, cohort);

    return cohort;
}

function removeCohortNode(cohortId, property) {

    cohortNodeMap.delete(cohortId);
    if(!hasPropertyCohortNodes(property)) {
        removeProperty(property);
    }
    redraw();
}

function getAllChildNodes(parentId, property) {
    let nodes = [];
    cohortNodeMap.forEach(function (obj) {
        if (!property && obj.parentId == parentId) {
            nodes.push(obj);
        }

        if (obj.parentId == parentId && obj.property == property) {
            nodes.push(obj);
        }
    });

    console.log("getAllChildNodes: " + nodes.length);
    return nodes;
}

function hasChildCohortNodes(nodeId) {
    return getAllChildNodes(nodeId).length != 0;
}

function calculateNodeStartingPosition(container, parentCohortNode, propertyName, nodeWidth) {

    if (propertyName == "All Patients") {
        return drawingSpecs.nodeArea.x1;
    }

    let childNodes = getAllChildNodes(parentCohortNode.id);
    if (childNodes.length == 0) {
        return parentCohortNode.xPos;
    }

    let lastChildNode = childNodes[childNodes.length - 1];
    return lastChildNode.xPos + lastChildNode.width;

    //let xStartPos = lastChildNode.xPos + calculateNodeWidth(lastChildNode.dataset);
    //isStartingPositionOccupied(container, xStartPos);
}

// TODO : figure out if the node fits in
function findNextAvilablePosition(container, xStartPos, xEndPos) {
    let nodes = getAllElementOfTypeInContainer(container, "rect");

    let isStartPosOccupied = false;
    let isEndPosOccupied = false;
    for (let node in nodes) {
        let nodeXStartPos = node.x.baseVal.value;
        let nodeXEndPos = nodeXStartPos + node.width.baseVal.value;

        if (isStartPosOccupied) {
            isEndPosOccupied = xEndPos < nodeXStartPos;
        }

        isEndPosOccupied = xEndPos > nodeXStartPos;
        isStartPosOccupied = xStartPos < nodeXEndPos;

    }
}

// TODO
function redraw() {
    let propertListCopy = propertyArray;
    let cohortNodeMapCopy = new Map(cohortNodeMap);

    propertyArray = [];
    cohortNodeMap.clear();

    d3.selectAll("svg > *").remove();
    propertListCopy.forEach(function (property) {
        addNewProperty(property);
        cohortNodeMapCopy.forEach(function (obj) {
            if(obj.property == property) {
                addNewCohortNode(property, obj.query, obj.dataset, obj.parentId, obj.overlapDataMap);
            }
        })
    })
}


/**
 * all append functions
 */

function drawText(container, text, xPos, yPos, textAnchor, alignmentBaseline) {
    return container.append("text").text(text).attr("x", xPos).attr("y", yPos)
        .attr("text-anchor", textAnchor).attr("alignment-baseline", alignmentBaseline);
}

function appendLine(container, xPos1, yPos1, xPos2, yPos2) {
    return container.append("line").attr("x1", xPos1).attr("y1", yPos1).attr("x2", xPos2).attr("y2", yPos2);
}

function drawRect(container, id, xPos, yPos, width, height) {
    return container.append("rect").attr("id", id).attr("x", xPos).attr("y", yPos)
        .attr("width", width).attr("height", height);
}

function drawPath(container, parentCohortNode, nodeX, nodeY, nodeWidth, overlapDataMap) {
    if (!parentCohortNode) {
        return;
    }

    let parentXPos = parentCohortNode.xPos;
    let childNodes = getAllChildNodes(parentCohortNode.id);
    childNodes.forEach(function (obj) {
        parentXPos += obj.width - calculateNodeWidth(obj.overlapDataMap.size);
    });

    if (overlapDataMap.size > 0) {
        parentXPos -= calculateNodeWidth(overlapDataMap.size);
    }

    let parentYPos = parentCohortNode.yPos + drawingSpecs.nodeHeight;
    let d = composeStraightPathD(parentXPos, parentYPos, nodeX, nodeY, nodeWidth);

    return container.append("path").attr("d", d);
}

function composeStraightPathD(parentXPos, parentYPos, nodeXPos, nodeYPos, nodeWidth) {
    let parentXPos2 = parentXPos + nodeWidth;
    let nodeXPos2 = nodeXPos + nodeWidth;
    return "M" + parentXPos + "," + parentYPos
        + "H" + parentXPos2
        + "L" + nodeXPos2 + "," + nodeYPos
        + "H" + nodeXPos
        + "Z";
}

/*
 function composeStraightPathD(parentXPos, parentYPos, nodeXPos, nodeYPos, nodeWidth) {
 let curvature = .6;
 let xi = d3.interpolateNumber(parentYPos, nodeYPos);
 let parentXPos2 = parentXPos + nodeWidth;
 let nodeXPos2 = nodeXPos + nodeWidth;
 let y0 = xi(curvature);
 let y1 = xi(1 - curvature);
 let x0 = parentXPos2 + nodeWidth / 2;
 let x1 = nodeXPos2 + nodeWidth / 2;
 return "M" + parentXPos + "," + parentYPos
 + "H" + parentXPos2
 + "C" + x0 + "," + y0 + " " + x1 + "," + y1 + " " + nodeXPos2 + "," + nodeYPos
 + "H" + nodeXPos
 + "C" + (x1 + nodeWidth) + "," + y1 + " " + (x0 + nodeWidth) + "," + y0 + " " + parentXPos + "," + parentYPos;
 }
 */