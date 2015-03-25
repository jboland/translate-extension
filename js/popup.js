var translate = {
	contentLang: '',
	toLang: 'en',
	text: '',
	displayLang: ''
};

translate.pageDetailsReceived = function(pageDetails) {
	// set text property on object for use elsewhere
	translate.text = pageDetails.text;
	
	if ( pageDetails.contentLang != '' ) {
		// trim contentLang to 2-letter code (eg en vs en-US) -- API only needs two-letter code
		if (pageDetails.contentLang.length > 2) {
			console.log('in contentlang if', pageDetails);
			translate.contentLang = pageDetails.contentLang.substring(0,2);
		} else {
			translate.contentLang = pageDetails.contentLang;
		}

		translate.setDisplayLang();

		document.getElementById("content-lang").innerText = translate.displayLang;
		document.querySelector('#languages-wrapper select').value = translate.contentLang;
		translate.getTranslation();
	} else {
		// show status msg
		// display DDL for languages
		translate.handleError({}, true);
	}
}

translate.getTranslation = function() {
	var xhr = new XMLHttpRequest(),
		to = translate.toLang,
		text = translate.text,
		from = translate.contentLang,
		base = 'http://api.mymemory.translated.net/get',
		langpair = [from, to].join('|'),
		url = base + '?q=' + text + '&langpair=' + langpair;

	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var data = JSON.parse(xhr.responseText);
			translate.displayTranslation(data);
		} else {
			return;
		}
	}
	document.body.classList.add('loading');
	//document.getElementById('spinner').classList.toggle('hidden');
	xhr.open('GET', url, true);
	xhr.send();
}

translate.displayTranslation = function(data) {
	//document.getElementById('spinner').classList.toggle('hidden');
	document.body.classList.remove('loading');
	if (data.responseStatus === 200) {
		// dump raw data for debugging
		document.getElementById('response').innerHTML = JSON.stringify(data);
		
		var response = data.responseData;
		document.getElementById('translation').innerHTML = response.translatedText;
		document.querySelector('.match-wrapper').innerHTML = ((response.match * 100) + '%');

		translate.setMatchClass(response.match);
	 } else {
	 	translate.handleError(data);
	 }
}

translate.setMatchClass = function(match) {
	var hue = 120 * match;
	document.querySelector('.match-wrapper').style.borderBottomColor = 'hsla(' + hue + ', 75%, 50%, 1)';
}

translate.handleError = function(data, noLang) {
	console.log(data);
	if (data.responseDetails == "PLEASE SELECT TWO DISTINCT LANGUAGES" || noLang) {
		// status : manually select source language
		document.getElementById('languages-wrapper').classList.remove('hidden');
		document.getElementById('status-message').classList.remove('hidden');
		document.getElementById('status-message').innerText = 'Please select the language you are translating from';
	} else if (data.responseDetails.indexOf("NO QUERY SPECIFIED") > -1) {
		// status : please make a selection
		document.getElementById('status-message').classList.remove('hidden');
		document.getElementById('status-message').innerText = 'Please select a word or phrase you would like translated and try again.';
	} else {
		document.getElementById('status-message').classList.remove('hidden');
		document.getElementById('status-message').innerText = 'Something went wrong with your request.  Please try again.';
	}
}

translate.setDisplayLang = function() {
	var displayLang = document.querySelector('option[value=' + translate.contentLang + ']');
	if (displayLang) {
		translate.displayLang = displayLang.innerText;
	} else {
		translate.displayLang = translate.contentLang;
	}
	return;
}

translate.bindEvents = function() {
	document.querySelector('#languages-wrapper select').addEventListener('change', function(event) {
		console.log(event);
		var newLang = event.target.value;
		translate.contentLang = newLang;
		translate.setDisplayLang();
		document.getElementById('content-lang').innerText = translate.displayLang;
		document.getElementById('languages-wrapper').classList.toggle('hidden');
		translate.getTranslation();
	});

	document.querySelector('.fa-pencil').addEventListener('click', function(event) {
		document.querySelector('#languages-wrapper').classList.toggle('hidden');
	});
}

window.addEventListener('load', function(event) {
	chrome.runtime.getBackgroundPage(function(eventPage) {
		eventPage.getPageDetails(translate.pageDetailsReceived);
	});

	translate.bindEvents();
});