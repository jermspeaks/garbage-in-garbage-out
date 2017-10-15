const MAP_COLOR = '#ddd';
const STATE_BORDER_COLOR = '#fff';
const SENDING_COLOR = 'rgb(28,145,236)';
const RECEIVING_COLOR = 'rgb(236,28,36)';
// const FILL_COLOR = '#5c6066';
const FILL_COLOR = '#fff';

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
var lineGraph = svg.append("g").attr("class", "lines");
var locationGroup = plot.append("g").attr("id", "locations")

var ordinal = d3.scaleOrdinal()
  .domain(["SENT", "RECEIVED"])
  .range([SENDING_COLOR, RECEIVING_COLOR]);

svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(20,20)");

var legendOrdinal = d3.legendColor()
  //d3 symbol creates a path-string, for example
  //"M0,-8.059274488676564L9.306048591020996,
  //8.059274488676564 -9.306048591020996,8.059274488676564Z"
  .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
  .shapePadding(10)
  //use cellFilter to hide the "e" cell
  .cellFilter(function(d){ return d.label !== "e" })
  .scale(ordinal);

svg.select(".legendOrdinal")
  .call(legendOrdinal);


var markerArrow = svg.append('svg:defs')
    .append('svg:marker')
    .attr('id', 'marker_arrow')
    .attr('markerHeight', 5)
    .attr('markerWidth', 5)
    .attr('markerUnits', 'strokeWidth')
    .attr('orient', 'auto')
    .attr('refX', 0)
    .attr('refY', 0)
    .attr('viewBox', '-5 -5 10 10')
    .append('svg:path')
      .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
      .attr('fill', FILL_COLOR);

function lineTransition(path) {
  path.transition()
      //NOTE: Change this number (in ms) to make lines draw faster or slower
      .duration(5500)
      .attrTween("stroke-dasharray", tweenDash)
      .each("end", function(d,i) { 
          ////Uncomment following line to re-transition
          //d3.select(this).call(transition); 
          
          //We might want to do stuff when the line reaches the target,
          //  like start the pulsating or add a new point or tell the
          //  NSA to listen to this guy's phone calls
          //doStuffWhenLineFinishes(d,i);
      });
}

var tweenDash = function tweenDash() {
    //This function is used to animate the dash-array property, which is a
    //  nice hack that gives us animation along some arbitrary path (in this
    //  case, makes it look like a line is being drawn from point A to B)
    var len = this.getTotalLength(),
        interpolate = d3.interpolateString("0," + len, len + "," + len);

    return function(t) { return interpolate(t); };
};

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
      .attr("fill", MAP_COLOR)
      .attr('stroke', STATE_BORDER_COLOR);

    // svg.append("path")
    //     .attr("class", "states")
    //     .datum(topojson.feature(us, us.objects.states).features)
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

var selector = document.getElementById('select-location');

selector.onchange = evt => {
  var chosenLocation = evt.target.value;

  update(chosenLocation);
}

