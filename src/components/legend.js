import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend'
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

export {
  createScaleOrdinal,
  createOrdinalGenerator
}