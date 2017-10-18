import * as d3 from 'd3';
import * as dimensions from './constants/dimensions';

/**
 * Creates SVG
 * @return {HTML_Element} <svg> element
 */
function createSvg() {
	return d3.select("body")
	    .append("svg")
	    .attr("width", dimensions.WIDTH) 
	    .attr("height", dimensions.HEIGHT);
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

export {
	createSvg,
	createSvgGroup
};