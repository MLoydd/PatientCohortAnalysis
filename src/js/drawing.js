//import {select, rgb, event} from 'd3';

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

function addNewProperty(propertyName) {
    propertyList.push(propertyName);

    var y = drawingSpecs.nodeHeightHalf + (propertyList.length - 1) * drawingSpecs.propertyDistance;  //TODO refactor

    var g = d3.select("#svg").append("g").attr("class", "node").attr("id", trimAllWhiteSpace(propertyName));
    g.append("text").text(propertyName).attr("x", drawingSpecs.propertyNameWidth).attr("y", y)
        .attr("text-anchor", "end").attr("alignment-baseline", "middle");
    g.append("line").attr("x1", drawingSpecs.propertyLine.x1).attr("y1", y).attr("x2", drawingSpecs.propertyLine.x2).attr("y2", y);
}

function addNewNode(propertyName, query, cohort) {
    var gID = trimAllWhiteSpace(propertyName);
    var g = d3.select("#" + gID);
    var propertyLinePosY = g.select("line").property("y1").baseVal.value;

    var nodeX = drawingSpecs.nodeArea.x1;
    var nodeY = propertyLinePosY - drawingSpecs.nodeHeightHalf;
    var nodeWidth = scale(cohort.length);

    console.log("nodeWidth: " + nodeWidth);
    var r = g.selectAll("rect");
    if (!r.empty()) {
        var nodes = r.nodes();
        var lastNode = nodes[nodes.length - 1];
        nodeX = lastNode.x.baseVal.value + lastNode.width.baseVal.value;
    }

    var nodeXCenter = nodeX + nodeWidth / 2;
    var nodeYCenter = propertyLinePosY;

    g.append("rect").attr("x", nodeX).attr("y", nodeY).attr("width", nodeWidth).attr("height", drawingSpecs.nodeHeight)
        .on("mouseover", function(){displayTriangleElement(cohort, nodeXCenter, nodeY + drawingSpecs.nodeHeight)})
        .on("mouseout", hideTriangleElement);
    g.append("text").text(query).attr("x", nodeXCenter).attr("y", nodeYCenter)
        .attr("text-anchor", "middle").attr("alignment-baseline", "central");
}

function setCustomScale(domainArray, rangeArray) {
    scale.domain(domainArray).range(rangeArray);
}

function getSVGCoordinates() {
    return document.getElementById("svg").getBoundingClientRect();
}

function link(d) { // sourceX, sourceY, sourceWidth, targetX, targetY, dy, sy, ty
    var curvature = .6;
    var x0 = d.source.x + d.source.dx,
        x1 = d.target.x,
        xi = d3.interpolateNumber(x0, x1),
        x2 = xi(curvature),
        x3 = xi(1 - curvature),
        y0 = d.source.y + d.sy + d.dy / 2,
        y1 = d.target.y + d.ty + d.dy / 2;
    return "M" + x0 + "," + y0
        + "C" + x2 + "," + y0
        + " " + x3 + "," + y1
        + " " + x1 + "," + y1
        + "L" + x1 + "," + (y1+d.target.dy)
        + "C" + x3 + "," + (y1+d.target.dy)
        + " " + x2 + "," + (y0+d.source.dy)
        + " " + x0 + "," + (y0+d.source.dy)
        + "L" + x0 + "," + y0;
}

/*var matrix = this.getScreenCTM().translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));
 var l = (window.pageXOffset + matrix.e) +
 divTriangle.html(d)
 .style("left",  + "px")
 .style("top", (window.pageYOffset + matrix.f) + "px");*/