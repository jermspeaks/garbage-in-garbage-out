import { max } from "d3";
import { drawLinks, drawCircles, drawLabels } from "./components/locations";
import { drawLinkGuideLegend } from "./components/legend";
import { parseLinks } from "./parser";

function drawData(store) {
	const svg = store.get('svg');
	const nodes = store.get('nodes');
	const links = store.get('links');
	const maxDomainTarget = max(links, l => +l.target.weight);
	const maxDomainSource = max(links, l => +l.source.weight);
	const maxDomainWithoutLimit =
		maxDomainTarget >= maxDomainSource ? maxDomainTarget : maxDomainSource;
	const maxDomain = maxDomainWithoutLimit <= 100 ? 100 : maxDomainWithoutLimit;

	drawLinks({ data: parseLinks(links), svg, maxDomain });
	drawCircles({ data: nodes, svg, maxDomain });
	drawLabels({ data: nodes, svg, store, maxDomain });
	drawLinkGuideLegend({ svg, maxDomain });
}

export default drawData;
