import {dataset} from 'util/util';

let svgHeight = 700;
let svgWidth = 1400;
let svg = d3.select("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

function appendNewBar(width) {

}