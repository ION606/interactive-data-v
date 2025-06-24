import {
	select,
	scaleLinear,
	scaleBand,
	max,
	forceSimulation,
	forceLink,
	forceManyBody,
	forceCenter,
	drag,
} from 'https://cdn.skypack.dev/d3@7';

let useCircleLayout = false;

document.addEventListener('DOMContentLoaded', () => {
	initCharts();
	wireRoleTabs();
	wireViewTabs();
	wirePageTabs();
	drawCentralityNetwork();

	document
		.getElementById('toggle-layout-btn')
		.addEventListener('click', () => {
			useCircleLayout = !useCircleLayout;
			drawCentralityNetwork();
		});

	window.addEventListener('resize', drawCentralityNetwork);

	const homeGrid = document.getElementById('homegrid');
	if (homeGrid) {
		homeGrid.addEventListener('click', (evt) => {
			const card = evt.target.closest('.card');
			if (card && homeGrid.contains(card)) {
				if (!card.dataset.role) return;
				let tab = card.dataset.role;

				if (tab) {
					const btn = document.querySelector(`#page-tabs button[data-role="${tab}"]`);
					btn?.click();
				}
			}
		});
	}
});

const darkCardLayout = {
	paper_bgcolor: '#1e293b',
	plot_bgcolor: '#1e293b',
	font: { color: '#f1f5f9' },   // light text everywhere
	xaxis: {
		title: { text: 'Year', standoff: 10 },
		tickfont: { color: '#f1f5f9' },
		automargin: true
	},
	yaxis: {
		title: { text: 'Contributors', standoff: 15 },
		tickfont: { color: '#f1f5f9' },
		automargin: true
	},
	margin: { t: 40, l: 60, r: 20, b: 60 }
};

// select the main elements for tab navigation
const pageTabs = document.querySelector('#page-tabs'),
	sections = document.querySelectorAll('section[data-role]');

// handle tab clicks to switch between pages
pageTabs.addEventListener('click', (evt) => {
	const target = evt.target;

	// check if a button with data-role was clicked
	if (target.matches('button[data-role]')) {
		const selectedRole = target.getAttribute('data-role');

		// remove active class from all buttons
		pageTabs.querySelectorAll('button').forEach(btn => {
			btn.classList.remove('active');
		});

		// add active class to clicked button
		target.classList.add('active');

		// show/hide sections
		sections.forEach(sec => {
			if (sec.getAttribute('data-role') === selectedRole) {
				sec.classList.add('active');
			} else {
				sec.classList.remove('active');
			}
		});

		// Redraw network only when switching to centrality tab
		if (selectedRole === 'centrality') {
			drawCentralityNetwork();
		}

		if (selectedRole === "info") {
			import("/part2/tutorial.js")
				.then((module) => {
					console.log("Tutorial module loaded");
				})
				.catch((err) =>
					console.error(
						"Failed to load tutorial module",
						err
					)
				);
		}
	}
});

