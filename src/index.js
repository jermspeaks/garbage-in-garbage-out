import * as d3 from "d3";
import * as colors from "./constants/colors";
import * as legend from "./components/legend";
import * as topojson from "topojson";
import { createSvg, createSvgGroup } from "./setup";
import { default as stateList } from "./stateList";
import { legendColor, legendSize } from "d3-svg-legend";

const svg = createSvg(".chart");
const states = createSvgGroup(svg, "states", "states");
const plot = createSvgGroup(svg, "plot", "plot");
const lineGraph = createSvgGroup(svg, "lines", "lines");
const locationGroup = createSvgGroup(svg, "locations", "locations");

function createColorLegend() {
  const colorLineLegend = createSvgGroup(svg, "color-legend", "color-legend");

  const ordinal = legend.createScaleOrdinal(["SENT", "RECEIVED"]);
  const legendOrdinal = legend.createOrdinalGenerator(ordinal);

  return colorLineLegend
    .attr("transform", "translate(20,20)")
    .call(legendOrdinal);
}

createColorLegend();

var path = d3.geoPath();

// Take projection
var projection = d3.geoAlbersUsa();

function createStates() {
  var projection = d3.geoAlbersUsa();
  var path = d3.geoPath().projection(projection);

  d3.json("data/us.json", function(error, us) {
    if (error) throw error;

    states
      .selectAll("path")
      // .data(topojson.feature(us, us.objects.states, (a, b) => a !== b && a.id !== "IRL").features)
      .data(topojson.feature(us, us.objects.states).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "subunit-boundary")
      .attr("fill", colors.MAP_COLOR)
      .attr("stroke", colors.STATE_BORDER_COLOR);

    // svg.append("path")
    //   .data(topojson.feature(us, uk.objects.states, (a, b) => a === b && a.id === "IRL").features)
    //   .attr("d", path)
    //   .attr("class", "subunit-boundary IRL");
  });
}

createStates();

var selector = document.getElementById("select-location");

selector.onchange = evt => {
  var chosenLocation = evt.target.value;

  update(chosenLocation);
};

