
/**
 * Creates arrow marker
 * @param  {[type]} svg   [description]
 * @param  {[type]} color [description]
 * @return {[type]}       [description]
 */
function createArrowMarker(svg, color) {
  return svg.append('svg:defs')
    .append('svg:marker')
    .attr('id', 'marker_arrow')
    .attr('markerHeight', 5)
    .attr('markerWidth', 5)
    .attr('markerUnits', 'strokeWidth')
    .attr('orient', 'auto')
    .attr('refX', 0)
    .attr('refY', 0)
    .attr('viewBox', '-5 -5 10 10')
    .append('svg:path')
      .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
      .attr('fill', color);
}

export {
	createArrowMarker
};