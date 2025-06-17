const form = document.querySelector('#surveyForm');
const followups = document.querySelectorAll('.followup');

// utility: show followup when trigger field matches any of its data-value list
function updateFollowups(event) {
	const { name, value } = event.target,
		els = document.querySelectorAll(`[data-trigger="${name}"]`);

	els.forEach(div => {
		const validValues = div.dataset.value.split(',');
		if (validValues.includes(value)) {
			div.classList.add('open'); // slide down (open)
		} else {
			div.classList.remove('open'); // slide up (close)
			// clear fields inside hidden followup
			div.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
		}
	});
}

// attach listeners to all relevant inputs/selects
form.querySelectorAll('input[type="radio"], select').forEach(el => {
	el.addEventListener('change', updateFollowups);
});

// basic client-side validation feedback
form.addEventListener('submit', event => {
	if (!form.checkValidity()) {
		event.preventDefault(); // stop actual submit
		form.reportValidity();  // show browser errors
	} else {
		event.preventDefault(); // prevent default form submission
		const formData = new FormData(form);
		fetch('https://formspree.io/f/mzzgvzyp', {
			method: 'POST',
			body: formData,
			headers: {
				'Accept': 'application/json'
			}
		})
			.then(response => {
				if (response.ok) {
					alert('Thank you for completing the survey!');
					form.reset();
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