function update(chosenLocation) {
  d3
    .queue()
    .defer(d3.csv, "data/labels.csv", typeLocation)
    // .defer(d3.csv, "data/trash.csv")
    .defer(d3.json, "data/waste-cleaned.json")
    .defer(d3.json, "data/received-waste.json")
    .await(filterData);

  /*
   * see airports.csv
   * convert gps coordinates to number and init degree
   */
  function typeLocation(d) {
    d.longitude = +d.long;
    d.latitude = +d.lat;
    d.degree = 0;
    return d;
  }

  function filterTrash(source, trashData) {
    // const source = "AlbanyNY";
    var city = trashData.filter(d => d.Name === source);
    var foundCity = city[0];
    var final = [];
    for (var k in foundCity) {
      if (foundCity.hasOwnProperty(k) && k !== "Name") {
        var nextDest = {
          source: source,
          dest: k,
          weight: foundCity[k]
        };

        final.push(nextDest);
      }
    }

    return final;
  }

  function filterRTrash(source, trashData) {
    // const source = "AlbanyNY";
    var city = trashData.filter(d => d.Name === source);
    var foundCity = city[0];
    var final = [];
    for (var k in foundCity) {
      if (foundCity.hasOwnProperty(k) && k !== "Name") {
        var nextDest = {
          source: k,
          dest: source,
          weight: foundCity[k]
        };

        final.push(nextDest);
      }
    }

    return final;
  }

  function filterData(error, locations, trashData, receivedTrashData) {
    // console.log('locations', typeof locations);
    // console.log('trashData', typeof trashData);
    // console.log('receivedTrashData', typeof receivedTrashData);
    var trash = filterTrash(chosenLocation, trashData);
    var rTrash = filterRTrash(chosenLocation, receivedTrashData);
    // console.log("sent trash", trash);
    // console.log("received trash", rTrash);
    var nodes = [];
    var links = [];

    trash.forEach(t => {
      // --- Add paths
      // Format of object is an array of objects, each containing
      //  a type (LineString - the path will automatically draw a greatArc)
      //  and coordinates
      var linked = {
        type: "LineString",
        coordinates: []
      };

      var foundSource = nodes.find(n => n.name && n.name === t.source);
      var foundDest = nodes.find(n => n.name && n.name === t.dest);

      if (!foundSource) {
        var city = locations.find(l => l.name === t.source);
        try {
          var coords = projection([city.longitude, city.latitude]);
          city.x = coords[0];
          city.y = coords[1];
          city.weight = t.weight;
          city.color = colors.SENDING_COLOR;

          nodes.push(city);
          linked.source = city;
        } catch (error) {
          // console.log("source", t.source, city, error);
          // linked.coordinates.push([city.longitude, city.latitude]);
        }
      } else {
        foundSource.weight = t.weight;
        foundSource.color = colors.SENDING_COLOR;
        linked.source = foundSource;
        // linked.coordinates.push([foundSource.longitude, foundSource.latitude]);
      }

      if (!foundDest) {
        var city = locations.find(l => l.name === t.dest);
        try {
          var coords = projection([city.longitude, city.latitude]);
          city.x = coords[0];
          city.y = coords[1];
          city.weight = t.weight;
          city.color = colors.SENDING_COLOR;

          nodes.push(city);
          linked.target = city;
        } catch (error) {
          // console.log("destination", t.dest, city, error);
        }
        // linked.coordinates.push([city.longitude, city.latitude]);
      } else {
        // linked.coordinates.push([foundDest.longitude, foundDest.latitude]);
        foundDest.weight = t.weight;
        foundDest.color = colors.SENDING_COLOR;
        linked.target = foundDest;
      }

      links.push(linked);
    });

    rTrash.forEach(t => {
      // --- Add paths
      // Format of object is an array of objects, each containing
      //  a type (LineString - the path will automatically draw a greatArc)
      //  and coordinates
      var linked = {
        type: "LineString",
        coordinates: []
      };

      var foundSource = nodes.find(n => n.name && n.name === t.source);
      var foundDest = nodes.find(n => n.name && n.name === t.dest);

      // console.log("foundSource", foundSource);

      if (!foundSource) {
        var city = locations.find(l => l.name === t.source);
        // console.log("locations", t.source);
        // console.log("city", city);
        var coords = projection([city.longitude, city.latitude]);
        city.x = coords[0];
        city.y = coords[1];
        city.weight = t.weight;
        city.color = colors.RECEIVING_COLOR;

        nodes.push(city);
        linked.source = city;
        // linked.coordinates.push([city.longitude, city.latitude]);
      } else {
        foundSource.weight = t.weight;
        foundSource.color = colors.RECEIVING_COLOR;
        linked.source = foundSource;
        // linked.coordinates.push([foundSource.longitude, foundSource.latitude]);
      }

      if (!foundDest) {
        var city = locations.find(l => l.name === t.dest);
        var coords = projection([city.longitude, city.latitude]);
        city.x = coords[0];
        city.y = coords[1];
        city.weight = t.weight;
        city.color = colors.RECEIVING_COLOR;

        nodes.push(city);
        linked.target = city;
        // linked.coordinates.push([city.longitude, city.latitude]);
      } else {
        // linked.coordinates.push([foundDest.longitude, foundDest.latitude]);
        foundDest.weight = t.weight;
        foundDest.color = colors.RECEIVING_COLOR;
        linked.target = foundDest;
      }

      links.push(linked);
    });

    // var byName = d3.map(locations, function(d) { return d.name; });
    // console.log("Loaded " + byName.size() + " locations.");

    // // function to sort airports by degree
    // var bydegree = function(a, b) {
    //   return d3.descending(a.degree, b.degree);
    // };

    // // sort remaining airports by degree
    // locations.sort(bydegree);

    // locations = locations.slice(0, 20);

    // calculate projected x, y pixel locations
    // locations = locations.map(d => {
    //   var coords = projection([d.longitude, d.latitude]);
    //   d.x = coords[0];
    //   d.y = coords[1];
    //   return d;
    // })
    // nodes.forEach(function(d) {
    //   var coords = projection([d.longitude, d.latitude]);
    //   d.x = coords[0];
    //   d.y = coords[1];
    // });

    // console.log("locations", nodes, links);

    drawData(nodes, links);
  }

  function drawLocationCircles(locations, settings) {
    var t = d3.transition().duration(1000);
    // console.log('drawLocationCircles', locations);

    var update = locationGroup.selectAll('circle')
      .data(locations, d => d.name);

    // Remove old circles
    update.exit()
      .transition(t)
      .attr("r", 0)
      .remove();

    // Add new circles in
    update
      .enter()
      .append('circle')
      .attr("class", "location")
      .attr("r", 0)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .style("fill", colors.FILL_COLOR)
      .style("stroke", "#252525")
      .transition(t)
      .delay(update.exit().size() ? 1000 : 0)
      .attr("r", d => settings.radiusRange(d.weight));
  }

  function drawLocationText(locations, settings) {
    var t = d3.transition().duration(1000);

    var update = locationGroup.selectAll('text')
      .data(locations, d => d.name);

    // Remove old circles
    update.exit()
      .transition(t)
      .attr("font-size", "0.1em")
      .remove();

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
    var t = d3.transition().duration(1000);

    console.log('lineData', lineData);

    // The line SVG Path we draw
    var update = lineGraph
      .selectAll("path")
      .data(lineData, d => d.name);

    update.exit()
      .transition(t)
      .attr("stroke-width", 0)
      .remove();

    update
      .enter()
      .append("path")
      .attr("d", d => settings.lineFunction(d.lineData))
      .attr("stroke-width", 0)
      .attr("fill", "none")
      .transition(t)
      .delay(update.exit().size() ? 1000 : 0)
      .attr("stroke", d => d.target.color)
      .attr("stroke-width", d => settings.lineWidthRange(+d.target.weight) + "px");
  }

  function drawLegend(settings) {
    var t = d3.transition().duration(1000);

    console.log('drawLegend');

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

    svg.select(".legendSizeLine")
      .call(legendSizeLine);
  }

  function drawData(locations, links) {
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
    drawLocationText(locations, settings);
    drawBetweenLines(lineData, settings);
    drawLegend(settings)
  }
}
