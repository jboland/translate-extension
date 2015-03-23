var contentLang = "",
	text = "";

if (document.head.querySelectorAll('meta[name*=language]').length > 0) {
	contentLang = document.head.querySelectorAll('meta[name*=language]')[0].content;
} else if (document.querySelector('html').attributes.lang) {
	contentLang = document.querySelector('html').attributes.lang.value;
}

text = window.getSelection().toString();

chrome.runtime.sendMessage({
	'contentLang': contentLang,
	'text': text
})