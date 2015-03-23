var getPageDetails = function(callback) {
	chrome.tabs.executeScript(null, { file: 'js/content.js' });
	chrome.runtime.onMessage.addListener(function(message) {
		callback(message);
	})
}

var eventPageTranslate = function(info, tab) {
	var from = "",
		to = "en",
		text = "";

	if (info.selectionText) {
		text = info.selectionText;
	}

	if (document.head.querySelectorAll('meta[name*=language]').length > 0) {
		from = document.head.querySelectorAll('meta[name*=language]')[0].content;
	} else if (document.querySelector('html').attributes.lang) {
		from = document.querySelector('html').attributes.lang.value;
	}


	var xhr = new XMLHttpRequest(),
		base = 'http://api.mymemory.translated.net/get',
		langpair = [from, to].join('|'),
		url = base + '?q=' + text + '&langpair=' + langpair;

	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var data = JSON.parse(xhr.responseText);
			console.log(data);
		} else {
			return;
		}
	}

	xhr.open('GET', url, true);
	xhr.send();


}



chrome.runtime.onInstalled.addListener(function() {
	var context = "all",
		title = "TranslateThis";

	var id = chrome.contextMenus.create({
		"id": "context" + context,
		// "documentUrlPatterns": ["http://*/*", "https://*/*"],
		"title": title,
		"contexts": [context]//,
		// "onclick": eventPageTranslate
	});	
});

chrome.contextMenus.onClicked.addListener(eventPageTranslate);