// function to draw a force-directed graph in #centrality-network
function drawCentralityNetwork() {
	const networkContainer = document.querySelector('#centrality-network'),
		barsContainer = document.querySelector('#centrality-bars');

	// Only draw if container is visible
	if (
		!networkContainer.offsetParent ||
		!barsContainer.offsetParent ||
		barsContainer.clientWidth === 0 ||
		barsContainer.clientHeight === 0
	) {
		return;
	}

	// Remove old SVGs if present
	networkContainer.innerHTML = '';
	barsContainer.innerHTML = '';

	// dimensions for bar chart
	const marginBars = { top: 20, right: 20, bottom: 40, left: 80 },
		widthBars = barsContainer.clientWidth - marginBars.left - marginBars.right,
		heightBars = barsContainer.clientHeight - marginBars.top - marginBars.bottom;

	// create an svg for bar chart
	const svgBars = select(barsContainer)
		.append('svg')
		.attr('width', barsContainer.clientWidth)
		.attr('height', barsContainer.clientHeight)
		.append('g')
		.attr('transform', `translate(${marginBars.left},${marginBars.top})`);

	// placeholder scales (will set domains after data loads)
	const xScale = scaleBand().padding(0.1).range([0, widthBars]),
		yScale = scaleLinear().range([heightBars, 0]);

	// axes groups
	const xAxisGroup = svgBars.append('g')
		.attr('transform', `translate(0, ${heightBars})`);
	const yAxisGroup = svgBars.append('g');

	// use centralityData for nodes, and generate links randomly
	const nodes = centralityData.map((d, i) => ({
		id: `node-${i + 1}`,
		name: `Node ${i + 1}`,
		centrality: d.centrality
	}));

	// random links
	const links = [];
	for (let i = 0; i < nodes.length - 1; i++) {
		links.push({
			source: nodes[i].id,
			target: nodes[i + 1].id
		});
	}

	const interCons = Math.ceil(Math.random() * nodes.length);

	for (let i = 0; i < Math.max(interCons, Math.ceil(nodes.length / 2)); i++) {
		const a = Math.floor(Math.random() * nodes.length);
		const b = Math.floor(Math.random() * nodes.length);
		if (a !== b) {
			links.push({
				source: nodes[a].id,
				target: nodes[b].id
			});
		}
	}

	if (useCircleLayout) {
		// Circular layout
		networkContainer.innerHTML = '';
		const svgNet = select(networkContainer)
			.append('svg')
			.attr('width', networkContainer.clientWidth)
			.attr('height', networkContainer.clientHeight);

		const radius = Math.min(networkContainer.clientWidth, networkContainer.clientHeight) / 2.5,
			centerX = networkContainer.clientWidth / 2,
			centerY = networkContainer.clientHeight / 2;

		nodes.forEach((d, i) => {
			const angle = (2 * Math.PI * i) / nodes.length;
			d.x = centerX + radius * Math.cos(angle);
			d.y = centerY + radius * Math.sin(angle);
		});

		// draw links
		svgNet
			.append('g')
			.attr('class', 'links')
			.selectAll('line')
			.data(links)
			.enter()
			.append('line')
			.attr('stroke', '#888')
			.attr('stroke-width', 1)
			.attr('x1', d => nodes.find(n => n.id === d.source).x)
			.attr('y1', d => nodes.find(n => n.id === d.source).y)
			.attr('x2', d => nodes.find(n => n.id === d.target).x)
			.attr('y2', d => nodes.find(n => n.id === d.target).y);

		// draw nodes
		const nodeGroup = svgNet
			.append('g')
			.attr('class', 'nodes')
			.selectAll('g')
			.data(nodes)
			.enter()
			.append('g')
			.attr('transform', d => `translate(${d.x},${d.y})`);

		nodeGroup
			.append('circle')
			.attr('r', d => 5 + d.centrality * 10)
			.attr('fill', '#6366f1');

		nodeGroup
			.append('text')
			.text(d => d.name)
			.attr('fill', '#fff')
			.attr('font-size', 10)
			.attr('text-anchor', 'middle')
			.attr('dy', -12);
	} else {
		// --- Original force-directed layout ---
		const svgNet = select(networkContainer)
			.append('svg')
			.attr('width', networkContainer.clientWidth)
			.attr('height', networkContainer.clientHeight)
			.append('g');

		// set up forces
		const simulation = forceSimulation(nodes)
			.force('link', forceLink(links).id(d => d.id).distance(50).strength(0.1))
			.force('charge', forceManyBody().strength(-100))
			.force('center', forceCenter(window.innerWidth / 2, 320));

		// draw links
		const linkElements = svgNet
			.append('g')
			.attr('class', 'links')
			.selectAll('line')
			.data(links)
			.enter()
			.append('line')
			.attr('stroke', '#888')
			.attr('stroke-width', 1);

		// draw nodes
		const nodeGroup = svgNet
			.append('g')
			.attr('class', 'nodes')
			.selectAll('g')
			.data(nodes)
			.enter()
			.append('g')
			.call(drag()
				.on('start', dragStarted)
				.on('drag', dragged)
				.on('end', dragEnded));

		const nodeElements = nodeGroup
			.append('circle')
			.attr('r', d => 5 + d.centrality * 10)
			.attr('fill', '#6366f1');

		// add node names as labels
		nodeGroup
			.append('text')
			.text(d => d.name)
			.attr('fill', '#fff')
			.attr('font-size', 10)
			.attr('text-anchor', 'middle')
			.attr('dy', -12);

		// simple tooltip on hover
		nodeElements
			.append('title')
			.text(d => `${d.name}: ${(d.centrality).toFixed(3)}`);

		// simulation tick handler
		simulation.on('tick', () => {
			linkElements
				.attr('x1', d => d.source.x)
				.attr('y1', d => d.source.y)
				.attr('x2', d => d.target.x)
				.attr('y2', d => d.target.y);

			nodeGroup
				.attr('transform', d => `translate(${d.x},${d.y})`);
		});

		// drag event functions
		function dragStarted(event, d) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}
		function dragged(event, d) {
			d.fx = event.x;
			d.fy = event.y;
		}
		function dragEnded(event, d) {
			if (!event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}
	}

	// ---- secondary: draw bar chart of centrality scores in barsContainer ----

	// sort nodes by descending centrality
	const nodesSorted = [...nodes].sort((a, b) => b.centrality - a.centrality);

	// set scale domains
	xScale.domain(nodesSorted.map(d => d.name));
	yScale.domain([0, max(nodesSorted, d => d.centrality)]);

	// append bars
	svgBars.selectAll('.bar')
		.data(nodesSorted)
		.enter()
		.append('rect')
		.attr('class', 'bar')
		.attr('x', d => xScale(d.name))
		.attr('y', d => yScale(d.centrality))
		.attr('width', xScale.bandwidth())
		.attr('height', d => heightBars - yScale(d.centrality))
		.attr('fill', '#34d399')
		.style('cursor', 'pointer')
		.on('mouseover', function (event, d) {
			select(this)
				.attr('fill', '#6366f1');
			tooltip
				.style('opacity', 1)
				.html(`<strong>${d.name}</strong><br>Centrality: ${d.centrality.toFixed(3)}`)
				.style('left', (event.pageX + 10) + 'px')
				.style('top', (event.pageY - 28) + 'px');

			// Highlight corresponding node in the network graph
			const svgNet = select(networkContainer).select('svg');
			if (svgNet.size()) {
				svgNet.selectAll('g.nodes > g').each(function (nodeDatum) {
					if (nodeDatum && nodeDatum.name === d.name) {
						select(this).select('circle')
							.attr('stroke', '#fbbf24')
							.attr('stroke-width', 4);
					}
				});
			}
		})
		.on('mousemove', function (event) {
			tooltip
				.style('left', (event.pageX + 10) + 'px')
				.style('top', (event.pageY - 28) + 'px');
		})
		.on('mouseout', function (event, d) {
			select(this)
				.attr('fill', '#34d399');
			tooltip.style('opacity', 0);

			// Remove highlight from all nodes in the network graph
			const svgNet = select(networkContainer).select('svg');
			if (svgNet.size()) {
				svgNet.selectAll('g.nodes > g').each(function () {
					select(this).select('circle')
						.attr('stroke', null)
						.attr('stroke-width', null);
				});
			}
		})
		.on('click', function (event, d) {
			svgBars.selectAll('.bar').attr('fill', '#34d399'); // reset all
			select(this).attr('fill', '#f59e42'); // highlight selected
			console.debug('Selected:', d);
		});

	// Tooltip div (add once)
	const tooltip = select('body').append('div')
		.attr('class', 'bar-tooltip')
		.style('position', 'absolute')
		.style('background', '#1e293b')
		.style('color', '#fff')
		.style('padding', '6px 12px')
		.style('border-radius', '6px')
		.style('pointer-events', 'none')
		.style('font-size', '0.9rem')
		.style('opacity', 0);

	// axis labels (optional)
	svgBars.append('text')
		.attr('x', widthBars / 2)
		.attr('y', heightBars + marginBars.bottom - 5)
		.attr('text-anchor', 'middle')
		.text('Node Name')
		.attr('fill', '#fff');

	svgBars.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('x', -heightBars / 2)
		.attr('y', -marginBars.left + 15)
		.attr('text-anchor', 'middle')
		.text('Centrality')
		.attr('fill', '#fff');
}



