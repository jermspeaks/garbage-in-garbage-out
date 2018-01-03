import * as d3 from "d3";
import drawData from "./draw";
import * as colors from "./constants/colors";

/**
 * @var {Store} Instance of store cache
 */
var _store;

const getStore = () => _store;
const setStore = store => _store = store;

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

/**
 * Fetches data for the chart
 * @param  {Store} store  Cache storage for all data
 */
function drawLocation(store) {
  setStore(store);

  // Grab from cache. Otherwise get from server
  if (store.get("locations")) {
    filterData(store);
  } else {
    d3
      .queue()
      .defer(d3.csv, "data/labels.csv", typeLocation)
      // .defer(d3.csv, "data/trash.csv")
      .defer(d3.json, "data/waste-cleaned.json")
      .defer(d3.json, "data/received-waste.json")
      .await(dataCallback);
  }
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

function dataCallback(error, locations, trashData, receivedTrashData) {
  if (error) {
    console.error(error);
    return;
  }

  var store = getStore();

  // Save data in cache
  if (!store.get("locations")) {
    store.set("locations", locations);
    store.set("trashData", trashData);
    store.set("receivedTrashData", receivedTrashData);
  }

  filterData(store);
}

function filterData(store) {
  const {
    locations,
    trashData,
    receivedTrashData,
    chosenLocation
  } = store.getStore();
  // const locations = store.get("locations");
  // const trashData = store.get("trashData");
  // const receivedTrashData = store.get("receivedTrashData");
  const projection = d3.geoAlbersUsa();
  // const chosenLocation = store.get("chosenLocation");
  const trash = filterTrash(chosenLocation, trashData);
  const rTrash = filterRTrash(chosenLocation, receivedTrashData);
  let nodes = [];
  let links = [];
  // console.log('locations', typeof locations);
  // console.log('trashData', typeof trashData);
  // console.log('receivedTrashData', typeof receivedTrashData);
  // console.log("sent trash", trash);
  // console.log("received trash", rTrash);

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

  drawData({ nodes, links, store });
}

export default drawLocation;
