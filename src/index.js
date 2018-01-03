import Store from "./Store";
import drawStates from './components/states';
import { drawColorLegend } from './components/legend';
import drawLocation from './fetchData';
import { createSvg } from "./setup";

const svg = createSvg(".chart");
const store = new Store();

store.set('svg', svg);

drawColorLegend(svg);
drawStates(svg);  

var selector = document.getElementById("select-location");

selector.onchange = evt => {
  var chosenLocation = evt.target.value;

  drawLocation(chosenLocation, store);
};