function update(chosenLocation) {
  d3.queue()
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
      if (foundCity.hasOwnProperty(k) && k !== 'Name') {
        var nextDest = {
          source: source,
          dest: k,
          weight: foundCity[k]
        }
        
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
      if (foundCity.hasOwnProperty(k) && k !== 'Name') {
        var nextDest = {
          source: k,
          dest: source,
          weight: foundCity[k]
        }
        
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
    console.log('sent trash', trash);
    console.log('received trash', rTrash);
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
        city.color = SENDING_COLOR;

        nodes.push(city);
        linked.source = city;
        // linked.coordinates.push([city.longitude, city.latitude]);
      } else {
        foundSource.weight = t.weight;
        foundSource.color = SENDING_COLOR;
        linked.source = foundSource;
        // linked.coordinates.push([foundSource.longitude, foundSource.latitude]);
      }

      if (!foundDest) {
        var city = locations.find(l => l.name === t.dest);
        var coords = projection([city.longitude, city.latitude]);
        city.x = coords[0];
        city.y = coords[1];
        city.weight = t.weight;
        city.color = SENDING_COLOR;

        nodes.push(city);
        linked.target = city; 
        // linked.coordinates.push([city.longitude, city.latitude]);
      } else {
        // linked.coordinates.push([foundDest.longitude, foundDest.latitude]);
        foundDest.weight = t.weight;
        foundDest.color = SENDING_COLOR;
        linked.target = foundDest
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

      var foundSource = nodes.find(n => n.name && (n.name === t.source));
      var foundDest = nodes.find(n => n.name && (n.name === t.dest));

      console.log('t', t);
      console.log('foundSource', foundSource);
      
      if (!foundSource) {
        var city = locations.find(l => l.name === t.source);
        console.log('locations', t.source);
        console.log('city', city);
        var coords = projection([city.longitude, city.latitude]);
        city.x = coords[0];
        city.y = coords[1];
        city.weight = t.weight;
        city.color = RECEIVING_COLOR;

        nodes.push(city);
        linked.source = city;
        // linked.coordinates.push([city.longitude, city.latitude]);
      } else {
        foundSource.weight = t.weight;
        foundSource.color = RECEIVING_COLOR;
        linked.source = foundSource;
        // linked.coordinates.push([foundSource.longitude, foundSource.latitude]);
      }

      if (!foundDest) {
        var city = locations.find(l => l.name === t.dest);
        var coords = projection([city.longitude, city.latitude]);
        city.x = coords[0];
        city.y = coords[1];
        city.weight = t.weight;
        city.color = RECEIVING_COLOR;

        nodes.push(city);
        linked.target = city; 
        // linked.coordinates.push([city.longitude, city.latitude]);
      } else {
        // linked.coordinates.push([foundDest.longitude, foundDest.latitude]);
        foundDest.weight = t.weight;
        foundDest.color = RECEIVING_COLOR;
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

    var locationCircles = locationGroup.selectAll("circle")
      .data(locations, d => d)

    locationCircles.enter()
      .append("circle")
      .attr('class', 'location')
      .attr("r", 5)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .style("fill", FILL_COLOR)
      // .text(d => d.name)
      // .style("opacity", d => d.name === chosenLocation ? '1' : '0')
      .style("stroke", "#252525")
      .merge(locationCircles);

    var locationText = locationGroup.selectAll('text')
      .data(locations, d => d);
    
    locationText.enter().append("text")
      .attr("class", "location-text")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("dx", ".5em")
      .attr("dy", "1em")
      .text(d => {
        if (d.name.indexOf('other') >= 0) {
          return d.name.replace(/^other/, '');
        } else {
          return d.name.slice(0, d.name.length - 2)
        }
      })
      .merge(locationText);

    locationCircles.exit().remove();
    locationText.exit().remove();

    var maxDomain = d3.max(links, l => +l.target.weight);
    
    var lineWidthRange = d3.scaleLinear()
      .domain([0, maxDomain])
      .range([1, 6]);

    //This is the accessor function we talked about above
    var lineFunction = d3.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

    //The data for our line
    // var lineData = [ 
    //   { "x": 1,   "y": 5},  
    //   { "x": 20,  "y": 200}
    // ];

    var lineData = links.map(l => {
      l.lineData = [{
        x: l.source.x, y: l.source.y
      }, {
        x: l.target.x, y: l.target.y, weight: l.target.weight, color: l.target.color
      }];

      return l;
    });

    //The line SVG Path we draw
    var lines = lineGraph.selectAll("path")
      .data(lineData, d => d);

    lines.enter()
      .append("path")
      .attr("d", d => lineFunction(d.lineData))
      .attr("stroke", d => d.target.color)
      .attr("stroke-width", d => lineWidthRange(+d.target.weight) + 'px')
      .attr("fill", "none")
      .merge(lines);

    lines.exit().remove();

    var lineSize = d3.scaleLinear().domain([0, maxDomain]).range([1, 6]);

    svg.select('g.legendSizeLine').remove();

    svg.append("g")
      .attr("class", "legendSizeLine")
      .attr("transform", "translate(0, 500)");

    var legendSizeLine = d3.legendSize()
          .scale(lineSize)
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
}

