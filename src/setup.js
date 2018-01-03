import { select } from 'd3';
import * as dimensions from './constants/dimensions';
import * as legend from "./components/legend";

/**
 * Creates SVG
 * @return {HTML_Element} <svg> element
 */
function createSvg(selector) {
	return select(selector)
	  .append("svg")
	    .attr('width', dimensions.WIDTH + dimensions.MARGIN.left + dimensions.MARGIN.right)
	    .attr('height', dimensions.HEIGHT + dimensions.MARGIN.top + dimensions.MARGIN.bottom)
	    .call(responsivefy)
	  .append('g')
	    .attr('transform', `translate(${dimensions.MARGIN.left}, ${dimensions.MARGIN.top})`);
}

/**
 * Creates <g> element within <svg>
 * @param  {HTML_Element} svg   <svg> element
 * @param  {String} className 	Class attribute for group element
 * @param  {String} id        	Id attribute for group element
 * @return {HTML_Element}       <g> element
 */
function createSvgGroup(svg, className, id) {
	return svg.append('g')
		.attr('class', className)
		.attr('id', id);
}

function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = select(svg.node().parentNode),
      width = parseInt(svg.style("width")),
      height = parseInt(svg.style("height")),
      aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMid")
      .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
      var targetWidth = parseInt(container.style("width"));
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
  }
}

export {
	createSvg,
	createSvgGroup,
  createColorLegend
};