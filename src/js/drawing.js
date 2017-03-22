/**
 * Created by Mike on 13-Mar-17.
 */

var margin = {top: 1, right: 1, bottom: 6, left: 1};
//var height = 1500 - margin.top - margin.bottom;

var drawingSpecs = {
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

var scale = d3.scaleLinear();
function setCustomScale(domainArray, rangeArray) {
    scale.domain(domainArray).range(rangeArray);
}

function calculateNodeWidth(quantity) {
    return scale(quantity);
}


/**
 * property creation
 */

var propertyList = [];
function addNewProperty(propertyName) {
    if (isPropertyExisting(propertyName)) {
        return;
    }

    propertyList.push(propertyName);

    var y = drawingSpecs.nodeHeightHalf + (propertyList.length - 1) * drawingSpecs.propertyDistance;  //TODO refactor

    var g = d3.select("#svg").append("g").attr("class", "node").attr("id", trimAllWhiteSpace(propertyName));
    appendText(g, propertyName, drawingSpecs.propertyNameWidth, y, "end", "central");
    appendLine(g, drawingSpecs.propertyLine.x1, y, drawingSpecs.propertyLine.x2, y);
}

function isPropertyExisting(propertyName) {
    for (var i in propertyList) {
        if (propertyList[i].toLowerCase() == propertyName.toLowerCase()) {
            console.log("Property is existing: " + propertyName);
            return true;
        }
    }

    return false;
}

/**
 * node creation
 */

function addNewNode(propertyName, query, dataset, parentNode) {
    var g = d3.select("#" + trimAllWhiteSpace(propertyName));
    var propertyLinePosY = g.select("line").property("y1").baseVal.value;

    var width = calculateNodeWidth(dataset.length);
    console.log("nodeWidth: " + width);
    var xPos = calculateNodeStartingPosition(g, parentNode, propertyName, width);
    var yPos = propertyLinePosY - drawingSpecs.nodeHeightHalf;

    var nodeXCenter = xPos + width / 2;
    var nodeYCenter = propertyLinePosY;
    var id = composeNodeId(parentNode, propertyName, query);

    var overlaps = findOverlapWithAnotherNode(dataset, parentNode, propertyName);

    var node = appendRect(g, id, xPos, yPos, width, drawingSpecs.nodeHeight);
    node.on("mouseout", hideTriangleElement).on("mouseover", function () {
        displayTriangleElement(dataset, nodeXCenter, yPos + drawingSpecs.nodeHeight)
    });
    appendText(g, query, nodeXCenter, nodeYCenter, "middle", "central");
    appendPath(g, parentNode, xPos, yPos, width, overlaps);

    addToNodeList(id, propertyName, query, parentNode, dataset, xPos, yPos, overlaps);
}

function composeNodeId(parentNode, propertyName, query) {
    if (!parentNode) {
        return trimAllWhiteSpace(propertyName + "-" + query);
    }

    return trimAllWhiteSpace(propertyName + "-" + query + "_" + parentNode.id);
}

var nodeList = [];
function addToNodeList(id, propertyName, query, parentNode, dataset, xPos, yPos, overlapDataset) {
    if (!parentNode) {
        return;
    }

    var obj = {};
    obj.id = id;
    obj.propertyName = propertyName;
    obj.query = query;
    obj.parentId = parentNode.id;
    obj.dataset = dataset;
    obj.xPos = xPos;
    obj.yPos = yPos;
    obj.overlapDataset = overlapDataset;
    nodeList.push(obj);
}

function findOverlapWithAnotherNode(dataset, parentNode, propertyName) {
    if (!parentNode) {
        return;
    }

    var childNodes = getAllChildNodesFromParent(parentNode.id, propertyName);

    var map = new Map();
    for (var i = 0; i < dataset.length; i++) {
        var data = dataset[i];
        for (var j = 0; j < childNodes.length; j++) {
            var d = childNodes[j].dataset;
            for (var k = 0; k < d.length; k++) {
                var c = d[k];
                if (!map.has(data.patientID) && data.patientID == c.patientID) {
                    map.set(data.patientID, data);
                }
            }
        }
    }

    console.log("findOverlapWithAnotherNode: " + map.size);
    return map;
}

function getAllChildNodesFromParent(parentId, propertyName) {
    var nodes = nodeList.filter(function (obj) {
        if (!propertyName && obj.parentId == parentId) {
            return obj;
        }

        if (obj.parentId == parentId && obj.propertyName == propertyName) {
            return obj;
        }
    });

    console.log("getAllChildNodesFromParent: " + nodes.length);
    return nodes;
}

function calculateNodeStartingPosition(container, parentNode, propertyName, nodeWidth) {

    if (parentNode == null) {
        return drawingSpecs.nodeArea.x1;
    }

    var childNodes = getAllChildNodesFromParent(parentNode.id, propertyName);
    if (childNodes.length == 0) {
        return parentNode.x.baseVal.value;
    }

    var lastChildNode = childNodes[childNodes.length - 1];
    return lastChildNode.xPos + calculateNodeWidth(lastChildNode.dataset.length);

    //var xStartPos = lastChildNode.xPos + calculateNodeWidth(lastChildNode.dataset);
    //isStartingPositionOccupied(container, xStartPos);
}

// TODO : figure out if the node fits in
function isStartingPositionOccupied(container, xStartPos, xEndPos) {
    var nodes = getAllElementOfTypeInContainer(container, "rect");

    var isStartPosOccupied = false;
    var isEndPosOccupied = false;
    for (var node in nodes) {
        var nodeXStartPos = node.x.baseVal.value;
        var nodeXEndPos = nodeXStartPos + node.width.baseVal.value;

        if (isStartPosOccupied) {
            isEndPosOccupied = xEndPos < nodeXStartPos;
        }

        isEndPosOccupied = xEndPos > nodeXStartPos;
        isStartPosOccupied = xStartPos < nodeXEndPos;

    }
}


/**
 * all append functions
 */

function appendText(container, text, xPos, yPos, textAnchor, alignmentBaseline) {
    return container.append("text").text(text).attr("x", xPos).attr("y", yPos)
        .attr("text-anchor", textAnchor).attr("alignment-baseline", alignmentBaseline);
}

function appendLine(container, xPos1, yPos1, xPos2, yPos2) {
    return container.append("line").attr("x1", xPos1).attr("y1", yPos1).attr("x2", xPos2).attr("y2", yPos2);
}

function appendRect(container, id, xPos, yPos, width, height) {
    return container.append("rect").attr("id", id).attr("x", xPos).attr("y", yPos)
        .attr("width", width).attr("height", height);
}

function appendPath(container, parentNode, nodeX, nodeY, nodeWidth, overlaps) {
    if (!parentNode) {
        return;
    }

    var parentXPos = parentNode.x.baseVal.value;
    var childNodes = getAllChildNodesFromParent(parentNode.id, null);
    childNodes.forEach(function (obj) {
        parentXPos += calculateNodeWidth(obj.dataset.length) - calculateNodeWidth(obj.overlapDataset.size);
    });

    if (overlaps.size > 0) {
        parentXPos -= calculateNodeWidth(overlaps.size);
    }

    var parentYPos = parentNode.y.baseVal.value + drawingSpecs.nodeHeight;
    var d = composeStraightPathD(parentXPos, parentYPos, nodeX, nodeY, nodeWidth);

    return container.append("path").attr("d", d);
}

function composeStraightPathD(parentXPos, parentYPos, nodeXPos, nodeYPos, nodeWidth) {
    var parentXPos2 = parentXPos + nodeWidth;
    var nodeXPos2 = nodeXPos + nodeWidth;
    return "M" + parentXPos + "," + parentYPos
        + "H" + parentXPos2
        + "L" + nodeXPos2 + "," + nodeYPos
        + "H" + nodeXPos
        + "Z";
}

/*
 function composeStraightPathD(parentXPos, parentYPos, nodeXPos, nodeYPos, nodeWidth) {
 var curvature = .6;
 var xi = d3.interpolateNumber(parentYPos, nodeYPos);
 var parentXPos2 = parentXPos + nodeWidth;
 var nodeXPos2 = nodeXPos + nodeWidth;
 var y0 = xi(curvature);
 var y1 = xi(1 - curvature);
 var x0 = parentXPos2 + nodeWidth / 2;
 var x1 = nodeXPos2 + nodeWidth / 2;
 return "M" + parentXPos + "," + parentYPos
 + "H" + parentXPos2
 + "C" + x0 + "," + y0 + " " + x1 + "," + y1 + " " + nodeXPos2 + "," + nodeYPos
 + "H" + nodeXPos
 + "C" + (x1 + nodeWidth) + "," + y1 + " " + (x0 + nodeWidth) + "," + y0 + " " + parentXPos + "," + parentYPos;
 }
 */