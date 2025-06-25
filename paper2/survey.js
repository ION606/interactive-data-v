Chart.defaults.global.defaultFontColor = '#e0e0e0';
Chart.defaults.global.defaultFontFamily =
	'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const chartAreaBackground = {
	id: 'chartAreaBackground',
	beforeDraw: chart => {
		const { ctx, chartArea } = chart;
		ctx.save();
		ctx.fillStyle = '#1d1d1d'; // same shade you already use for the canvas
		ctx.fillRect(
			chartArea.left, chartArea.top,
			chartArea.right - chartArea.left,
			chartArea.bottom - chartArea.top
		);
		ctx.restore();
	}
};

/* fully-opaque colour palette for datasets */
const palette = [
	'#ff6384', '#36a2eb', '#ff9f40',
	'#4bc0c0', '#9966ff', '#ffcd56'
];

/* dom handles */
const chartsContainer = document.querySelector('#charts'),
	CSV_URL = 'data/survey_results.csv';

/* fetch + make charts */
fetch(CSV_URL)
	.then(r => r.text())
	.then(csvText => {
		const { data: raw } = Papa.parse(csvText, { header: true, skipEmptyLines: true }),
			byQuestion = new Map();

		raw.forEach(row => {
			const q = row.question ?? 'untitled';
			const opts = byQuestion.get(q) ?? [];
			opts.push(row);
			byQuestion.set(q, opts);
		});

		/* build a section per question */
		[...byQuestion.entries()].forEach(([question, rows], idx) => {
			/* keep options sorted asc (1,2,3…) for consistency */
			const sorted = [...rows].sort((a, b) => +a.option - +b.option);

			const labels = sorted.map(r => r.option),
				values = sorted.map(r => +r.count);

			// Get description and scale from the first row for this question
			const graphDescription = sorted[0].graph_description || '';
			const scale = sorted[0].scale || '';

			/* make markup */
			const section = document.createElement('section'),
				heading = document.createElement('h3'),
				desc = document.createElement('p'),
				scaleElem = document.createElement('p'),
				canvas = document.createElement('canvas');

			heading.textContent = question;
			desc.textContent = graphDescription;
			scaleElem.textContent = scale ? `Scale: ${scale}` : '';

			section.appendChild(heading);
			if (graphDescription) section.appendChild(desc);
			if (scale) section.appendChild(scaleElem);
			section.appendChild(canvas);
			chartsContainer.appendChild(section);
			renderTable('results-table', raw);

			/* draw */
			const config = {
				type: 'bar', // or whatever you already pass in
				data: {
					labels,
					datasets: [{
						label: 'responses',
						data: values,
						backgroundColor: palette, // opaque!
						borderColor: palette,
						borderWidth: 1
					}]
				},
				options: {
					responsive: true,
					legend: { labels: { fontColor: '#e0e0e0' } },
					scales: {
						xAxes: [{
							gridLines: { color: 'rgba(224,224,224,0.15)' },
							ticks: { fontColor: '#e0e0e0' }
						}],
						yAxes: [{
							gridLines: { color: 'rgba(224,224,224,0.15)' },
							ticks: { beginAtZero: true, fontColor: '#e0e0e0' }
						}]
					}
				},
				plugins: [chartAreaBackground]
			};

			new Chart(canvas.getContext('2d'), config);
		});
	})
	.catch(console.error);

/* make a semantic <thead><tbody> table */
function renderTable(tableId, rows) {
	const table = document.querySelector(`#${tableId}`);
	table.textContent = ''; // clears any previous render

	const thead = document.createElement('thead');
	const headerRow = document.createElement('tr');
	Object.keys(rows[0]).forEach(col => {
		const th = document.createElement('th');
		th.textContent = col;
		headerRow.appendChild(th);
	});
	thead.appendChild(headerRow);
	table.appendChild(thead);

	const tbody = document.createElement('tbody');
	rows.forEach(row => {
		const tr = document.createElement('tr');
		for (const value of Object.values(row)) {
			const td = document.createElement('td');
			td.textContent = value;
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	});
	table.appendChild(tbody);
}