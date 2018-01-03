import * as d3 from "d3";
import { createSvg, createSvgGroup } from "../../setup";

// This is the accessor function we talked about above
const lineFunction = d3.line()
	.x(function(d) {
		return d.x;
	})
	.y(function(d) {
		return d.y;
	});

const createLineWidthRange = maxDomain => d3.scaleLinear()
	.domain([0, maxDomain])
	.range([1, 6]);

// var curvedLine = d3.line()
// 	.curve(d3.curveBundle)
// 	.x(d => d.x)
// 	.y(d => d.y);


export function drawLinks({ data, svg, maxDomain }) {
	if (!svg) {
		svg = createSvg(".chart");
	}

	const lineWidthRange = createLineWidthRange(maxDomain)

	const lineGraph =
		svg.select(".lines").size() > 0
			? svg.select(".lines")
			: createSvgGroup(svg, "lines", "lines");
	const t = d3.transition().duration(1000);

	var nextLineData = data.map(l =>
		Object.assign({}, l, {
			strokeWidth: lineWidthRange(+l.target.weight) + "px"
		})
	);

	// The line SVG Path we draw
	var update = lineGraph.selectAll("path").data(nextLineData, d => d.name);

	update
		.exit()
		.transition(t)
		.attr("opacity", 0)
		.remove();

	update
		.transition(t)
		.delay(1000)
		.attr("stroke-width", d => d.strokeWidth)
		.attr("stroke", d => d.target.color);

	update
		.enter()
		.append("path")
		.attr("d", d => lineFunction(d.lineData))
		.attr("opacity", 0)
		.attr("fill", "none")
		.attr("stroke", d => d.target.color)
		.attr("stroke-width", d => d.strokeWidth)
		.transition(t)
		.delay(update.exit().size() ? 1000 : 0)
		.attr("opacity", 1);
}