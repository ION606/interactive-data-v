// ----- helpers -------------------------------------------------------

// insert the 5-point likert radios anywhere we see <div class="likert">
document.querySelectorAll('.likert').forEach(div => {
	const tmpl = document.querySelector('#likertFive');
	div.append(tmpl.content.cloneNode(true));
	// give every radio a unique name derived from data-name
	const name = div.dataset.name;
	div.querySelectorAll('input[type="radio"]').forEach(radio => {
		radio.name = name;
		// Add event listener for checked class toggle
		radio.addEventListener('change', () => {
			div.querySelectorAll('label').forEach(label => label.classList.remove('checked'));
			if (radio.checked) {
				radio.parentElement.classList.add('checked');
			}
		});
	});
});

// toggle follow-up blocks
const updateFollowups = () => {
	document.querySelectorAll('.followup').forEach(block => {
		const values = block.dataset.value.split(','),
			triggerName = block.dataset.trigger,
			triggerInputs = document.querySelectorAll(`[name="${triggerName}"]`),
			triggerSelect = document.querySelector(`select[name="${triggerName}"]`);

		let current = '';

		if (triggerInputs.length) {
			const checked = Array.from(triggerInputs).find(i => i.checked);
			current = checked?.value ?? '';
		} else if (triggerSelect) {
			current = triggerSelect.value;
		}

		block.classList.toggle('open', values.includes(current));
	});
};

document.addEventListener('change', updateFollowups);
updateFollowups(); // run once at load

// ----- submission ----------------------------------------------------

const form = document.querySelector('#surveyForm');

form.addEventListener('submit', event => {
	if (!form.checkValidity()) {
		event.preventDefault(); // stop actual submit
		form.reportValidity();  // show browser errors
	} else {
		event.preventDefault(); // prevent default form submission
		const formData = new FormData(form);
		fetch('https://formspree.io/f/xblyabbv', {
			method: 'POST',
			body: formData,
			headers: {
				'Accept': 'application/json'
			}
		})
			.then(response => {
				if (response.ok) {
					alert('Thank you for completing the survey!');
					window.location.pathname = 'project/site';
				} else {
					response.json().then(data => {
						if (data.errors) {
							alert('Submission error: ' + data.errors.map(error => error.message).join(', '));
						} else {
							alert('Oops! There was a problem submitting your form.');
						}
					});
				}
			})
			.catch(err => {
				console.error(err);
				alert('Oops! There was a problem submitting your form.');
			});
	}
});
