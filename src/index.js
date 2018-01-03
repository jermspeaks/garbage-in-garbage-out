import Store from "./Store";
import createStates from './components/states';
import createColorLegend from './components/legend';
import drawLocation from './fetchData';
import { createSvg } from "./setup";

const svg = createSvg(".chart");
const store = new Store();

store.set('svg', svg);

createColorLegend(svg);
createStates(svg);  

var selector = document.getElementById("select-location");

selector.onchange = evt => {
  var chosenLocation = evt.target.value;

  drawLocation(chosenLocation, store);
};
