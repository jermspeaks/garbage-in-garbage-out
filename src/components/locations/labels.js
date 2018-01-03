import * as d3 from "d3";
import { createSvg, createSvgGroup } from "../../setup";
import { default as stateList } from "../../stateList";
import { WIDTH, HEIGHT } from "../../constants/dimensions";

const createFontRange = maxDomain =>
	d3
		.scaleLinear()
		.domain([0, maxDomain])
		.range([5, 10]);

export function drawLabels({ data, svg, store, maxDomain }) {
	if (!svg) {
		svg = createSvg(".chart");
	}

	const noDuplicateData = data.filter((v, i, a) => a.findIndex(s => s.name === v.name) === i);

	console.log('data', data);
	console.log('noDuplicateData', noDuplicateData);

	const fontRange = createFontRange(maxDomain);

	const locationLabelGroup =
		svg.select(".locations-label").size() > 0
			? svg.select(".locations-label")
			: createSvgGroup(svg, "locations-label", "locations-label");
	var t = d3.transition().duration(1000);
	const chosenLocation = store.get("chosenLocation");

	var voronoiInstance = d3
		.voronoi()
		.extent([[-1, -1], [WIDTH + 1, HEIGHT + 1]]);
	var cells = voronoiInstance.polygons(noDuplicateData.map(d => [d.x, d.y]));

	console.log("cells", cells);

	var updatedCells = cells.map(d => Object.assign({}, d, {
		orient: (function() {
			var centroid = d3.polygonCentroid(d),
				point = d.data,
				angle = Math.round(
					Math.atan2(centroid[1] - point[1], centroid[0] - point[0]) /
						Math.PI *
						2
				);
	
			return angle === 0
						? "right"
						: angle === -1
							? "top"
							: angle === 1 ? "bottom" : "left";
		})()
	}));

	console.log("updatedCells", updatedCells);

	var orientedLabelData = noDuplicateData.map((d, i) => Object.assign({}, d, { orient: updatedCells[i] ? updatedCells[i].orient : "left" }));
	console.log('orientedLabelData', orientedLabelData);

	// svg
	// 	.append("g")
	// 	.attr("class", "label")
	// 	.selectAll("text")
	// 	.data(cells)
	// 	.enter()
	// 	.append("text")
	// 	.attr("class", d => {
	// 		var centroid = d3.polygonCentroid(d),
	// 			point = d.data,
	// 			angle = Math.round(
	// 				Math.atan2(centroid[1] - point[1], centroid[0] - point[0]) /
	// 					Math.PI *
	// 					2
	// 			);
	// 		return (
	// 			"label--" +
	// 			(d.orient =
	// 				angle === 0
	// 					? "right"
	// 					: angle === -1
	// 						? "top"
	// 						: angle === 1 ? "bottom" : "left")
	// 		);
	// 	})
	// 	.attr("transform", d => `translate(${d.data})`)
	// 	.attr(
	// 		"dy",
	// 		d =>
	// 			d.orient === "left" || d.orient === "right"
	// 				? ".35em"
	// 				: d.orient === "bottom" ? ".71em" : null
	// 	)
	// 	.attr(
	// 		"x",
	// 		d => (d.orient === "right" ? 6 : d.orient === "left" ? -6 : null)
	// 	)
	// 	.attr(
	// 		"y",
	// 		d => (d.orient === "bottom" ? 6 : d.orient === "top" ? -6 : null)
	// 	)
	// 	.text((d, i) => i);

	var update = locationLabelGroup.selectAll("text").data(orientedLabelData, d => d.name);

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
		.attr("class", d => `location-text location-label--${d.orient}`)
		.attr("x", d => d.x)
		.attr("y", d => d.y)
		.attr("dx", d => {
			if (d.orient === "left") {
				return "-0.5em";
			} else if (d.orient === "right") {
				return "0.5em";
			}
		})
		.attr("dy", d => {
			if (d.orient === "top") {
				return "-0.3em";
			} else if (d.orient === "bottom") {
				return "0.3em";
			} else {
				return "0.25em";
			}
		})
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
