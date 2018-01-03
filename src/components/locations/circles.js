import { scaleLinear, transition } from "d3";
import { createSvgGroup } from "../../setup";
import * as colors from "../../constants/colors";

const createRadiusRange = maxDomain => scaleLinear()
	.domain([0, maxDomain])
	.range([1, 6]);

export function drawCircles({ data, svg, maxDomain }) {
	if (!svg) {
		svg = createSvg(".chart");
	}
	const radiusRange = createRadiusRange(maxDomain)

	const locationCircleGroup =
		svg.select(".locations-circles").size() > 0
			? svg.select(".locations-circles")
			: createSvgGroup(svg, "locations-circles", "locations-circles");
	var t = transition().duration(1000);

	var updatedLocations = data.map(l =>
		Object.assign({}, l, {
			radiusSize: radiusRange(l.weight)
		})
	);

	var update = locationCircleGroup
		.selectAll("circle")
		.data(updatedLocations, d => d.name);

	// Remove old circles
	update
		.exit()
		.transition(t)
		.attr("r", 0)
		.remove();

	// Update any remaining circles to their new radius
	update
		.transition(t)
		.delay(1000)
		.attr("r", d => d.radiusSize);

	// Add new circles in
	update
		.enter()
		.append("circle")
		.attr("class", "location")
		.attr("r", 0)
		.attr("cx", d => d.x)
		.attr("cy", d => d.y)
		.style("fill", colors.FILL_COLOR)
		.style("stroke", "#252525")
		.transition(t)
		.delay(update.exit().size() ? 1000 : 0)
		.attr("r", d => d.radiusSize);
}