import { geoAlbersUsa, csv, json, queue } from "d3";
import * as colors from "./constants/colors";

export function parseLinks(links = []) {
	return links.map(l => {
		// console.log('l', l);
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
}

function filterOutgoingTrash(source, trashData) {
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

function filterReceivingTrash(source, trashData) {
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

export function parseData(store) {
  const {
    locations,
    trashData,
    receivedTrashData,
    chosenLocation
  } = store.getStore();
  const projection = geoAlbersUsa();
  const outgoingTrash = filterOutgoingTrash(chosenLocation, trashData);
  const receivedTrash = filterReceivingTrash(chosenLocation, receivedTrashData);
  let nodes = [];
  let links = [];
  let counts = [];
  let rCounts = [];

  outgoingTrash.forEach(t => {
    counts.push({
      name: t.dest,
      value: parseInt(t.weight, 10)
    })
  });

  receivedTrash.forEach(t => {
  	rCounts.push({
  		name: t.source,
  		value: parseInt(t.weight, 10)
  	})
  });

  outgoingTrash.forEach(t => {
    // --- Add paths
    // Format of object is an array of objects, each containing
    //  a type (LineString - the path will automatically draw a greatArc)
    //  and coordinates
    let linked = {
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

  receivedTrash.forEach(t => {
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

  // Cache results
  store.set('nodes', nodes);
  store.set('links', links);
  store.set('counts', counts);
  store.set('rCounts', rCounts);
  
  return { nodes, links, counts };
}