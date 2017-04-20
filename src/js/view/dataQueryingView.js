/**
 * Created by Mike on 05-Apr-17.
 */

const svgId = "dataQueryingSVG";
const svgWidth = 1400;
const svgHeight = 500;

const rectHeight = 30;
const rectInterspace = 20;

function initDrawing() {
    d3.select("#dataQueryingView").append("svg").attr("id", svgId).attr("width", svgWidth).attr("height", svgHeight)
        .attr("viewbox", "0 0 400 400");
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
    getGroup(groupId).append("foreignObject").attr("x", x).attr("y", y)
        .append("xhtml:body").append("xhtml:input").attr("type", "text").attr("placeholder", text);
}

function drawRect(groupId, id, x, y, w, h = rectHeight) {
    return getGroup(groupId).append("rect").attr("id", id).attr("x", x).attr("y", y).attr("width", w).attr("height", h);
}

function drawText(groupId, x, y, text) {
    return getGroup(groupId).append("text").text(text.toLowerCase()).attr("x", x).attr("y", y);
}

function drawPath(groupId, x, y, w, h = rectInterspace) {
    let d = composePathD(x, y, w, x, y - h);
    return getGroup(groupId).append("path").attr("d", d);
}

function composePathD(x, y, w, parentX, parentY) {
    return `M ${parentX},${parentY}  H ${parentX + w}  L ${x + w},${y}  H ${x}  Z`;
}

function drawDivider(groupId, x1, y1, x2, y2) {
    d3.select(`#${groupId}`).append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
}

function markElement(elementId, cssText) {
    let element = document.getElementById(elementId);
    if (element) {
        element.style.cssText = cssText;
    }
}

function clearGroup(groupId) {
    let group = document.getElementById(groupId);
    group.parentNode.removeChild(group);
}