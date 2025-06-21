const tabBar = document.querySelector('#page-tabs'),
	buttons = tabBar.querySelectorAll('button'),
	panels = document.querySelectorAll('section[data-role]');

function activate(role) {
	/* toggle classes and aria */
	buttons.forEach(btn => {
		const active = btn.dataset.role === role;
		btn.classList.toggle('active', active);
		btn.setAttribute('aria-selected', active);
	});
	panels.forEach(pnl => {
		pnl.classList.toggle('active', pnl.dataset.role === role);
	});
}

tabBar.addEventListener('click', e => {
	const target = e.target;
	if (!target.matches('button')) { return; }
	activate(target.dataset.role);
});

/* ?tab=impact */
const urlTab = new URL(location.href).searchParams.get('tab');
if (urlTab) { activate(urlTab); }
