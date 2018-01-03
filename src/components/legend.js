import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend'
import { createSvgGroup } from "../setup";
import * as colors from '../constants/colors';

function createScaleOrdinal(list) {
  return d3.scaleOrdinal()
    .domain(list)
    .range([colors.SENDING_COLOR, colors.RECEIVING_COLOR]);  
}

function createOrdinalGenerator(ordinal) {
  return legendColor()
    .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
    .shapePadding(10)
    //use cellFilter to hide the "e" cell
    .cellFilter(function(d){ return d.label !== "e" })
    .scale(ordinal);
}

function createColorLegend(svg) {
  const colorLineLegend = createSvgGroup(svg, "color-legend", "color-legend");

  const ordinal = createScaleOrdinal(["SENT", "RECEIVED"]);
  const legendOrdinal = createOrdinalGenerator(ordinal);

  return colorLineLegend
    .attr("transform", "translate(20,20)")
    .call(legendOrdinal);
}

export default createColorLegend;