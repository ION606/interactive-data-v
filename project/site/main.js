import Chart from 'https://esm.run/chart.js/auto';

async function loadData() {
	const [labels, probabilities] = await Promise.all([
		fetch('./data/labels.json').then(r => r.json()),
		fetch('./data/probabilities.json').then(r => r.json())
	]);
	return { labels, probabilities };
}

(async () => {
	const { labels, probabilities } = await loadData();
	// select dom elements
	const thresholdInput = document.querySelector('#threshold'),
		thresholdVal = document.querySelector('#th-val'),
		tnEl = document.querySelector('#tn'),
		fpEl = document.querySelector('#fp'),
		fnEl = document.querySelector('#fn'),
		tpEl = document.querySelector('#tp'),
		precisionEl = document.querySelector('#precision'),
		recallEl = document.querySelector('#recall'),
		f1El = document.querySelector('#f1'),
		prCtx = document.querySelector('#pr-chart').getContext('2d');

	// chart instance placeholder
	let prChart;

	// listen for slider changes
	thresholdInput.addEventListener('input', () => {
		const thr = parseFloat(thresholdInput.value);
		thresholdVal.textContent = thr.toFixed(2);
		updateMetrics(thr);
	});

	// initial render
	updateMetrics(parseFloat(thresholdInput.value));

	function updateMetrics(thr) {
		// compute preds & confusion counts
		const preds = probabilities.map(p => p >= thr ? 1 : 0);
		let tn = 0, fp = 0, fn = 0, tp = 0;

		preds.forEach((pred, i) => {
			const actual = labels[i];
			if (actual === 0 && pred === 0) tn += 1;
			else if (actual === 0 && pred === 1) fp += 1;
			else if (actual === 1 && pred === 0) fn += 1;
			else if (actual === 1 && pred === 1) tp += 1;
		});

		// update confusion matrix
		tnEl.textContent = tn;
		fpEl.textContent = fp;
		fnEl.textContent = fn;
		tpEl.textContent = tp;

		// compute precision, recall, f1
		const precision = tp + fp === 0 ? 0 : tp / (tp + fp),
			recall = tp + fn === 0 ? 0 : tp / (tp + fn),
			f1 = precision + recall === 0
				? 0
				: 2 * precision * recall / (precision + recall);

		// update KPI display
		precisionEl.textContent = precision.toFixed(2);
		recallEl.textContent = recall.toFixed(2);
		f1El.textContent = f1.toFixed(2);

		// recompute full PR curve data
		const { precisions, recalls, thresholds } = computePRCurve(labels, probabilities);

		// draw or update PR curve, pass current threshold
		drawPRCurve(precisions, recalls, thresholds, thr);
	}

	function computePRCurve(labelsArr, probsArr) {
		// unique sorted thresholds from 0 to 1
		const thresholds = [];
		for (let t = 0; t <= 1.0001; t += 0.01) {
			thresholds.push(parseFloat(t.toFixed(2)));
		}

		const precisions = [];
		const recalls = [];

		thresholds.forEach(th => {
			let tp = 0, fp = 0, fn = 0;
			probsArr.forEach((p, i) => {
				const pred = p >= th ? 1 : 0;
				const actual = labelsArr[i];
				if (actual === 1 && pred === 1) tp += 1;
				if (actual === 0 && pred === 1) fp += 1;
				if (actual === 1 && pred === 0) fn += 1;
			});
			const prec = tp + fp === 0 ? 1 : tp / (tp + fp);
			const rec = tp + fn === 0 ? 0 : tp / (tp + fn);
			precisions.push(prec);
			recalls.push(rec);
		});

		return { precisions, recalls, thresholds };
	}

	function drawPRCurve(precisionArr, recallArr, thresholds, currentThr) {
		// prepare scatter dataset
		const dataPoints = recallArr.map((r, i) => ({ x: r, y: precisionArr[i] }));

		// Find the closest threshold index to currentThr
		const idx = thresholds.findIndex(t => Math.abs(t - currentThr) < 0.005);
		const marker = idx !== -1 ? [{ x: recallArr[idx], y: precisionArr[idx] }] : [];

		const cfg = {
			type: 'scatter',
			data: {
				datasets: [
					{
						label: 'PR Curve',
						data: dataPoints,
						showLine: true,
						fill: false,
						pointRadius: 0,
						borderColor: '#0072B2'
					},
					{
						label: 'Current Threshold',
						data: marker,
						pointBackgroundColor: '#D55E00',
						pointRadius: 6,
						type: 'scatter',
						showLine: false
					}
				]
			},
			options: {
				scales: {
					x: {
						type: 'linear',
						position: 'bottom',
						title: { display: true, text: 'recall' }
					},
					y: {
						title: { display: true, text: 'precision' }
					}
				},
				plugins: {
					legend: { display: false }
				},
				animation: false
			}
		};

		if (prChart) {
			prChart.data.datasets[0].data = dataPoints;
			prChart.data.datasets[1].data = marker;
			prChart.update();
		} else {
			prChart = new Chart(prCtx, cfg);
		}
	}
})()