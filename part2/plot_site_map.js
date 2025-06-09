// ascii-layout.js
const labels = [
	'Home tab'
	, 'Network Centrality tab'
	, 'Ladder Flow tab'
	, 'Regional Diversity tab'
	, 'Home page'
	, 'Centrality page'
	, 'Ladder page'
	, 'Diversity page'
	, 'Centrality card'
	, 'Ladder card'
	, 'Diversity card'
	, 'centrality-network'
	, 'centrality-bars'
	, 'ladder-line'
	, 'ladder-area'
	, 'diversity-bars'
	, 'diversity-area'
];

const rawLinks = [
	/* nav → pages */
	[0, 4, 1]
	, [1, 5, 1]
	, [2, 6, 1]
	, [3, 7, 1]
	/* home cards → pages */
	, [4, 8, 1]
	, [4, 9, 1]
	, [4, 10, 1]
	, [8, 5, 1]
	, [9, 6, 1]
	, [10, 7, 1]
	/* pages → graphs */
	, [5, 11, 1]
	, [5, 12, 1]
	, [6, 13, 1]
	, [6, 14, 1]
	, [7, 15, 1]
	, [7, 16, 1]
	/* same-data pairs (dashed in DOT; just light links here) */
	, [11, 12, 0.2]
	, [13, 14, 0.2]
	, [15, 16, 0.2]
];

// build an adjacency map from rawLinks
function buildAdjacency(links) {
	const adj = new Map();
	for (const [src, dst, weight] of links) {
		if (!adj.has(src)) adj.set(src, []);
		adj.get(src).push({ dst, weight });
	}
	return adj;
}

// render ascii edges for a given source
function renderEdges(srcIdx, edges) {
	let out = `\n${labels[srcIdx]}\n`;
	for (const { dst, weight } of edges) {
		const w = weight % 1 === 0 ? String(weight) : weight.toFixed(1);
		out += `  ├─${w}→ ${labels[dst]}\n`;
	}
	return out;
}

export function drawLayoutAscii() {
	const container = document.querySelector('#layout-graph-ascii');
	const adjMap = buildAdjacency(rawLinks);
	let ascii = '';

	for (const [src, edges] of adjMap) {
		ascii += renderEdges(src, edges);
	}

	if (container) {
		container.textContent = ascii;
	} else {
		// fallback to console
		console.log(ascii);
	}
}

// auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => drawLayoutAscii());
