import Store from "./Store";
import drawStates from "./components/states";
import { drawColorLegend } from "./components/legend";
import { getDataSource } from "./fetchData";
import { drawBarChart } from "./components/barChart";
import { createSvg } from "./setup";
import { parseData } from "./parser";
import drawData from "./draw";

const svg = createSvg(".chart");
const store = new Store();

store.set("svg", svg);

drawColorLegend(svg);
drawStates(svg);

var selector = document.getElementById("select-location");

selector.onchange = evt => {
	var chosenLocation = evt.target.value;

	store.set("chosenLocation", chosenLocation);

	getDataSource(store).then(() => {
		// TODO rename method
		parseData(store);

		drawData(store);

		drawBarChart({
			data: store.get("counts"),
			selector: ".outgoing-trash"
		});
		drawBarChart({
			data: store.get("rCounts"),
			selector: ".incoming-trash"
		});
	});
};
