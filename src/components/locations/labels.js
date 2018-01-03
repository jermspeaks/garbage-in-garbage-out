import * as d3 from "d3";
import { createSvg, createSvgGroup } from "../../setup";
import { default as stateList } from "../../stateList";

const createFontRange = maxDomain => d3.scaleLinear()
	.domain([0, maxDomain])
	.range([5, 10]);

export function drawLabels({ data, svg, store, maxDomain }) {
	if (!svg) {
		svg = createSvg(".chart");
	}

	const fontRange = createFontRange(maxDomain);

	const locationLabelGroup =
		svg.select(".locations-label").size() > 0
			? svg.select(".locations-label")
			: createSvgGroup(svg, "locations-label", "locations-label");
	var t = d3.transition().duration(1000);
	const chosenLocation = store.get("chosenLocation");

	var update = locationLabelGroup
		.selectAll("text")
		.data(data, d => d.name);

	// Remove old circles
	update
		.exit()
		.transition(t)
		.attr("font-size", "0.1em")
		.remove();

	update
		.transition(t)
		.delay(1000)
		.attr(
			"font-size",
			d =>
				d.name === chosenLocation
					? "1em"
					: fontRange(d.weight) >= 10
						? "1em"
						: `${fontRange(d.weight) / 10}em`
		);

	update
		.enter()
		.append("text")
		.attr("class", "location-text")
		.attr("x", d => d.x)
		.attr("y", d => d.y)
		.attr("dx", ".5em")
		.attr("dy", "1em")
		.attr("font-size", "0.1em")
		.transition(t)
		.delay(update.exit().size() ? 1000 : 0)
		.attr(
			"font-size",
			d =>
				d.name === chosenLocation
					? "1em"
					: fontRange(d.weight) >= 10
						? "1em"
						: `${fontRange(d.weight) / 10}em`
		)
		.text(d => {
			if (d.name.indexOf("other") >= 0) {
				let fullState = stateList.find(
					s => s.abbreviation === d.name.replace(/^other/, "")
				);
				return fullState.name;
			} else {
				return (
					d.name
						.slice(0, d.name.length - 2)
						// insert a space before all caps
						.replace(/([A-Z])/g, " $1")
						// uppercase the first character
						.replace(/^./, str => str.toUpperCase())
				);
			}
		});
}