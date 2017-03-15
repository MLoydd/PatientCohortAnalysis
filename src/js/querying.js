//import {select, rgb, event} from 'd3';

var margin = {top: 1, right: 1, bottom: 6, left: 1};
var width = 1000 - margin.left - margin.right;
var height = 1500 - margin.top - margin.bottom;

var nodeHeight = 30;

function initDrawing() {
    d3.select("#chart")
        .append("svg").attr("id", "svg").attr("width", screen.width).attr("height", screen.height)
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

var propertyList = [];
function isPropertyExisting(propertyName) {
    for (var i in propertyList) {
        if (propertyList[i].toLowerCase() === propertyName.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function addNewProperty(propertyName) {
    propertyList.push(propertyName);

    var g = d3.select("#svg").append("g").attr("class", "node").attr("id", trimAllWhiteSpace(propertyName));

    var y = 15 + (propertyList.length - 1) * 100;
    g.append("text").text(propertyName).attr("x", 180).attr("y", y)
        .attr("text-anchor", "end").attr("alignment-baseline", "middle");
    g.append("line").attr("x1", 200).attr("y1", y).attr("x2", width).attr("y2", y);
}

function addNewNode(propertyName, query) {
    var g = d3.select("#" + trimAllWhiteSpace(propertyName));
    var rect = g.append("rect").attr("x", 225).attr("width", width - 250).attr("height", nodeHeight)
        .on("mouseover", displayTriangleElement)
        .on("mouseout", hideTriangleElement);

    g.append("text").text(query).attr("x", 225 + (width - 250) / 2).attr("y", nodeHeight / 2)
        .attr("text-anchor", "middle").attr("alignment-baseline", "central");
}

/*var matrix = this.getScreenCTM().translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));
 var l = (window.pageXOffset + matrix.e) +
 divTriangle.html(d)
 .style("left",  + "px")
 .style("top", (window.pageYOffset + matrix.f) + "px");*/