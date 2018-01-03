export function parseLinks(links = []) {
	return links.map(l => {
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