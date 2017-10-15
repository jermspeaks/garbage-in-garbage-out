const MAP_COLOR = '#ddd';
const FILL_COLOR = '#5c6066';

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
      .attr("fill", MAP_COLOR);

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
  .defer(d3.csv, "data/trash.csv")
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

function filterData(error, locations, trash) {  
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

    var foundSource = nodes.find(n => n.name && (n.name === t.source));
    var foundDest = nodes.find(n => n.name && (n.name === t.dest));
    
    if (!foundSource) {
      var city = locations.find(l => l.name === t.source);
      var coords = projection([city.longitude, city.latitude]);
      city.x = coords[0];
      city.y = coords[1];
      city.weight = t.weight;

      nodes.push(city);
      linked.source = city;
      // linked.coordinates.push([city.longitude, city.latitude]);
    } else {
      foundSource.weight = t.weight;
      linked.source = foundSource;
      // linked.coordinates.push([foundSource.longitude, foundSource.latitude]);
    }

    if (!foundDest) {
      var city = locations.find(l => l.name === t.dest);
      var coords = projection([city.longitude, city.latitude]);
      city.x = coords[0];
      city.y = coords[1];
      city.weight = t.weight;

      nodes.push(city);
      linked.target = city; 
      // linked.coordinates.push([city.longitude, city.latitude]);
    } else {
      // linked.coordinates.push([foundDest.longitude, foundDest.latitude]);
      foundDest.weight = t.weight;
      linked.target = foundDest
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

  console.log('locations', nodes, links);

  drawData(nodes, links);
}

function drawData(locations, links) {
  var line = d3.line()
    .curve(d3.curveBundle)
    .x(d => d.x)
    .y(d => d.y);

  var locationGroup = plot.append("g").attr("id", "locations")
    .selectAll("circle.locations")
    .data(locations)
    .enter();

  locationGroup.append("circle")
    .attr("r", 5)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .style("fill", FILL_COLOR)
    .text(d => d.name)
    // .style("opacity", 0.6)
    .style("stroke", "#252525");

  locationGroup.append("text")
    .attr("class", "location-text")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("dx", ".5em")
    .attr("dy", "1em")
    .text(d => d.name.slice(0, d.name.length - 2));

  // function link(d) {
  //   return "M" + d.source.y + "," + d.source.x
  //       + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
  //       + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
  //       + " " + d.target.y + "," + d.target.x;
  // }
  // Standard enter / update 
  // var path = d3.geoPath()
  //   .projection(projection);

  // var arcGroup = plot.append("g").attr("id", "arcs");

  // var pathArcs = arcGroup.selectAll(".arc")
  //     .data(links);

  // //enter
  // pathArcs.enter()
  //     .append("path")
  //     .attr('class', 'arc')
  //     .style('fill', 'none');

  // //update
  // pathArcs.attr('d', path)
  //   .style('stroke', '#0000ff')
  //   .style('stroke-width', '2px');
  //     // Uncomment this line to remove the transition
  //     // .call(lineTransition); 

  // //exit
  // pathArcs.exit().remove();
  
  var maxDomain = d3.max(links, l => +l.target.weight);
  
  var lineWidthRange = d3.scaleLinear()
    .domain([0, maxDomain])
    .range([0, 5]);


  var lineGroup = plot.append("g").attr("id", "links")
    .selectAll("line.link")
    .data(links)  
    .enter();

  lineGroup.append("line")
      // .attr("r", d => d.weight)
      .attr("stroke", FILL_COLOR)
      .attr("stroke-width", d => lineWidthRange(+d.target.weight) + 'px')
      .attr("x1", function (d){ return d.source.x; })
      .attr("y1", function (d){ return d.source.y; })
      .attr("x2", function (d){ return d.target.x; })
      .attr("y2", function (d){ return d.target.y; });
   
  // var link = d3.linkHorizontal()
  //   .x(function(d) { return d.y; })
  //   .y(function(d) { return d.x; });

  // var custPath = d3.path();
  // path.moveTo(1, 2);
  // path.lineTo(3, 4);
  // path.closePath();
  // // 
  // // var diagonal = d3.svg.diagonal()
  // //   .source(function (d) { return { x: d[0].y, y: d[0].x }; })            
  // //   .target(function (d) { return { x: d[1].y, y: d[1].x }; })
  // //   .projection(function (d) { return [d.y, d.x]; });
     
  // var linkGroup = plot.append("g").attr("id", "links")
  //   .selectAll("circle.links")
  //   .data(links)
  //   .enter();

  // linkGroup.append("path")
  //   .attr('class', 'link')
  //   .attr("d", link)    
  //   .style("fill", "white")
  //   // .text(d => d.name)
  //   .attr('stroke', '#444')
  //   .attr('stroke-width', 2)
  //   .attr('fill', 'none');

  // plot.selectAll(".location-text")
  //   .data(locations)
  //   .enter().append("text")
  //   .attr("class", function(d) { return "subunit-label " + d.id; })
  //   .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
  //   .attr("dy", ".35em")
  //   .text(function(d) { return d.properties.name; });
}
