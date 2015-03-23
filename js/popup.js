var translate = {};

translate.pageDetailsReceived = function(pageDetails) {
	document.getElementById("content-lang").innerHTML = pageDetails.contentLang;

	if ( pageDetails.contentLang != '' ) {
		translate.getTranslation(pageDetails.contentLang, 'en', pageDetails.text);
	} else {
		// show status msg
		// display DDL for languages

	}
}

translate.getTranslation = function(from, to, text) {
	var xhr = new XMLHttpRequest(),
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

	xhr.open('GET', url, true);
	xhr.send();
}

translate.displayTranslation = function(data) {
	document.getElementById('response').innerHTML = JSON.stringify(data);
	var response = data.responseData;
	document.getElementById('translation').innerHTML = response.translatedText;
	document.getElementById('match').innerHTML = ((response.match * 100) + '%');

	translate.setMatchClass(response.match);
}

translate.setMatchClass = function(match) {
	var matchClass = '';
	match = match * 100;

	if (match >= 80) {
		matchClass = 'match-one';
	} else if (match >= 60) {
		matchClass = 'match-two';
	} else if (match >= 40) {
		matchClass = 'match-three';
	} else if (match >= 20) {
		matchClass = 'match-four';
	} else {
		matchClass = 'match-five';
	}

	document.querySelector('.match-wrapper').classList.add(matchClass);
}

window.addEventListener('load', function(event) {
	chrome.runtime.getBackgroundPage(function(eventPage) {
		eventPage.getPageDetails(translate.pageDetailsReceived);
	});
});