/* dummy datasets – expanded */
const centralityData = Array.from({ length: 45 }, (_, i) => ({
	degree: 4 + i * 2,
	centrality: +(Math.random() * .65).toFixed(2),
	role: i < 20 ? 'contributor' : 'maintainer'
})),
	ladderFlowData = Array.from({ length: 6 * 3 }, (_, i) => ({
		month: (i % 6) + 1,
		level: ['outsider', 'rising', 'core'][Math.floor(i / 6)],
		count: Math.floor(Math.random() * 80) + 10
	})),
	diversityData = Array.from({ length: 6 * 4 }, (_, i) => ({
		month: (i % 6) + 1,
		region: ['na', 'eu', 'apac', 'latam'][Math.floor(i / 6)],
		contributors: Math.floor(Math.random() * 140) + 20
	}));

/* chart initialisation */
function initCharts() {
	const ladderData = ladderFlowSeries('line');
	const ladderAreaData = ladderFlowSeries('area');
	const diversityAreaData = diversitySeries('area');

	Plotly.newPlot(
		qs('#ladder-line'),
		ladderData,
		{ ...darkCardLayout, title: 'Ladder Flow – Line' },
		{ responsive: true }
	);

	Plotly.newPlot(
		qs('#diversity-area'),
		diversityAreaData,
		{ ...darkCardLayout, title: 'Regional Diversity' },
		{ responsive: true }
	);
}

