import * as d3 from "d3";
import { createSvgGroup } from "./setup";
import * as colors from "./constants/colors";
import { legendColor, legendSize } from "d3-svg-legend";
import { default as stateList } from "./stateList";

var _store;
var svg;

function drawLocationCircles(locations, settings) {
	const locationCircleGroup =
		svg.select(".locations-circles").size() > 0
			? svg.select(".locations-circles")
			: createSvgGroup(svg, "locations-circles", "locations-circles");
	var t = d3.transition().duration(1000);

	var updatedLocations = locations.map(l =>
		Object.assign({}, l, {
			radiusSize: settings.radiusRange(l.weight)
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

function drawLocationLabels(locations, settings) {
	const locationLabelGroup =
		svg.select(".locations-label").size() > 0
			? svg.select(".locations-label")
			: createSvgGroup(svg, "locations-label", "locations-label");
	var t = d3.transition().duration(1000);
	const chosenLocation = _store.get("chosenLocation");

	var update = locationLabelGroup
		.selectAll("text")
		.data(locations, d => d.name);

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
					: settings.fontRange(d.weight) >= 10
						? "1em"
						: `${settings.fontRange(d.weight) / 10}em`
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
					: settings.fontRange(d.weight) >= 10
						? "1em"
						: `${settings.fontRange(d.weight) / 10}em`
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

function drawBetweenLines(lineData, settings) {
	const lineGraph =
		svg.select(".lines").size() > 0
			? svg.select(".lines")
			: createSvgGroup(svg, "lines", "lines");
	const t = d3.transition().duration(1000);

	var nextLineData = lineData.map(l =>
		Object.assign({}, l, {
			strokeWidth: settings.lineWidthRange(+l.target.weight) + "px"
		})
	);

	// The line SVG Path we draw
	var update = lineGraph.selectAll("path").data(lineData, d => d.name);

	update
		.exit()
		.transition(t)
		.attr("opacity", 0)
		.remove();

	update
		.transition(t)
		.delay(1000)
		.attr("stroke-width", d => d.strokeWidth);

	update
		.enter()
		.append("path")
		.attr("d", d => settings.lineFunction(d.lineData))
		.attr("opacity", 0)
		.attr("fill", "none")
		.attr("stroke", d => d.target.color)
		.attr("stroke-width", d => d.strokeWidth)
		.transition(t)
		.delay(update.exit().size() ? 1000 : 0)
		.attr("opacity", 1);
}

function drawLegend(settings) {
	var t = d3.transition().duration(1000);

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
		.scale(settings.lineSize)
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

function drawData(locations, links, store) {
	_store = store;
	svg = _store.get('svg');
	var maxDomainTarget = d3.max(links, l => +l.target.weight);
	var maxDomainSource = d3.max(links, l => +l.source.weight);
	var maxDomainWithoutLimit =
		maxDomainTarget >= maxDomainSource ? maxDomainTarget : maxDomainSource;
	var maxDomain = maxDomainWithoutLimit <= 100 ? 100 : maxDomainWithoutLimit;

	var radiusRange = d3
		.scaleLinear()
		.domain([0, maxDomain])
		.range([3, 6]);

	var lineWidthRange = d3
		.scaleLinear()
		.domain([0, maxDomain])
		.range([1, 6]);

	var fontRange = d3
		.scaleLinear()
		.domain([0, maxDomain])
		.range([5, 10]);

	var curvedLine = d3
		.line()
		.curve(d3.curveBundle)
		.x(d => d.x)
		.y(d => d.y);

	//This is the accessor function we talked about above
	var lineFunction = d3
		.line()
		.x(function(d) {
			return d.x;
		})
		.y(function(d) {
			return d.y;
		});

	var lineData = links.map(l => {
		l.lineData = [
			{
				x: l.source.x,
				y: l.source.y
			},
			{
				x: l.target.x,
				y: l.target.y,
				weight: l.target.weight,
				color: l.target.color
			}
		];

		l.name = `${l.source.name}_${l.target.name}`;

		return l;
	});

	var lineSize = d3
		.scaleLinear()
		.domain([0, maxDomain])
		.range([1, 6]);

	var settings = {
		maxDomain,
		radiusRange,
		lineWidthRange,
		fontRange,
		curvedLine,
		lineFunction,
		lineSize
	};

	drawLocationCircles(locations, settings);
	drawLocationLabels(locations, settings);
	drawBetweenLines(lineData, settings);
	drawLegend(settings);
}

export default drawData;
