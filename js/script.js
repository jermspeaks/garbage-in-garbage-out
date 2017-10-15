var width = 960,
    height = 600;

var radius = d3.scaleSqrt()
    .domain([0, 1e6])
    .range([0, 10]);

var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

var states = svg.append("g").attr("class", "states");
var plot = svg.append("g").attr("class", "plot").attr("id", "plot");

var path = d3.geoPath().projection(projection);

// Take projection
var projection = d3.geoAlbersUsa();

function createStates() {
  d3.json("data/us-10m.v1.json", function(error, us) {
    if (error) throw error;

    states.selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
      .attr("d", path)
      .attr("fill", "#ccc");

    svg.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

  });
}

createStates();

d3.queue()
  .defer(d3.csv, "data/label_to_latlong.csv", typeLocation)
  .await(filterData);

/*
 * see airports.csv
 * convert gps coordinates to number and init degree
 */
function typeLocation(d) {
  d.longitude = +d.longitude;
  d.latitude = +d.latitude;
  d.degree = 0;
  return d;
}

function filterData(error, locations) {
  var byLabel = d3.map(locations, function(d) { return d.label; });
  console.log("Loaded " + byLabel.size() + " locations.");

  // // function to sort airports by degree
  // var bydegree = function(a, b) {
  //   return d3.descending(a.degree, b.degree);
  // };

  // // sort remaining airports by degree
  // locations.sort(bydegree);

  locations = locations.slice(0, 10);

  // calculate projected x, y pixel locations
  locations.forEach(function(d) {
    var coords = projection([d.longitude, d.latitude]);
    d.x = coords[0];
    d.y = coords[1];
  });

  console.log('locations', locations);

  drawData(byLabel.values());
}

function drawData(locations) {
  var line = d3.line()
    .curve(d3.curveBundle)
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });

  // var scale = d3.scaleSqrt()
  //   .domain(d3.extent(airports, function(d) { return d.degree; }))
  //   .range([radius.min, radius.max]);


  plot.append("g").attr("id", "locations")
    .selectAll("circle.locations")
    .data(locations)
    .enter()
    .append("circle")
    // .attr("r", function(d) { return scale(d.degree); })
    .attr("r", 10)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .style("fill", "white")
    .text(d => {console.log(d); return d.label;})
    // .style("opacity", 0.6)
    .style("stroke", "#252525");

  // svg.selectAll(".subunit-label")
  //   .data(subunits.features)
  //   .enter().append("text")
  //   .attr("class", function(d) { return "subunit-label " + d.id; })
  //   .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
  //   .attr("dy", ".35em")
  //   .text(function(d) { return d.properties.name; });
}
