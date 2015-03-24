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

translate.handleError = function(data) {
	console.log(data);
	if (data.responseDetails == "PLEASE SELECT TWO DISTINCT LANGUAGES") {
		// status : manually select source language
		document.getElementById('languages-wrapper').classList.remove('hidden');
		document.getElementById('status-message').classList.remove('hidden');
		document.getElementById('status-message').innerText = 'Please select the language you are translating from';
	} else if (data.responseDetails.indexOf("NO QUERY SPECIFIED") > -1) {
		// status : please make a selection
	} else {

	}
}

window.addEventListener('load', function(event) {
	chrome.runtime.getBackgroundPage(function(eventPage) {
		eventPage.getPageDetails(translate.pageDetailsReceived);
	});
});