/* helpers ----------------------------------------------------------- */
function ladderFlowSeries(style = 'line') {
	const colors = {
		outsider: '#60a5fa',   // blue
		rising: '#f59e42',   // orange
		core: '#34d399'    // green
	};
	return uniq(ladderFlowData.map(d => d.level)).map(level => ({
		name: level,
		x: ladderFlowData.filter(d => d.level === level).map(d => d.month),
		y: ladderFlowData.filter(d => d.level === level).map(d => d.count),
		type: 'scatter',
		mode: 'lines+markers',
		fill: style === 'area' ? 'tonexty' : undefined,
		line: {
			color: colors[level],
			width: 2
		},
		fillcolor: style === 'area'
			? colors[level] + 'cc' // alpha --> transparency
			: undefined,
		marker: {
			size: 10,
			color: '#fff',
			line: {
				width: 2,
				color: colors[level]
			}
		}
	}));
}

function diversitySeries(style = 'bar') {
	return uniq(diversityData.map(d => d.region)).map(region => ({
		name: region,
		x: diversityData.filter(d => d.region === region).map(d => d.month),
		y: diversityData.filter(d => d.region === region).map(d => d.contributors),
		type: style
	}));
}

function uniq(arr) { return [...new Set(arr)]; }

/* role-tabs – unchanged */
function wireRoleTabs() {
	qsAll('#role-tabs button').forEach(btn => {
		btn.addEventListener('click', () => {
			qsAll('#role-tabs button').forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			const role = btn.dataset.role;
			qsAll('main section').forEach(sec => {
				sec.classList.toggle('active', sec.dataset.role === role);
			});
		});
	});
}

/* new: per-card view switcher */
function wireViewTabs() {
	qsAll('.view-tabs').forEach(nav => {
		const btns = [...nav.querySelectorAll('button')],
			card = nav.closest('.card');
		btns.forEach(btn => {
			btn.addEventListener('click', () => {
				btns.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				const target = btn.dataset.target;
				card.querySelectorAll('.graph').forEach(div => {
					div.classList.toggle('hidden', div.id !== target);
				});
			});
		});
	});
}

/* new: page-tabs switcher */
function wirePageTabs() {
	const btns = document.querySelectorAll('#page-tabs button');
	const sections = document.querySelectorAll('main section');
	btns.forEach(btn => {
		btn.addEventListener('click', () => {
			btns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			const role = btn.dataset.role;
			sections.forEach(sec => {
				sec.classList.toggle('active', sec.dataset.role === role);
			});
		});
	});
}

/* dom helpers */
const qs = sel => document.querySelector(sel),
	qsAll = sel => document.querySelectorAll(sel);

const origPlotlyNewPlot = Plotly.newPlot;
Plotly.newPlot = function (container, data, layout = {}, config) {
	try {
		layout.legend = layout.legend || {};
		layout.legend.font = layout.legend.font || {};
		// layout.legend.font.color = '#fff';
		// layout.legend.background = '#000'
		return origPlotlyNewPlot(container, data, layout, config);
	}
	catch (err) {
		console.error(err);
		return null;
	}
};
