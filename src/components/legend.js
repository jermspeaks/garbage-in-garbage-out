import { scaleOrdinal, symbol, symbolCircle, scaleLinear, transition } from 'd3';
import { legendColor, legendSize } from "d3-svg-legend";
import { createSvgGroup } from "../setup";
import * as colors from '../constants/colors';

function createScaleOrdinal(list) {
  return scaleOrdinal()
    .domain(list)
    .range([colors.SENDING_COLOR, colors.RECEIVING_COLOR]);  
}

function createOrdinalGenerator(ordinal) {
  return legendColor()
    .shape("path", symbol().type(symbolCircle).size(150)())
    .shapePadding(10)
    //use cellFilter to hide the "e" cell
    .cellFilter(function(d){ return d.label !== "e" })
    .scale(ordinal);
}

function drawColorLegend(svg) {
  const colorLineLegend = createSvgGroup(svg, "color-legend", "color-legend");

  const ordinal = createScaleOrdinal(["SENT", "RECEIVED"]);
  const legendOrdinal = createOrdinalGenerator(ordinal);

  return colorLineLegend
    .attr("transform", "translate(20,20)")
    .call(legendOrdinal);
}

const createLineSize = maxDomain => scaleLinear()
    .domain([0, maxDomain])
    .range([1, 6]);

function drawLinkGuideLegend({ svg, maxDomain }) {
  const lineSize = createLineSize(maxDomain)
  var t = transition().duration(1000);

  var update = svg.select("g.legendSizeLine");

  // Only remove if exists
  if (update.size() > 0) {
    update
      // .transition(t)
      // .attr("opacity", 0)
      .remove();
  }

  // Create New Legend
  svg
    .append("g")
    .attr("class", "legendSizeLine")
    .attr("transform", "translate(0, 500)");
  // .attr("opacity", 0)
  // .transition(t)
  // .delay(1000)
  // .attr("opacity", 1);

  var legendSizeLine = legendSize()
    .scale(lineSize)
    .shape("line")
    .orient("horizontal")
    //otherwise labels would have displayed:
    // 0, 2.5, 5, 10
    // .labels(["tiny testing at the beginning", "small", "medium", "large", "grand, all the way long label"])
    .labelWrap(30)
    .shapeWidth(40)
    .labelAlign("start")
    .shapePadding(10);

  svg.select(".legendSizeLine").call(legendSizeLine);
}

export {
  drawColorLegend,
  drawLinkGuideLegend
};