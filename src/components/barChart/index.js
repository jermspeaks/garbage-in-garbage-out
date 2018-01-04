import { createSvg } from "../../setup";
import * as d3 from "d3";
import * as colors from "../../constants/colors";
import * as dimensions from "../../constants/dimensions";

function initializeChart(selector) {
  var svg = d3.select(`${selector}-chart`);
  var margin = { top: 30, right: 100, bottom: 30, left: 100 };
  var width = 400 - margin.left - margin.right;
  var height = 300 - margin.top - margin.bottom;

  if (svg.size() === 0) {
    svg = createSvg(selector, {
      className: `${selector.substr(1)}-chart`,
      WIDTH: width,
      HEIGHT: height,
      MARGIN: margin
    });

    d3.select(`${selector}-title`)
      .style('visibility', 'inherit');
  }

  return {
    svg,
    margin,
    width,
    height
  };
}

/**
 * Draws bar chart
 * @param  {[type]} options.data     [description]
 * @param  {[type]} options.selector [description]
 * @return {[type]}                  [description]
 */
function drawBarChart({ data, selector }) {
  const maxColumns = 10;
  const sortedData = data
    .sort((a, b) => b.value - a.value)
    .slice(0, maxColumns);

  const { svg, margin, width, height } = initializeChart(selector);

  var t = d3.transition().duration(1000);
  var yScale = d3
    .scaleBand()
    .domain(sortedData.map(d => d.name))
    .range([0, height])
    .padding(0.2);

  var yAxis =
    svg.select(".bar-chart-y-axis").size() > 0
      ? svg.select(".bar-chart-y-axis")
      : svg
          .append("g")
          .attr("class", "bar-chart-y-axis")
          .attr("transform", `translate(${0}, 0)`)
          .call(d3.axisLeft(yScale));

  var xScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, width]);

  var xAxis =
    svg.select(".bar-chart-x-axis").size() > 0
      ? svg.select(".bar-chart-x-axis")
      : svg
          .append("g")
          .attr("class", "bar-chart-x-axis")
          .attr("transform", `translate(${0}, ${height})`)
          .call(d3.axisBottom(xScale));

  var column =
    svg.select(".bar-chart-columns").size() > 0
      ? svg.select(".bar-chart-columns")
      : svg.append("g").attr("class", "bar-chart-columns");

  var update = column
    .selectAll("rect")
    .data(sortedData.filter(d => d.value), d => d.name);

  update
    .exit()
    .transition(t)
    .attr("x", 0)
    .attr("width", 0)
    .remove();

  xScale.domain([0, d3.max(sortedData, d => d.value)]);
  xAxis
    .transition(t)
    .delay(1000)
    .call(d3.axisBottom(xScale));

  yAxis
    .transition(t)
    .delay(1000)
    .call(d3.axisLeft(yScale));

  update
    .transition(t)
    .delay(1000)
    // .attr("x", 0)
    .attr("y", d => yScale(d.name))
    .attr("width", d => xScale(d.value))
    .attr("height", d => yScale.bandwidth());
  // .attr("width", d => width - xScale(d.value));

  update
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("width", 0)
    .attr("y", d => yScale(d.name))
    .attr("height", d => yScale.bandwidth())
    .attr("fill", colors.BAR_FILL_COLOR)
    .transition(t)
    .delay(update.exit().size() ? 2000 : 0)
    .attr("width", d => xScale(d.value));
}

export { drawBarChart };
