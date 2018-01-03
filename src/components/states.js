import * as d3 from "d3";
import { createSvgGroup } from "../setup";
import * as topojson from "topojson";
import * as colors from "../constants/colors";

function createStates(svg) {
  const states = createSvgGroup(svg, "states", "states");
  const projection = d3.geoAlbersUsa();
  const path = d3.geoPath().projection(projection);

  d3.json("data/us.json", function(error, us) {
    if (error) throw error;

    states
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "subunit-boundary")
      .attr("fill", colors.MAP_COLOR)
      .attr("stroke", colors.STATE_BORDER_COLOR);
  });
}

export default createStates;