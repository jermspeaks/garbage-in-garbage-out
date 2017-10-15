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

var path = d3.geoPath();

// Take projection
var projection = d3.geoAlbersUsa();

function createStates() {
  var projection = d3.geoAlbersUsa();
  var path = d3.geoPath()
    .projection(projection);

  d3.json("data/us.json", function(error, us) {
    if (error) throw error;

    states.selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
      .attr("d", path)
      .attr("fill", "#ccc");

    // svg.append("path")
    //     .attr("class", "states")
    //     .datum(topojson.feature(us, us.objects.states))
    //     .attr("d", path);
  });   

  // d3.json("data/us-10m.v1.json", function(error, us) {
  //   if (error) throw error;

    // states.selectAll("path")
    //   .data(topojson.feature(us, us.objects.states).features)
    //   .enter().append("path")
    //   .attr("d", path)
    //   .attr("fill", "#ccc");

  //   svg.append("path")
  //     .attr("class", "state-borders")
  //     .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

  // });
}

createStates();

d3.queue()
  .defer(d3.csv, "data/labels.csv", typeLocation)
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

function filterData(error, locations) {
  var byName = d3.map(locations, function(d) { return d.name; });
  console.log("Loaded " + byName.size() + " locations.");

  // // function to sort airports by degree
  // var bydegree = function(a, b) {
  //   return d3.descending(a.degree, b.degree);
  // };

  // // sort remaining airports by degree
  // locations.sort(bydegree);

  locations = locations.slice(0, 20);

  // calculate projected x, y pixel locations
  // locations = locations.map(d => {
  //   var coords = projection([d.longitude, d.latitude]);
  //   d.x = coords[0];
  //   d.y = coords[1];
  //   return d;
  // })
  locations.forEach(function(d) {
    var coords = projection([d.longitude, d.latitude]);
    d.x = coords[0];
    d.y = coords[1];
  });

  console.log('locations', locations);

  drawData(locations);
}

function drawData(locations) {
  // var line = d3.line()
  //   .curve(d3.curveBundle)
  //   .x(function(d) { return d.x; })
  //   .y(function(d) { return d.y; });

  // var elemEnter = elem.enter()
  //     .append("g")
  //     .attr("transform", function(d){return "translate("+d.x+",80)"})
 
  //   /*Create the circle for each block */
  //   var circle = elemEnter.append("circle")
  //     .attr("r", function(d){return d.r} )
  //     .attr("stroke","black")
  //     .attr("fill", "white")
 
  //   /* Create the text for each block */
  //   elemEnter.append("text")
  //     .attr("dx", function(d){return -20})
  //     .text(function(d){return d.label})


  var locationGroup = plot.append("g").attr("id", "locations")
    .selectAll("circle.locations")
    .data(locations)
    .enter();

  locationGroup.append("circle")
    .attr("r", 10)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .style("fill", "white")
    .text(d => d.name)
    // .style("opacity", 0.6)
    .style("stroke", "#252525");

  locationGroup.append("text")
    .attr("class", "location-text")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });

  // plot.selectAll(".location-text")
  //   .data(locations)
  //   .enter().append("text")
  //   .attr("class", function(d) { return "subunit-label " + d.id; })
  //   .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
  //   .attr("dy", ".35em")
  //   .text(function(d) { return d.properties.name; });
}
