/**
 * Created by Mike on 13-Mar-17.
 */

var margin = {top: 1, right: 1, bottom: 6, left: 1};
//var height = 1500 - margin.top - margin.bottom;

var scale = d3.scaleLinear();

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
        .attr("height", svgHeight - margin.top - margin.bottom)
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

var propertyList = [];
function addNewProperty(propertyName) {
    if (isPropertyExisting(propertyName)) {
        return;
    }

    propertyList.push(propertyName);

    var y = drawingSpecs.nodeHeightHalf + (propertyList.length - 1) * drawingSpecs.propertyDistance;  //TODO refactor

    var g = d3.select("#svg").append("g").attr("class", "node").attr("id", trimAllWhiteSpace(propertyName));
    g.append("text").text(propertyName).attr("x", drawingSpecs.propertyNameWidth).attr("y", y)
        .attr("text-anchor", "end").attr("alignment-baseline", "middle");
    g.append("line").attr("x1", drawingSpecs.propertyLine.x1).attr("y1", y).attr("x2", drawingSpecs.propertyLine.x2).attr("y2", y);
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

function addNewNode(propertyName, query, dataset, parentNode) {
    var gID = trimAllWhiteSpace(propertyName);
    var g = d3.select("#" + gID);
    var propertyLinePosY = g.select("line").property("y1").baseVal.value;

    var width = calculateNodeWidth(dataset);
    console.log("nodeWidth: " + width);
    var xPos = calculateNodeStartingPosition(g, parentNode, propertyName, width);
    var yPos = propertyLinePosY - drawingSpecs.nodeHeightHalf;

    /*if(parentNode != null && xPos < parentNode.x.baseVal.value) {
        xPos = parentNode.x.baseVal.value;
    }*/

    var nodeXCenter = xPos + width / 2;
    var nodeYCenter = propertyLinePosY;

    var id = trimAllWhiteSpace(propertyName + "_" + query);
    g.append("rect").attr("id", id).attr("x", xPos).attr("y", yPos).attr("width", width).attr("height", drawingSpecs.nodeHeight)
        .on("mouseover", function(){displayTriangleElement(dataset, nodeXCenter, yPos + drawingSpecs.nodeHeight)})
        .on("mouseout", hideTriangleElement);
    g.append("text").text(query).attr("x", nodeXCenter).attr("y", nodeYCenter)
        .attr("text-anchor", "middle").attr("alignment-baseline", "central");

    var parentId = !parentNode? null: parentNode.id;
    addToNodeList(id, propertyName, query, parentId, dataset, xPos, yPos);

    //linkNodes(sourceX, sourceY, nodeX, nodeY, nodeWidth);
}

var nodeList = [];
function addToNodeList(id, propertyName, query, parentId, dataset, xPos, yPos){
    var obj = {};
    obj.id = id;
    obj.propertyName = propertyName;
    obj.query = query;
    obj.parentId = parentId;
    obj.dataset = dataset;
    obj.xPos = xPos;
    obj.yPos = yPos;
    nodeList.push(obj);
}

function getAllChildNodesFromParent(parentId, propertyName) {
    var nodes = [];
    for(var key in nodeList){
        var obj = nodeList[key];
        if(obj.parentId == parentId && obj.propertyName == propertyName){
            nodes.push(obj);
        }
    }

    return nodes;
}

function calculateNodeWidth(dataset) {
    return scale(dataset.length);
}

function calculateNodeStartingPosition(container, parentNode, propertyName, nodeWidth) {

    if(parentNode == null /*&& nodes == null*/) {
        return drawingSpecs.nodeArea.x1;
    }

    var childNodes = getAllChildNodesFromParent(parentNode.id, propertyName);
    if(childNodes.length == 0) {
        return parentNode.x.baseVal.value;
    }

    var lastChildNode = childNodes[childNodes.length - 1];
    return lastChildNode.xPos + calculateNodeWidth(lastChildNode.dataset);

    //var xStartPos = lastChildNode.xPos + calculateNodeWidth(lastChildNode.dataset);
    //isStartingPositionOccupied(container, xStartPos);
}


// TODO : figure out if the node fits in
function isStartingPositionOccupied(container, xStartPos, xEndPos) {
    var nodes = getAllElementOfTypeInContainer(container, "rect");

    var isStartPosOccupied = false;
    var isEndPosOccupied = false;
    for(var node in nodes) {
        var nodeXStartPos = node.x.baseVal.value;
        var nodeXEndPos = nodeXStartPos + node.width.baseVal.value;

        if(isStartPosOccupied) {
            isEndPosOccupied = xEndPos < nodeXStartPos;
        }

        isEndPosOccupied = xEndPos > nodeXStartPos;
        isStartPosOccupied = xStartPos < nodeXEndPos;

    }
}

function setCustomScale(domainArray, rangeArray) {
    scale.domain(domainArray).range(rangeArray);
}

function getSVGCoordinates() {
    return document.getElementById("svg").getBoundingClientRect();
}

// TODO : draw link between parent and node
function linkNodes(sourceX, sourceY, targetX, targetY, targetDx) {
    var curvature = .6;
    var x0 = sourceX,      // sourceX
        y0 = sourceY,      // sourceY + nodeHeight
        x1 = targetX,                    // targetX
        y1 = targetY,
        dx = targetDx;  // targetY +

    return "M" + x0 + "," + y0
        + "H" + dx
        + "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " + x1 + "," + y1
        + "H" + x1
        + "C" + x3 + "," + (y1+d.target.dy) + " " + x2 + "," + (y0+d.source.dy) + " " + x0 + "," + (y0+d.source.dy);
}